import pytest
from pydantic import ValidationError

from app.schemas import EntryCreate, EntryPatch, MilestoneType, Mood


@pytest.mark.parametrize("field,value", [
    ("title", " "), ("title", "a" * 161), ("content", "\n "),
    ("content", "a" * 20001), ("entry_date", "2026-02-30"),
    ("mood", "angry"), ("is_milestone", "true"), ("milestone_type", "promotion"),
])
def test_invalid_input(payload, field, value):
    with pytest.raises(ValidationError):
        EntryCreate(**{**payload, field: value})


def test_trim_and_optional_mood(payload):
    entry = EntryCreate(**{**payload, "title": "  Hello  ", "mood": None})
    assert entry.title == "Hello"
    assert entry.mood is None


@pytest.mark.parametrize("mood", list(Mood))
def test_moods(payload, mood):
    assert EntryCreate(**{**payload, "mood": mood}).mood == mood


@pytest.mark.parametrize("category", list(MilestoneType))
def test_categories(payload, category):
    assert EntryCreate(**{**payload, "is_milestone": True, "milestone_type": category}).milestone_type == category


@pytest.mark.parametrize("milestone,category", [(True, None), (False, "achievement")])
def test_milestone_invariants(payload, milestone, category):
    with pytest.raises(ValidationError):
        EntryCreate(**{**payload, "is_milestone": milestone, "milestone_type": category})


@pytest.mark.parametrize("field", ["title", "content", "entry_date", "is_milestone"])
def test_patch_rejects_null_required_fields(field):
    with pytest.raises(ValidationError):
        EntryPatch(**{field: None})
