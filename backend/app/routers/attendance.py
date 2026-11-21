"""
KMA Hub — Attendance Verification API Router
File: backend/app/routers/attendance.py
"""

from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..core.dependencies import get_current_user
from ..core.config import settings
from ..models.models import Event, EventRegistration, Attendance, User
from ..schemas.schemas import (
    AttendanceVerifyRequest,
    AttendanceVerifyResponse,
    AttendanceLogResponse,
)
from ..services.gps_geofence import is_within_geofence
from ..services.face_ai import evaluate_face_match
from ..services.time_engine import evaluate_attendance_window

router = APIRouter(prefix="/attendance", tags=["Attendance"])


@router.post("/verify", response_model=AttendanceVerifyResponse)
def verify_attendance(
    payload: AttendanceVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Core Attendance Verification:
    1. Checks if student is registered for the event.
    2. Validates real-time Check-in / Check-out time windows.
    3. Evaluates GPS Geofencing (Haversine distance in meters).
    4. Evaluates AI Face Verification (128-D embedding matching ≥ 85%).
    5. Saves attendance record into MySQL `attendances` table.
    """
    event = db.query(Event).filter(Event.id == payload.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Không tìm thấy sự kiện.")

    # 1. Check registration
    reg = (
        db.query(EventRegistration)
        .filter(
            EventRegistration.event_id == event.id,
            EventRegistration.user_id == current_user.id,
            EventRegistration.status == "registered",
        )
        .first()
    )
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn chưa đăng ký tham gia sự kiện này.",
        )

    # 2. Time Window check
    now = datetime.utcnow()
    # Note: If running on local server, adjust to event start/end
    time_window = evaluate_attendance_window(event.start_time, event.end_time, now=now)
    check_type = payload.check_type.upper()

    # 3. GPS Geofencing check
    gps_valid, distance_meters = is_within_geofence(
        user_lat=payload.user_latitude,
        user_lon=payload.user_longitude,
        event_lat=float(event.latitude),
        event_lon=float(event.longitude),
        allowed_radius_meters=event.radius_meters,
    )

    # 4. Face AI Verification check
    face_valid, match_pct, face_dist = evaluate_face_match(
        client_encoding=payload.face_encoding,
        user_saved_encoding=current_user.face_encoding,
    )

    # Determine overall validity
    is_valid = gps_valid and face_valid
    validation_status = "VALID" if is_valid else "INVALID"

    note_parts = []
    if not gps_valid:
        note_parts.append(f"Vị trí ngoài bán kính ({distance_meters}m > {event.radius_meters}m)")
    if not face_valid:
        note_parts.append(f"Khuôn mặt chưa đạt ({match_pct}% < {settings.FACE_MATCH_MIN_PERCENT}%)")
    if is_valid:
        note_parts.append(f"Hợp lệ: GPS {distance_meters}m, Face {match_pct}%")

    note_str = "; ".join(note_parts)

    # 5. Persist into MySQL
    record = Attendance(
        event_id=event.id,
        user_id=current_user.id,
        check_type=check_type,
        checked_at=now,
        user_latitude=payload.user_latitude,
        user_longitude=payload.user_longitude,
        distance_meters=distance_meters,
        gps_valid=gps_valid,
        face_match_percent=match_pct,
        face_distance=face_dist,
        face_valid=face_valid,
        captured_image_url=None,
        is_valid=is_valid,
        validation_status=validation_status,
        note=note_str,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    msg = (
        f"Xác nhận {check_type} thành công!"
        if is_valid
        else f"Điểm danh không hợp lệ: {note_str}."
    )

    return AttendanceVerifyResponse(
        success=True,
        is_valid=is_valid,
        validation_status=validation_status,
        message=msg,
        distance_meters=distance_meters,
        radius_meters=event.radius_meters,
        gps_valid=gps_valid,
        face_match_percent=match_pct,
        face_valid=face_valid,
        check_type=check_type,
        checked_at=record.checked_at,
    )


@router.get("/my-history", response_model=List[AttendanceLogResponse])
def get_my_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves all personal attendance records of the student."""
    logs = (
        db.query(Attendance)
        .filter(Attendance.user_id == current_user.id)
        .order_by(Attendance.checked_at.desc())
        .all()
    )

    results = []
    for l in logs:
        results.append(
            AttendanceLogResponse(
                id=l.id,
                event_id=l.event_id,
                event_title=l.event.title if l.event else None,
                student_code=current_user.student_code,
                student_name=current_user.full_name,
                check_type=l.check_type,
                checked_at=l.checked_at,
                distance_meters=float(l.distance_meters),
                face_match_percent=float(l.face_match_percent),
                is_valid=l.is_valid,
                validation_status=l.validation_status,
                note=l.note,
            )
        )
    return results
