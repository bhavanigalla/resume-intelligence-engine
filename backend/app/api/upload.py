
"""
Handles resume file uploads and returns extracted text.
"""

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.models.schemas import UploadResponse
from app.parsers.docx_parser import extract_text_from_docx
from app.parsers.pdf_parser import extract_text_from_pdf


router = APIRouter()

ALLOWED_EXTENSIONS = {".pdf", ".docx"}

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


def _get_file_extension(filename: str) -> str:
    """
    Return the lowercase file extension.
    """
    filename = filename.strip().lower()

    if "." not in filename:
        return ""

    return "." + filename.rsplit(".", 1)[1]


def _extract_text(
    filename: str,
    contents: bytes,
) -> str:
    """
    Extract text based on the uploaded file type.
    """

    extension = _get_file_extension(filename)

    if extension == ".pdf":
        return extract_text_from_pdf(contents)

    if extension == ".docx":
        return extract_text_from_docx(contents)

    raise HTTPException(
        status_code=400,
        detail="Only .pdf and .docx files are supported.",
    )


@router.post(
    "/upload",
    response_model=UploadResponse,
)
async def upload_resume(
    file: UploadFile = File(...),
):
    """
    Upload a PDF or DOCX resume and extract its text.
    """

    filename = (file.filename or "").strip()

    if not filename:
        raise HTTPException(
            status_code=400,
            detail="A filename is required.",
        )

    extension = _get_file_extension(filename)

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only .pdf and .docx files are supported.",
        )

    contents = await file.read()

    if not contents:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty.",
        )

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="The uploaded file is too large. Maximum size is 5 MB.",
        )

    try:
        text = _extract_text(
            filename,
            contents,
        )

    except HTTPException:
        raise

    except ValueError as exc:
        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=422,
            detail="Could not process the uploaded resume.",
        ) from exc

    if not text.strip():
        raise HTTPException(
            status_code=422,
            detail=(
                "Could not extract any text from this resume. "
                "The file may be scanned or contain unsupported formatting."
            ),
        )

    word_count = len(text.split())

    return UploadResponse(
        filename=filename,
        text=text,
        word_count=word_count,
    )

