
"""
Entry point for the Resume Intelligence Engine backend.

Run with:

    uvicorn app.main:app --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import analyze, health, upload


app = FastAPI(
    title="Resume Intelligence Engine",
    version="1.0.0",
    description="API for analyzing resumes against job descriptions.",
)


# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

# React/Vite development servers commonly use port 5173.
# Port 3000 is included for compatibility with other React setups.
#
# This configuration is intended for local development.
# Production should use a specific frontend origin.

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# API routes
# ---------------------------------------------------------

app.include_router(
    health.router,
    prefix="/api",
)

app.include_router(
    upload.router,
    prefix="/api",
)

app.include_router(
    analyze.router,
    prefix="/api",
)


# ---------------------------------------------------------
# Root endpoint
# ---------------------------------------------------------

@app.get("/")
def root():
    """
    Basic API status endpoint.
    """

    return {
        "message": "Resume Intelligence Engine API is running"
    }

