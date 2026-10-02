
"""
Pydantic models used by the Resume Intelligence Engine API.
"""

from typing import List

from pydantic import (
    AliasChoices,
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
)


class UploadResponse(BaseModel):
    """
    Response returned after a resume is uploaded.
    """

    filename: str
    text: str
    word_count: int = Field(
        ge=0,
    )

    @field_validator("filename")
    @classmethod
    def validate_filename(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError(
                "Filename cannot be empty."
            )

        return value

    @field_validator("text")
    @classmethod
    def validate_text(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError(
                "Extracted text cannot be empty."
            )

        return value


class AnalyzeResponse(BaseModel):
    """
    Response returned after resume analysis.
    """

    model_config = ConfigDict(
        populate_by_name=True,
    )

    match_score: float = Field(
        ge=0,
        le=100,
    )

    matched_keywords: List[str] = Field(
        default_factory=list,
        validation_alias=AliasChoices(
            "matched_skills",
            "matched_keywords",
        ),
        serialization_alias="matched_skills",
    )

    missing_keywords: List[str] = Field(
        default_factory=list,
        validation_alias=AliasChoices(
            "missing_skills",
            "missing_keywords",
        ),
        serialization_alias="missing_skills",
    )

    summary: str = Field(
        min_length=1,
    )

    @field_validator(
        "matched_keywords",
        "missing_keywords",
    )
    @classmethod
    def clean_keywords(
        cls,
        values: List[str],
    ) -> List[str]:
        cleaned: List[str] = []

        for value in values:
            value = value.strip()

            if value and value not in cleaned:
                cleaned.append(value)

        return cleaned

    @field_validator("summary")
    @classmethod
    def validate_summary(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError(
                "Summary cannot be empty."
            )

        return value

