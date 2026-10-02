
from io import BytesIO

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_upload_rejects_unsupported_file():
    response = client.post(
        "/api/upload",
        files={
            "file": (
                "resume.txt",
                b"some resume text",
                "text/plain",
            )
        },
    )

    assert response.status_code == 400
    assert "Only .pdf and .docx files are supported." in response.json()["detail"]


def test_upload_rejects_empty_file():
    response = client.post(
        "/api/upload",
        files={
            "file": (
                "resume.pdf",
                b"",
                "application/pdf",
            )
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "The uploaded file is empty."


def test_upload_rejects_invalid_pdf():
    response = client.post(
        "/api/upload",
        files={
            "file": (
                "resume.pdf",
                b"this is not a real pdf",
                "application/pdf",
            )
        },
    )

    assert response.status_code == 422
    assert "could not be read or parsed" in response.json()["detail"].lower()


def test_upload_rejects_invalid_docx():
    response = client.post(
        "/api/upload",
        files={
            "file": (
                "resume.docx",
                b"this is not a real docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            )
        },
    )

    assert response.status_code == 422
    assert "could not be read or parsed" in response.json()["detail"].lower()
