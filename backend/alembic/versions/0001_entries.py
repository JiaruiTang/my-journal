"""Initial journal schema."""
from alembic import op
import sqlalchemy as sa

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "journal_entries",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("title", sa.String(160), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("entry_date", sa.Date(), nullable=False),
        sa.Column("mood", sa.String(20)),
        sa.Column("is_milestone", sa.Boolean(), nullable=False),
        sa.Column("milestone_type", sa.String(30)),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("length(trim(title)) BETWEEN 1 AND 160", name="valid_title"),
        sa.CheckConstraint("length(trim(content)) BETWEEN 1 AND 20000", name="valid_content"),
        sa.CheckConstraint("mood IS NULL OR mood IN ('joyful','calm','hopeful','tired','sad')", name="valid_mood"),
        sa.CheckConstraint("(is_milestone AND milestone_type IN ('achievement','challenge','turning_point','reflection') AND milestone_type IS NOT NULL) OR (NOT is_milestone AND milestone_type IS NULL)", name="valid_milestone"),
    )
    op.create_index("ix_journal_entries_entry_date", "journal_entries", ["entry_date"])


def downgrade():
    op.drop_table("journal_entries")
