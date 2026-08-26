from typing import Annotated

from pydantic import BaseModel, Field


class TranscriptionResult(BaseModel):
    transcript: Annotated[str, Field(min_length=1)]
    confidence: float = Field(ge=0, le=1)
    provider: Annotated[str, Field(min_length=1)]
