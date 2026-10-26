import logging
import os
import secrets
import time
from contextlib import asynccontextmanager
from uuid import UUID

from fastapi import Depends, FastAPI, Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import ValidationError
from sqlalchemy import select, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from starlette.exceptions import HTTPException

from .db import engine, get_db
from .models import JournalEntry
from .schemas import EntryCreate, EntryOut, EntryPatch

logger = logging.getLogger("journal.requests")
logging.basicConfig(level=logging.INFO, format="%(message)s")


@asynccontextmanager
async def lifespan(app):
    if len(os.environ.get("API_TOKEN", "")) < 24:
        raise RuntimeError("Configure API_TOKEN with at least 24 characters")
    yield


app = FastAPI(title="My Journal API", version="1.0.0", lifespan=lifespan)
bearer = HTTPBearer(auto_error=False)


def authorized(credentials: HTTPAuthorizationCredentials | None = Depends(bearer)):
    expected = os.environ.get("API_TOKEN", "")
    if not expected or credentials is None or not secrets.compare_digest(
        credentials.credentials.encode(), expected.encode()
    ):
        raise HTTPException(401, "A valid journal access token is required", headers={"WWW-Authenticate": "Bearer"})


def error(status, code, message, headers=None):
    return JSONResponse(status_code=status, content={"error": {"code": code, "message": message}}, headers=headers)


@app.exception_handler(HTTPException)
async def http_error(request, exc):
    return error(exc.status_code, "http_error", str(exc.detail), exc.headers)


@app.exception_handler(RequestValidationError)
async def request_error(request, exc):
    # Do not echo submitted journal contents into diagnostics or telemetry.
    return error(422, "validation_error", "Check required fields, dates, mood, and milestone category")


@app.exception_handler(SQLAlchemyError)
async def database_error(request, exc):
    logger.error('{"event":"database_error"}')
    return error(503, "database_unavailable", "Journal storage is temporarily unavailable")


@app.middleware("http")
async def request_log(request: Request, call_next):
    started = time.monotonic()
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-store"
    response.headers["X-Content-Type-Options"] = "nosniff"
    logger.info('{"event":"request","method":"%s","status":%d,"duration_ms":%.1f}',
                request.method, response.status_code, (time.monotonic() - started) * 1000)
    return response


@app.get("/health")
def health():
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return {"status": "ok", "storage": "postgresql"}


def find_entry(entry_id: UUID, db: Session):
    entry = db.get(JournalEntry, entry_id)
    if entry is None:
        raise HTTPException(404, "Entry not found")
    return entry


@app.get("/api/entries", response_model=list[EntryOut], dependencies=[Depends(authorized)])
def list_entries(milestones: bool = False, db: Session = Depends(get_db)):
    query = select(JournalEntry)
    if milestones:
        query = query.where(JournalEntry.is_milestone.is_(True))
        query = query.order_by(JournalEntry.entry_date.asc(), JournalEntry.created_at.asc(), JournalEntry.id.asc())
    else:
        query = query.order_by(JournalEntry.entry_date.desc(), JournalEntry.created_at.desc(), JournalEntry.id.desc())
    return db.scalars(query).all()


@app.post("/api/entries", response_model=EntryOut, status_code=201, dependencies=[Depends(authorized)])
def create_entry(payload: EntryCreate, db: Session = Depends(get_db)):
    entry = JournalEntry(**payload.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@app.get("/api/entries/{entry_id}", response_model=EntryOut, dependencies=[Depends(authorized)])
def read_entry(entry_id: UUID, db: Session = Depends(get_db)):
    return find_entry(entry_id, db)


@app.patch("/api/entries/{entry_id}", response_model=EntryOut, dependencies=[Depends(authorized)])
def update_entry(entry_id: UUID, payload: EntryPatch, db: Session = Depends(get_db)):
    entry = find_entry(entry_id, db)
    changes = payload.model_dump(exclude_unset=True)
    if changes.get("is_milestone") is False:
        changes["milestone_type"] = None
    merged = {field: getattr(entry, field) for field in EntryCreate.model_fields}
    merged.update(changes)
    try:
        validated = EntryCreate.model_validate(merged)
    except ValidationError:
        raise HTTPException(422, "Choose a valid mood and milestone category")
    for field, value in validated.model_dump().items():
        setattr(entry, field, value)
    db.commit()
    db.refresh(entry)
    return entry


@app.delete("/api/entries/{entry_id}", status_code=204, dependencies=[Depends(authorized)])
def delete_entry(entry_id: UUID, db: Session = Depends(get_db)):
    db.delete(find_entry(entry_id, db))
    db.commit()
    return Response(status_code=204)
