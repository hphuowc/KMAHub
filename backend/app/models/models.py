"""
KMA Hub — SQLAlchemy ORM Models (11 Tables)
File: backend/app/models/models.py
"""

from datetime import datetime
import uuid
from sqlalchemy import (
    Column,
    String,
    Integer,
    Numeric,
    DateTime,
    Date,
    Text,
    Enum,
    ForeignKey,
    JSON,
    Boolean,
    Index,
)
from sqlalchemy.orm import relationship
from ..core.database import Base


# ----------------------------------------------------------------------------
# 1. User Model
# ----------------------------------------------------------------------------
class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum("student", "btc", "admin", name="user_role_enum"), nullable=False, default="student", index=True)
    full_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)
    avatar_url = Column(String(255), nullable=True)

    # Sinh viên fields
    student_code = Column(String(20), unique=True, nullable=True, index=True)
    class_name = Column(String(30), nullable=True)
    cohort = Column(String(30), nullable=True)
    faculty = Column(String(100), nullable=True)
    birth_date = Column(Date, nullable=True)

    # BTC fields
    unit_code = Column(String(50), nullable=True)
    management_scope = Column(String(150), nullable=True)

    # Face AI
    face_encoding = Column(JSON, nullable=True)
    face_registered_at = Column(DateTime, nullable=True)

    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    registrations = relationship("EventRegistration", back_populates="user", cascade="all, delete-orphan")
    attendances = relationship("Attendance", foreign_keys="Attendance.user_id", back_populates="user", cascade="all, delete-orphan")
    makeup_requests = relationship("MakeupRequest", foreign_keys="MakeupRequest.user_id", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


# ----------------------------------------------------------------------------
# 2. Category Model
# ----------------------------------------------------------------------------
class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(120), nullable=False)
    description = Column(Text, nullable=True)
    min_drl = Column(Integer, default=5, nullable=False)
    max_drl = Column(Integer, default=15, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    events = relationship("Event", back_populates="category")


# ----------------------------------------------------------------------------
# 3. Location Model
# ----------------------------------------------------------------------------
class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(150), nullable=False)
    address = Column(String(255), nullable=False)
    latitude = Column(Numeric(10, 8), nullable=False)
    longitude = Column(Numeric(11, 8), nullable=False)
    default_radius = Column(Integer, default=50, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    events = relationship("Event", back_populates="location")


# ----------------------------------------------------------------------------
# 4. Event Model
# ----------------------------------------------------------------------------
class Event(Base):
    __tablename__ = "events"

    id = Column(String(50), primary_key=True)
    title = Column(String(255), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    organizer_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    organizer_name = Column(String(150), nullable=False)

    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    location_name = Column(String(200), nullable=False)
    latitude = Column(Numeric(10, 8), nullable=False)
    longitude = Column(Numeric(11, 8), nullable=False)
    radius_meters = Column(Integer, default=50, nullable=False)

    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    registration_deadline = Column(DateTime, nullable=False)
    drl_points = Column(Integer, default=5, nullable=False)

    max_seats = Column(Integer, default=100, nullable=False)
    current_seats = Column(Integer, default=0, nullable=False)

    description = Column(Text, nullable=True)
    banner_url = Column(String(255), nullable=True)
    status = Column(Enum("upcoming", "ongoing", "ended", "cancelled", name="event_status_enum"), default="upcoming", nullable=False, index=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    category = relationship("Category", back_populates="events")
    organizer = relationship("User", foreign_keys=[organizer_id])
    location = relationship("Location", back_populates="events")
    agendas = relationship("EventAgenda", back_populates="event", cascade="all, delete-orphan", order_by="EventAgenda.order_index")
    registrations = relationship("EventRegistration", back_populates="event", cascade="all, delete-orphan")
    attendances = relationship("Attendance", back_populates="event", cascade="all, delete-orphan")
    makeup_requests = relationship("MakeupRequest", back_populates="event", cascade="all, delete-orphan")


# ----------------------------------------------------------------------------
# 5. Event Agenda Model
# ----------------------------------------------------------------------------
class EventAgenda(Base):
    __tablename__ = "event_agendas"

    id = Column(Integer, primary_key=True, autoincrement=True)
    event_id = Column(String(50), ForeignKey("events.id"), nullable=False, index=True)
    time_slot = Column(String(50), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    order_index = Column(Integer, default=0, nullable=False)

    event = relationship("Event", back_populates="agendas")


# ----------------------------------------------------------------------------
# 6. Event Registration Model
# ----------------------------------------------------------------------------
class EventRegistration(Base):
    __tablename__ = "event_registrations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    event_id = Column(String(50), ForeignKey("events.id"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    status = Column(Enum("registered", "cancelled", name="reg_status_enum"), default="registered", nullable=False)
    registered_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    event = relationship("Event", back_populates="registrations")
    user = relationship("User", back_populates="registrations")


# ----------------------------------------------------------------------------
# 7. Attendance Model
# ----------------------------------------------------------------------------
class Attendance(Base):
    __tablename__ = "attendances"

    id = Column(Integer, primary_key=True, autoincrement=True)
    event_id = Column(String(50), ForeignKey("events.id"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    check_type = Column(Enum("CHECKIN", "CHECKOUT", name="check_type_enum"), nullable=False)
    checked_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # GPS metrics
    user_latitude = Column(Numeric(10, 8), nullable=False)
    user_longitude = Column(Numeric(11, 8), nullable=False)
    distance_meters = Column(Numeric(8, 2), nullable=False)
    gps_valid = Column(Boolean, default=True, nullable=False)

    # Face AI metrics
    face_match_percent = Column(Numeric(5, 2), nullable=False)
    face_distance = Column(Numeric(6, 4), nullable=True)
    face_valid = Column(Boolean, default=True, nullable=False)
    captured_image_url = Column(String(255), nullable=True)

    # Final verdict
    is_valid = Column(Boolean, default=True, nullable=False)
    validation_status = Column(
        Enum("VALID", "INVALID", "PENDING_REVIEW", "MANUAL_APPROVED", "REJECTED", name="att_status_enum"),
        default="VALID",
        nullable=False,
    )
    note = Column(String(255), nullable=True)

    reviewer_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)

    event = relationship("Event", back_populates="attendances")
    user = relationship("User", foreign_keys=[user_id], back_populates="attendances")
    reviewer = relationship("User", foreign_keys=[reviewer_id])


# ----------------------------------------------------------------------------
# 8. Makeup Request Model
# ----------------------------------------------------------------------------
class MakeupRequest(Base):
    __tablename__ = "makeup_requests"

    id = Column(Integer, primary_key=True, autoincrement=True)
    event_id = Column(String(50), ForeignKey("events.id"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    check_type = Column(Enum("CHECKIN", "CHECKOUT", "BOTH", name="makeup_type_enum"), default="CHECKIN", nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(
        Enum("PENDING_REVIEW", "APPROVED", "REJECTED", name="makeup_status_enum"),
        default="PENDING_REVIEW",
        nullable=False,
        index=True,
    )
    submitted_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    reviewer_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    review_note = Column(Text, nullable=True)

    event = relationship("Event", back_populates="makeup_requests")
    user = relationship("User", foreign_keys=[user_id], back_populates="makeup_requests")
    reviewer = relationship("User", foreign_keys=[reviewer_id])
    evidences = relationship("MakeupEvidence", back_populates="makeup_request", cascade="all, delete-orphan")


# ----------------------------------------------------------------------------
# 9. Makeup Evidence Model
# ----------------------------------------------------------------------------
class MakeupEvidence(Base):
    __tablename__ = "makeup_evidences"

    id = Column(Integer, primary_key=True, autoincrement=True)
    makeup_request_id = Column(Integer, ForeignKey("makeup_requests.id"), nullable=False, index=True)
    image_url = Column(String(255), nullable=False)
    file_name = Column(String(150), nullable=True)
    image_order = Column(Integer, default=1, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    makeup_request = relationship("MakeupRequest", back_populates="evidences")


# ----------------------------------------------------------------------------
# 10. System Config Model
# ----------------------------------------------------------------------------
class SystemConfig(Base):
    __tablename__ = "system_configs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    config_key = Column(String(50), unique=True, nullable=False, index=True)
    config_value = Column(Text, nullable=False)
    description = Column(String(255), nullable=True)
    updated_by = Column(String(36), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


# ----------------------------------------------------------------------------
# 11. Notification Model
# ----------------------------------------------------------------------------
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    target_role = Column(Enum("all", "student", "btc", "admin", name="notif_role_enum"), default="all", nullable=False)
    title = Column(String(150), nullable=False)
    content = Column(Text, nullable=False)
    type = Column(
        Enum("primary", "warning", "success", "danger", "info", "accent", name="notif_type_enum"),
        default="info",
        nullable=False,
    )
    link = Column(String(255), nullable=True)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="notifications")
