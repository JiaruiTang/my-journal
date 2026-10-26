import uuid
from datetime import date, datetime, timezone

from sqlalchemy import Boolean, CheckConstraint, Date, DateTime, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from .db import Base


def utcnow():
    return datetime.now(timezone.utc)


class JournalEntry(Base):
    __tablename__ = "journal_entries"
    __table_args__ = (
        CheckConstraint("length(trim(title)) BETWEEN 1 AND 160", name="valid_title"),
        CheckConstraint("length(trim(content)) BETWEEN 1 AND 20000", name="valid_content"),
        CheckConstraint("mood IS NULL OR mood IN ('joyful','calm','hopeful','tired','sad')", name="valid_mood"),
        CheckConstraint("(is_milestone AND milestone_type IN ('achievement','challenge','turning_point','reflection') AND milestone_type IS NOT NULL) OR (NOT is_milestone AND milestone_type IS NULL)", name="valid_milestone"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(160))
    content: Mapped[str] = mapped_column(Text)
    entry_date: Mapped[date] = mapped_column(Date, index=True)
    mood: Mapped[str | None] = mapped_column(String(20))
    is_milestone: Mapped[bool] = mapped_column(Boolean, default=False)
    milestone_type: Mapped[str | None] = mapped_column(String(30))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
