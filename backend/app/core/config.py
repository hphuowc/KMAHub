"""
KMA Hub — Central Settings
File: backend/app/core/config.py
"""

from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    APP_ENV: str = "development"
    APP_NAME: str = "KMA Hub API"
    APP_PORT: int = 8000
    API_PREFIX: str = "/api"

    # MySQL connection string
    DATABASE_URL: str = Field(
        default="mysql+pymysql://root:root@localhost:3306/kma_hub?charset=utf8mb4",
        alias="DATABASE_URL",
    )

    # JWT Config
    JWT_SECRET: str = "kma_hub_super_secret_jwt_key_2025_actvn_cyber_sec"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # Face AI & GPS Rules
    FACE_MATCH_MIN_PERCENT: float = 85.0
    FACE_MATCH_THRESHOLD_DISTANCE: float = 0.45
    DEFAULT_GPS_RADIUS_METERS: float = 50.0

    # Time Windows (in minutes)
    CHECKIN_BEFORE_START_MIN: int = 30
    CHECKIN_AFTER_START_MIN: int = 30
    CHECKOUT_BEFORE_END_MIN: int = 30
    CHECKOUT_AFTER_END_MIN: int = 30
    MAKEUP_AFTER_END_HOURS: int = 24

    # CORS
    CORS_ORIGINS: List[str] = ["*"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "allow"


settings = Settings()
