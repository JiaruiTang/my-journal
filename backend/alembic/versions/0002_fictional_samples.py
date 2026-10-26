"""Seed fictional samples once, never resurrect deleted entries on restart."""
from datetime import date, datetime, timezone
from uuid import UUID

from alembic import op
import sqlalchemy as sa

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade():
    table = sa.table("journal_entries",
        sa.column("id", sa.Uuid()), sa.column("title", sa.String()),
        sa.column("content", sa.Text()), sa.column("entry_date", sa.Date()),
        sa.column("mood", sa.String()), sa.column("is_milestone", sa.Boolean()),
        sa.column("milestone_type", sa.String()), sa.column("created_at", sa.DateTime(timezone=True)),
        sa.column("updated_at", sa.DateTime(timezone=True)))
    now = datetime(2026, 10, 24, 17, tzinfo=timezone.utc)
    samples = [
        ("00000000-0000-4000-8000-000000000001", "A little room to begin", "Fictional sample: I put my phone away and took the long way home. The afternoon light made even the familiar streets feel new. A reminder that a good day does not have to be a remarkable one.", date(2026, 10, 24), "calm", False, None),
        ("00000000-0000-4000-8000-000000000002", "Brave enough to try", "Fictional sample: Today I shared an idea I had been keeping to myself. It was not perfectly formed, and that turned out to be okay. Taking the first small step felt like its own kind of achievement.", date(2026, 10, 22), "hopeful", True, "achievement"),
        ("00000000-0000-4000-8000-000000000003", "Finding a different rhythm", "Fictional sample: My plans changed, so I made tea and started again. I am learning to leave a little space for the unexpected. Progress can look quieter than I imagined.", date(2026, 10, 19), "tired", True, "reflection"),
    ]
    # Existing local installations may already have records; don't duplicate samples.
    if op.get_bind().execute(sa.text("SELECT count(*) FROM journal_entries")).scalar() == 0:
        op.bulk_insert(table, [dict(zip(
            ("id", "title", "content", "entry_date", "mood", "is_milestone", "milestone_type", "created_at", "updated_at"),
            (UUID(row[0]), *row[1:], now, now), strict=True)) for row in samples])


def downgrade():
    # Keep potentially edited journal data. This revision changes data, not schema.
    pass
