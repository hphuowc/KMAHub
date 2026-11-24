"""
KMA Hub — Ban Tổ Chức (BTC) Management API Router
File: backend/app/routers/btc.py
"""

from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..core.dependencies import require_role
from ..models.models import (
    Event,
    EventAgenda,
    EventRegistration,
    Attendance,
    MakeupRequest,
    User,
    Category,
    Location,
)
from ..schemas.schemas import (
    EventCreateRequest,
    EventResponse,
    AgendaItemSchema,
    AttendanceLogResponse,
    MakeupResponse,
    MakeupReviewAction,
    MessageResponse,
)

router = APIRouter(prefix="/btc", tags=["Ban Tổ Chức (BTC)"])


@router.get("/dashboard")
def get_btc_dashboard(
    current_user: User = Depends(require_role(["btc", "admin"])),
    db: Session = Depends(get_db),
):
    """Returns KPI metrics for the BTC Dashboard."""
    total_events = db.query(Event).count()
    ongoing_events = db.query(Event).filter(Event.status == "ongoing").count()
    total_registrants = db.query(EventRegistration).filter(EventRegistration.status == "registered").count()
    valid_attendances = db.query(Attendance).filter(Attendance.is_valid == 1).count()
    pending_makeups = db.query(MakeupRequest).filter(MakeupRequest.status == "PENDING_REVIEW").count()

    return {
        "total_events": total_events,
        "ongoing_events": ongoing_events,
        "total_registrants": total_registrants,
        "valid_attendances": valid_attendances,
        "pending_makeups": pending_makeups,
    }


@router.get("/events", response_model=List[EventResponse])
def get_btc_events(
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: User = Depends(require_role(["btc", "admin"])),
    db: Session = Depends(get_db),
):
    """Lists all events managed by BTC with live registered seats."""
    query = db.query(Event)
    if status_filter and status_filter != "all":
        query = query.filter(Event.status == status_filter)

    events = query.order_by(Event.start_time.desc()).all()
    results = []
    for ev in events:
        reg_count = (
            db.query(EventRegistration)
            .filter(
                EventRegistration.event_id == ev.id,
                EventRegistration.status == "registered",
            )
            .count()
        )
        ev_dict = {
            "id": ev.id,
            "title": ev.title,
            "category_id": ev.category_id,
            "category_name": ev.category.name if ev.category else "Chung",
            "organizer_id": ev.organizer_id,
            "organizer_name": ev.organizer_name,
            "location_name": ev.location_name,
            "latitude": float(ev.latitude),
            "longitude": float(ev.longitude),
            "radius_meters": ev.radius_meters,
            "start_time": ev.start_time,
            "end_time": ev.end_time,
            "registration_deadline": ev.registration_deadline,
            "drl_points": ev.drl_points,
            "max_seats": ev.max_seats,
            "current_seats": reg_count,
            "description": ev.description,
            "banner_url": ev.banner_url,
            "status": ev.status,
            "is_registered": False,
            "agendas": [],
        }
        results.append(EventResponse(**ev_dict))
    return results


@router.post("/events", response_model=MessageResponse)
def create_event(
    payload: EventCreateRequest,
    current_user: User = Depends(require_role(["btc", "admin"])),
    db: Session = Depends(get_db),
):
    """Creates and publishes a new event with geofencing & agendas."""
    # Generate unique event code if not given
    event_id = payload.id or f"kma_{int(datetime.utcnow().timestamp())}"

    event = Event(
        id=event_id,
        title=payload.title,
        category_id=payload.category_id,
        organizer_id=current_user.id,
        organizer_name=current_user.full_name,
        location_id=payload.location_id,
        location_name=payload.location_name,
        latitude=payload.latitude,
        longitude=payload.longitude,
        radius_meters=payload.radius_meters,
        start_time=payload.start_time,
        end_time=payload.end_time,
        registration_deadline=payload.registration_deadline,
        drl_points=payload.drl_points,
        max_seats=payload.max_seats,
        current_seats=0,
        description=payload.description,
        banner_url=payload.banner_url,
        status="upcoming",
    )
    db.add(event)
    db.flush()

    if payload.agendas:
        for idx, ag in enumerate(payload.agendas):
            agenda = EventAgenda(
                event_id=event.id,
                time_slot=ag.time_slot,
                title=ag.title,
                description=ag.description,
                order_index=ag.order_index or (idx + 1),
            )
            db.add(agenda)

    db.commit()
    return MessageResponse(message=f"Đã xuất bản sự kiện '{event.title}' thành công.")


@router.get("/events/{event_id}/registrants")
def get_event_registrants(
    event_id: str,
    search: Optional[str] = Query(None),
    current_user: User = Depends(require_role(["btc", "admin"])),
    db: Session = Depends(get_db),
):
    """Returns list of all students registered for an event."""
    query = (
        db.query(EventRegistration)
        .filter(EventRegistration.event_id == event_id)
        .join(User, EventRegistration.user_id == User.id)
    )
    if search:
        s = f"%{search}%"
        query = query.filter((User.student_code.ilike(s)) | (User.full_name.ilike(s)))

    regs = query.all()

    results = []
    for r in regs:
        u = r.user
        results.append({
            "registration_id": r.id,
            "student_id": u.student_code or u.username,
            "full_name": u.full_name,
            "email": u.email,
            "class_name": u.class_name,
            "cohort": u.cohort,
            "faculty": u.faculty,
            "registered_at": r.registered_at,
            "status": r.status,
        })
    return results


