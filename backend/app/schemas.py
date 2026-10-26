from datetime import date, datetime
from enum import StrEnum
from typing import Annotated
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, model_validator


class Mood(StrEnum):
    joyful = "joyful"
    calm = "calm"
    hopeful = "hopeful"
    tired = "tired"
    sad = "sad"


class MilestoneType(StrEnum):
    achievement = "achievement"
    challenge = "challenge"
    turning_point = "turning_point"
    reflection = "reflection"


Title = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=160)]
Content = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=20000)]


class EntryCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    title: Title
    content: Content
    entry_date: date
    mood: Mood | None = None
    is_milestone: bool = Field(default=False, strict=True)
    milestone_type: MilestoneType | None = None

    @model_validator(mode="after")
    def valid_milestone(self):
        if self.is_milestone and self.milestone_type is None:
            raise ValueError("Choose a category for a milestone")
        if not self.is_milestone and self.milestone_type is not None:
            raise ValueError("Only milestones can have a category")
        return self


class EntryPatch(BaseModel):
    model_config = ConfigDict(extra="forbid")
    title: Title | None = None
    content: Content | None = None
    entry_date: date | None = None
    mood: Mood | None = None
    is_milestone: bool | None = Field(default=None, strict=True)
    milestone_type: MilestoneType | None = None

    @model_validator(mode="after")
    def non_nullable(self):
        for field in ("title", "content", "entry_date", "is_milestone"):
            if field in self.model_fields_set and getattr(self, field) is None:
                raise ValueError(f"{field} cannot be null")
        return self


class EntryOut(EntryCreate):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    created_at: datetime
    updated_at: datetime
