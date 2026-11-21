"""
KMA Hub — Main Application Entry Point
File: backend/app/main.py
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .core.config import settings
from .routers import (
    auth,
    events,
    attendance,
    makeup,
    btc,
    admin,
    notifications,
)

app = FastAPI(
    title="KMA Hub — Hệ thống Quản lý Sự kiện & Điểm danh Sinh viên",
    description="Backend API phục vụ Hệ thống KMA Hub (Học viện Kỹ thuật Mật mã) kết hợp Face AI & GPS Geofencing",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# -----------------------------------------------------------------------------
# CORS Middleware
# -----------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------------------------------------------------
# Static files for Uploads (Avatars, Evidence pictures)
# -----------------------------------------------------------------------------
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(os.path.join(UPLOAD_DIR, "evidences"), exist_ok=True)
os.makedirs(os.path.join(UPLOAD_DIR, "avatars"), exist_ok=True)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# -----------------------------------------------------------------------------
# API Routers Mounting under settings.API_PREFIX (/api)
# -----------------------------------------------------------------------------
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(events.router, prefix=settings.API_PREFIX)
app.include_router(attendance.router, prefix=settings.API_PREFIX)
app.include_router(makeup.router, prefix=settings.API_PREFIX)
app.include_router(btc.router, prefix=settings.API_PREFIX)
app.include_router(admin.router, prefix=settings.API_PREFIX)
app.include_router(notifications.router, prefix=settings.API_PREFIX)


@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "status": "online",
        "school": "Học viện Kỹ thuật Mật mã (KMA)",
        "docs": "/api/docs",
    }


@app.get(f"{settings.API_PREFIX}/health")
def health_check():
    return {
        "status": "healthy",
        "environment": settings.APP_ENV,
        "database": "connected",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.APP_PORT,
        reload=(settings.APP_ENV == "development"),
    )
