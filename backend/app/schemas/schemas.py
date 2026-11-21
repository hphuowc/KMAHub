"""
KMA Hub — Pydantic Request & Response Schemas
File: backend/app/schemas/schemas.py
"""

from datetime import datetime, date
from typing import List, Optional, Any
from pydantic import BaseModel, Field


# ----------------------------------------------------------------------------
# Common / Generic
# ----------------------------------------------------------------------------
class MessageResponse(BaseModel):
    message: str
    success: bool = True
    data: Optional[Any] = None


# ----------------------------------------------------------------------------
# Authentication
# ----------------------------------------------------------------------------
class LoginRequest(BaseModel):
    username: str = Field(..., description="Mã sinh viên hoặc username/email")
    password: str = Field(..., description="Mật khẩu tài khoản")


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "Bearer"
    user_id: str
    username: str
    full_name: str
    role: str
    email: str
    student_code: Optional[str] = None
    avatar_url: Optional[str] = None


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str


# ----------------------------------------------------------------------------
# User Schemas
# ----------------------------------------------------------------------------
class UserBase(BaseModel):
    username: str
    email: str
    full_name: str
    role: str = "student"
    phone: Optional[str] = None
    student_code: Optional[str] = None
    class_name: Optional[str] = None
    cohort: Optional[str] = None
    faculty: Optional[str] = None
    birth_date: Optional[date] = None
    unit_code: Optional[str] = None
    management_scope: Optional[str] = None
    is_active: bool = True


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    class_name: Optional[str] = None
    cohort: Optional[str] = None
    faculty: Optional[str] = None
    birth_date: Optional[date] = None
    unit_code: Optional[str] = None
    management_scope: Optional[str] = None
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    id: str
    avatar_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ----------------------------------------------------------------------------
# Category Schemas
# ----------------------------------------------------------------------------
class CategoryBase(BaseModel):
    code: str
    name: str
    description: Optional[str] = None
    min_drl: int = 5
    max_drl: int = 15
    is_active: bool = True


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    min_drl: Optional[int] = None
    max_drl: Optional[int] = None
    is_active: Optional[bool] = None


class CategoryResponse(CategoryBase):
    id: int
    event_count: Optional[int] = 0

    class Config:
        from_attributes = True


# ----------------------------------------------------------------------------
# Location Schemas
# ----------------------------------------------------------------------------
class LocationBase(BaseModel):
    name: str
    address: str
    latitude: float
    longitude: float
    default_radius: int = 50
    is_active: bool = True


class LocationCreate(LocationBase):
    pass


class LocationResponse(LocationBase):
    id: int

    class Config:
        from_attributes = True


# ----------------------------------------------------------------------------
# Event Agendas & Events
# ----------------------------------------------------------------------------
class AgendaItemSchema(BaseModel):
    time_slot: str
    title: str
    description: Optional[str] = None
    order_index: int = 0


class EventCreateRequest(BaseModel):
    id: Optional[str] = None
    title: str
    category_id: int
    location_id: Optional[int] = None
    location_name: str
    latitude: float
    longitude: float
    radius_meters: int = 50
    start_time: datetime
    end_time: datetime
    registration_deadline: datetime
    drl_points: int = 5
    max_seats: int = 100
    description: Optional[str] = None
    banner_url: Optional[str] = None
    agendas: Optional[List[AgendaItemSchema]] = []


class EventUpdateRequest(BaseModel):
    title: Optional[str] = None
    category_id: Optional[int] = None
    location_id: Optional[int] = None
    location_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    radius_meters: Optional[int] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    registration_deadline: Optional[datetime] = None
    drl_points: Optional[int] = None
    max_seats: Optional[int] = None
    description: Optional[str] = None
    status: Optional[str] = None


class EventResponse(BaseModel):
    id: str
    title: str
    category_id: int
    category_name: Optional[str] = None
    organizer_id: str
    organizer_name: str
    location_name: str
    latitude: float
    longitude: float
    radius_meters: int
    start_time: datetime
    end_time: datetime
    registration_deadline: datetime
    drl_points: int
    max_seats: int
    current_seats: int
    description: Optional[str] = None
    banner_url: Optional[str] = None
    status: str
    is_registered: Optional[bool] = False
    agendas: Optional[List[AgendaItemSchema]] = []

    class Config:
        from_attributes = True


# ----------------------------------------------------------------------------
# Attendance
# ----------------------------------------------------------------------------
class AttendanceVerifyRequest(BaseModel):
    event_id: str
    check_type: str = Field(..., pattern="^(CHECKIN|CHECKOUT)$")
    user_latitude: float
    user_longitude: float
    face_image_base64: Optional[str] = None  # Base64 camera snapshot
    face_encoding: Optional[List[float]] = None  # 128-D vector if client-side extracted


class AttendanceVerifyResponse(BaseModel):
    success: bool
    is_valid: bool
    validation_status: str
    message: str
    distance_meters: float
    radius_meters: int
    gps_valid: bool
    face_match_percent: float
    face_valid: bool
    check_type: str
    checked_at: datetime


class AttendanceLogResponse(BaseModel):
    id: int
    event_id: str
    event_title: Optional[str] = None
    student_code: Optional[str] = None
    student_name: Optional[str] = None
    check_type: str
    checked_at: datetime
    distance_meters: float
    face_match_percent: float
    is_valid: bool
    validation_status: str
    note: Optional[str] = None

    class Config:
        from_attributes = True


# ----------------------------------------------------------------------------
# Makeup Requests & Evidences
# ----------------------------------------------------------------------------
class MakeupSubmitRequest(BaseModel):
    event_id: str
    check_type: str = Field(default="CHECKIN", pattern="^(CHECKIN|CHECKOUT|BOTH)$")
    reason: str
    evidence_image_urls: Optional[List[str]] = []


class MakeupEvidenceResponse(BaseModel):
    id: int
    image_url: str
    image_order: int

    class Config:
        from_attributes = True


class MakeupResponse(BaseModel):
    id: int
    event_id: str
    event_title: Optional[str] = None
    student_code: Optional[str] = None
    student_name: Optional[str] = None
    check_type: str
    reason: str
    status: str
    submitted_at: datetime
    reviewed_at: Optional[datetime] = None
    review_note: Optional[str] = None
    evidences: Optional[List[MakeupEvidenceResponse]] = []

    class Config:
        from_attributes = True


class MakeupReviewAction(BaseModel):
    status: str = Field(..., pattern="^(APPROVED|REJECTED)$")
    review_note: Optional[str] = None


# ----------------------------------------------------------------------------
# System Config & Notifications
# ----------------------------------------------------------------------------
class SystemConfigSchema(BaseModel):
    ai_model: Optional[str] = "FaceNet / Dlib 128-D"
    face_threshold_percent: float = 85.0
    min_face_res: Optional[str] = "150x150"
    default_radius: float = 50.0
    max_gps_acc: float = 100.0
    checkin_window_before: Optional[int] = 30
    checkin_window_after: Optional[int] = 30
    checkout_window_before: Optional[int] = 30
    checkout_window_after: Optional[int] = 30
    makeup_hours_after_end: Optional[int] = 24


class NotificationResponse(BaseModel):
    id: int
    title: str
    content: str
    type: str
    link: Optional[str] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
