
from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_analyze_with_json():
    response = client.post(
        "/api/analyze",
        json={
            "resume_text": (
                "Python developer with experience in AWS, "
                "React, SQL, and Docker."
            ),
            "job_description": (
                "Looking for a developer with Python, AWS, "
                "React, SQL, and Docker."
            ),
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert 0 <= data["match_score"] <= 100
    assert "python" in data["matched_skills"]
    assert "aws" in data["matched_skills"]
    assert "react" in data["matched_skills"]
    assert "sql" in data["matched_skills"]
    assert "docker" in data["matched_skills"]
    assert isinstance(data["missing_skills"], list)
    assert data["summary"]


def test_analyze_rejects_missing_resume_text():
    response = client.post(
        "/api/analyze",
        json={
            "resume_text": "",
            "job_description": "Python developer with AWS.",
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == (
        "Resume text could not be extracted."
    )


def test_analyze_rejects_missing_job_description():
    response = client.post(
        "/api/analyze",
        json={
            "resume_text": "Python developer with AWS.",
            "job_description": "",
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == (
        "A job description is required."
    )


def test_analyze_rejects_invalid_json_content_type():
    response = client.post(
        "/api/analyze",
        content="not json",
        headers={
            "Content-Type": "application/json",
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == (
        "Invalid JSON request body."
    )


def test_analyze_rejects_unsupported_content_type():
    response = client.post(
        "/api/analyze",
        content="some text",
        headers={
            "Content-Type": "text/plain",
        },
    )

    assert response.status_code == 415
    assert "Unsupported content type" in response.json()["detail"]


def test_analyze_rejects_non_object_json():
    response = client.post(
        "/api/analyze",
        json=["not", "an", "object"],
    )

    assert response.status_code == 400
    assert response.json()["detail"] == (
        "Request body must be a JSON object."
    )


def test_analyze_rejects_invalid_resume_text_type():
    response = client.post(
        "/api/analyze",
        json={
            "resume_text": 123,
            "job_description": "Python developer.",
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == (
        "resume_text must be a string."
    )


def test_analyze_rejects_invalid_job_description_type():
    response = client.post(
        "/api/analyze",
        json={
            "resume_text": "Python developer.",
            "job_description": 123,
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == (
        "job_description must be a string."
    )