@router.get("/attendance", response_model=List[AttendanceLogResponse])
def get_attendance_monitor(
    event_id: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None),
    current_user: User = Depends(require_role(["btc", "admin"])),
    db: Session = Depends(get_db),
):
    """Returns real-time attendance logs for monitoring & exception review."""
    query = db.query(Attendance)
    if event_id:
        query = query.filter(Attendance.event_id == event_id)
    if status_filter:
        query = query.filter(Attendance.validation_status == status_filter)

    logs = query.order_by(Attendance.checked_at.desc()).all()

    results = []
    for l in logs:
        results.append(
            AttendanceLogResponse(
                id=l.id,
                event_id=l.event_id,
                event_title=l.event.title if l.event else None,
                student_code=l.user.student_code if l.user else None,
                student_name=l.user.full_name if l.user else None,
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


@router.post("/attendance/{attendance_id}/approve", response_model=MessageResponse)
def approve_attendance(
    attendance_id: int,
    current_user: User = Depends(require_role(["btc", "admin"])),
    db: Session = Depends(get_db),
):
    """Manually approves an exception attendance record."""
    att = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if not att:
        raise HTTPException(status_code=404, detail="Không tìm thấy bản ghi điểm danh.")

    att.is_valid = True
    att.validation_status = "MANUAL_APPROVED"
    att.reviewer_id = current_user.id
    att.reviewed_at = datetime.utcnow()
    att.note = f"Đã phê duyệt thủ công bởi {current_user.full_name}"
    db.commit()

    return MessageResponse(message=f"Đã phê duyệt lượt điểm danh của {att.user.full_name} thành HỢP LỆ.")


@router.post("/attendance/{attendance_id}/reject", response_model=MessageResponse)
def reject_attendance(
    attendance_id: int,
    reason: str = Query("Không đủ bằng chứng có mặt tại sự kiện"),
    current_user: User = Depends(require_role(["btc", "admin"])),
    db: Session = Depends(get_db),
):
    """Rejects an exception attendance record."""
    att = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if not att:
        raise HTTPException(status_code=404, detail="Không tìm thấy bản ghi điểm danh.")

    att.is_valid = False
    att.validation_status = "REJECTED"
    att.reviewer_id = current_user.id
    att.reviewed_at = datetime.utcnow()
    att.note = f"Từ chối bởi {current_user.full_name}: {reason}"
    db.commit()

    return MessageResponse(message=f"Đã từ chối lượt điểm danh của {att.user.full_name}.")


@router.post("/makeup/{makeup_id}/review", response_model=MessageResponse)
def review_makeup_request(
    makeup_id: int,
    payload: MakeupReviewAction,
    current_user: User = Depends(require_role(["btc", "admin"])),
    db: Session = Depends(get_db),
):
    """Reviews (Approves / Rejects) a student's makeup attendance request."""
    makeup = db.query(MakeupRequest).filter(MakeupRequest.id == makeup_id).first()
    if not makeup:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn xin điểm danh bù.")

    makeup.status = payload.status
    makeup.reviewer_id = current_user.id
    makeup.reviewed_at = datetime.utcnow()
    makeup.review_note = payload.review_note

    # If approved, insert corresponding valid attendance record if not exists
    if payload.status == "APPROVED":
        existing_att = (
            db.query(Attendance)
            .filter(
                Attendance.event_id == makeup.event_id,
                Attendance.user_id == makeup.user_id,
                Attendance.check_type == makeup.check_type,
            )
            .first()
        )
        if existing_att:
            existing_att.is_valid = True
            existing_att.validation_status = "MANUAL_APPROVED"
            existing_att.note = "Duyệt bù qua đơn giải trình"
        else:
            new_att = Attendance(
                event_id=makeup.event_id,
                user_id=makeup.user_id,
                check_type=makeup.check_type if makeup.check_type in ["CHECKIN", "CHECKOUT"] else "CHECKIN",
                checked_at=datetime.utcnow(),
                user_latitude=makeup.event.latitude,
                user_longitude=makeup.event.longitude,
                distance_meters=0.0,
                gps_valid=True,
                face_match_percent=95.0,
                face_distance=0.2,
                face_valid=True,
                is_valid=True,
                validation_status="MANUAL_APPROVED",
                note="Duyệt bù qua đơn giải trình",
                reviewer_id=current_user.id,
                reviewed_at=datetime.utcnow(),
            )
            db.add(new_att)

    db.commit()
    verdict = "PHÊ DUYỆT" if payload.status == "APPROVED" else "TỪ CHỐI"
    return MessageResponse(message=f"Đã {verdict} yêu cầu điểm danh bù thành công.")
