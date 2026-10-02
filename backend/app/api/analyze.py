
"""
Analyze a resume against a job description.

Supports:
- PDF resume uploads
- DOCX resume uploads
- Plain resume text
- JSON requests containing extracted resume text
"""

import json
from typing import Any

from fastapi import APIRouter, HTTPException, Request

from app.models.schemas import AnalyzeResponse
from app.parsers.docx_parser import extract_text_from_docx
from app.parsers.pdf_parser import extract_text_from_pdf
from app.services.matcher import analyze_match


router = APIRouter()

ALLOWED_EXTENSIONS = {".pdf", ".docx"}

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


def _get_file_extension(filename: str) -> str:
    """Return the lowercase file extension."""

    filename = filename.strip().lower()

    if "." not in filename:
        return ""

    return "." + filename.rsplit(".", 1)[1]


def _decode_resume_text(resume_bytes: bytes) -> str:
    """Decode plain-text resume content."""

    if not resume_bytes:
        return ""

    try:
        return resume_bytes.decode("utf-8")
    except UnicodeDecodeError:
        return resume_bytes.decode(
            "latin-1",
            errors="ignore",
        )


def _extract_resume_text(
    filename: str,
    resume_bytes: bytes,
) -> str:
    """Extract resume text according to file extension."""

    extension = _get_file_extension(filename)

    if extension == ".pdf":
        return extract_text_from_pdf(resume_bytes)

    if extension == ".docx":
        return extract_text_from_docx(resume_bytes)

    return _decode_resume_text(resume_bytes)


def _build_summary(score: float) -> str:
    """Build a human-readable summary from the score."""

    if score >= 75:
        return (
            "Strong match. This resume covers most of what "
            "the job asks for."
        )

    if score >= 45:
        return (
            "Partial match. Some important skills or keywords "
            "are missing."
        )

    return (
        "Weak match. The resume is missing many things "
        "the job asks for."
    )


async def _read_multipart_request(
    request: Request,
) -> tuple[str, str]:
    """
    Read resume and job description from multipart/form-data.

    The uploaded file is identified by the field name 'resume'.
    """

    try:
        form = await request.form()
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail="Invalid multipart form data.",
        ) from exc

    resume = form.get("resume")
    job_description = form.get("job_description", "")

    if resume is None:
        raise HTTPException(
            status_code=400,
            detail="A resume file is required.",
        )

    # Do not use isinstance(..., UploadFile).
    # Starlette's UploadFile and FastAPI's UploadFile can be
    # different class objects depending on the installed versions.
    if not hasattr(resume, "read"):
        raise HTTPException(
            status_code=400,
            detail="The resume must be uploaded as a file.",
        )

    if not isinstance(job_description, str):
        raise HTTPException(
            status_code=400,
            detail="Job description must be text.",
        )

    filename = (getattr(resume, "filename", "") or "").strip()

    if not filename:
        raise HTTPException(
            status_code=400,
            detail="The resume filename is required.",
        )

    extension = _get_file_extension(filename)

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only .pdf and .docx files are supported.",
        )

    try:
        resume_bytes = await resume.read()
    except Exception as exc:
        raise HTTPException(
            status_code=422,
            detail="Could not read the uploaded resume.",
        ) from exc

    if not resume_bytes:
        raise HTTPException(
            status_code=400,
            detail="The uploaded resume is empty.",
        )

    if len(resume_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=(
                "The uploaded resume is too large. "
                "Maximum size is 5 MB."
            ),
        )

    try:
        resume_text = _extract_resume_text(
            filename,
            resume_bytes,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=422,
            detail="Could not process the uploaded resume.",
        ) from exc

    return resume_text, job_description


async def _read_json_request(
    request: Request,
) -> tuple[str, str]:
    """Read resume text and job description from JSON."""

    try:
        payload = await request.json()
    except (json.JSONDecodeError, ValueError) as exc:
        raise HTTPException(
            status_code=400,
            detail="Invalid JSON request body.",
        ) from exc

    if not isinstance(payload, dict):
        raise HTTPException(
            status_code=400,
            detail="Request body must be a JSON object.",
        )

    resume_text = payload.get("resume_text", "")
    job_description = payload.get("job_description", "")

    if not isinstance(resume_text, str):
        raise HTTPException(
            status_code=400,
            detail="resume_text must be a string.",
        )

    if not isinstance(job_description, str):
        raise HTTPException(
            status_code=400,
            detail="job_description must be a string.",
        )

    return resume_text, job_description


@router.post(
    "/analyze",
    response_model=AnalyzeResponse,
)
async def analyze_resume(request: Request):
    """Analyze a resume against a job description."""

    content_type = (
        request.headers.get(
            "content-type",
            "",
        ).lower()
    )

    if "multipart/form-data" in content_type:
        resume_text, job_description = (
            await _read_multipart_request(request)
        )

    elif "application/json" in content_type:
        resume_text, job_description = (
            await _read_json_request(request)
        )

    else:
        raise HTTPException(
            status_code=415,
            detail=(
                "Unsupported content type. Use "
                "multipart/form-data or application/json."
            ),
        )

    resume_text = resume_text.strip()
    job_description = job_description.strip()

    if not resume_text:
        raise HTTPException(
            status_code=400,
            detail="Resume text could not be extracted.",
        )

    if not job_description:
        raise HTTPException(
            status_code=400,
            detail="A job description is required.",
        )

    score, matched, missing = analyze_match(
        resume_text,
        job_description,
    )

    return AnalyzeResponse(
        match_score=score,
        matched_keywords=matched,
        missing_keywords=missing,
        summary=_build_summary(score),
    )