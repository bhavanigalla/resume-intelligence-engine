
"""
Extract plain text from PDF resume files.
"""

import io

from pypdf import PdfReader


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extract text from a PDF.

    Returns an empty string when the PDF contains no extractable text.

    Raises:
        ValueError: If the PDF cannot be read or parsed.
    """

    if not file_bytes:
        raise ValueError("The PDF file is empty.")

    try:
        reader = PdfReader(io.BytesIO(file_bytes))

        pages_text: list[str] = []

        for page in reader.pages:
            try:
                page_text = page.extract_text() or ""
            except Exception:
                # Skip a page that cannot be extracted.
                page_text = ""

            page_text = page_text.strip()

            if page_text:
                pages_text.append(page_text)

        return "\n".join(pages_text).strip()

    except Exception as exc:
        raise ValueError(
            "The PDF file could not be read or parsed."
        ) from exc
