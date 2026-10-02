"""
A simple "are you alive?" endpoint. Useful for checking the server is running.
"""
from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
def health_check():
    return {"status": "ok"}
