"""
KMA Hub — Events API Router
File: backend/app/routers/events.py
"""

from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..core.dependencies import get_current_user, security_scheme
from ..models.models import Event, EventAgenda, EventRegistration, User
from ..schemas.schemas import EventResponse, AgendaItemSchema, MessageResponse

router = APIRouter(prefix="/events", tags=["Events"])


@router.get("", response_model=List[EventResponse])
def get_events(
    category_id: Optional[int] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    credentials=Depends(security_scheme),
):
    """
    Lists all events with optional filters by category and status.
    If authenticated, returns `is_registered` status for each event.
    """
    query = db.query(Event)
    if category_id:
        query = query.filter(Event.category_id == category_id)
    if status_filter:
        query = query.filter(Event.status == status_filter)

    events = query.order_by(Event.start_time.asc()).all()

    # Optional current user extraction without throwing 401
    current_user_id = None
    if credentials:
        from ..core.security import decode_access_token
        payload = decode_access_token(credentials.credentials)
        if payload:
            current_user_id = payload.get("sub")

    results = []
    for ev in events:
        is_reg = False
        if current_user_id:
            reg = (
                db.query(EventRegistration)
                .filter(
                    EventRegistration.event_id == ev.id,
                    EventRegistration.user_id == current_user_id,
                    EventRegistration.status == "registered",
                )
                .first()
            )
            is_reg = bool(reg)

        agendas = [
            AgendaItemSchema(
                time_slot=a.time_slot,
                title=a.title,
                description=a.description,
                order_index=a.order_index,
            )
            for a in ev.agendas
        ]

        results.append(
            EventResponse(
                id=ev.id,
                title=ev.title,
                category_id=ev.category_id,
                category_name=ev.category.name if ev.category else None,
                organizer_id=ev.organizer_id,
                organizer_name=ev.organizer_name,
                location_name=ev.location_name,
                latitude=float(ev.latitude),
                longitude=float(ev.longitude),
                radius_meters=ev.radius_meters,
                start_time=ev.start_time,
                end_time=ev.end_time,
                registration_deadline=ev.registration_deadline,
                drl_points=ev.drl_points,
                max_seats=ev.max_seats,
                current_seats=ev.current_seats,
                description=ev.description,
                banner_url=ev.banner_url,
                status=ev.status,
                is_registered=is_reg,
                agendas=agendas,
            )
        )
    return results


@router.get("/{event_id}", response_model=EventResponse)
def get_event_detail(
    event_id: str,
    db: Session = Depends(get_db),
    credentials=Depends(security_scheme),
):
    """Retrieves full event details including agenda and registration status."""
    ev = db.query(Event).filter(Event.id == event_id).first()
    if not ev:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy sự kiện yêu cầu.",
        )

    is_reg = False
    if credentials:
        from ..core.security import decode_access_token
        payload = decode_access_token(credentials.credentials)
        if payload:
            user_id = payload.get("sub")
            reg = (
                db.query(EventRegistration)
                .filter(
                    EventRegistration.event_id == ev.id,
                    EventRegistration.user_id == user_id,
                    EventRegistration.status == "registered",
                )
                .first()
            )
            is_reg = bool(reg)

    agendas = [
        AgendaItemSchema(
            time_slot=a.time_slot,
            title=a.title,
            description=a.description,
            order_index=a.order_index,
        )
        for a in ev.agendas
    ]

    return EventResponse(
        id=ev.id,
        title=ev.title,
        category_id=ev.category_id,
        category_name=ev.category.name if ev.category else None,
        organizer_id=ev.organizer_id,
        organizer_name=ev.organizer_name,
        location_name=ev.location_name,
        latitude=float(ev.latitude),
        longitude=float(ev.longitude),
        radius_meters=ev.radius_meters,
        start_time=ev.start_time,
        end_time=ev.end_time,
        registration_deadline=ev.registration_deadline,
        drl_points=ev.drl_points,
        max_seats=ev.max_seats,
        current_seats=ev.current_seats,
        description=ev.description,
        banner_url=ev.banner_url,
        status=ev.status,
        is_registered=is_reg,
        agendas=agendas,
    )


@router.post("/{event_id}/register", response_model=MessageResponse)
def register_event(
    event_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Allows student to register for an event."""
    ev = db.query(Event).filter(Event.id == event_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Sự kiện không tồn tại.")

    # Check registration deadline
    if datetime.utcnow() > ev.registration_deadline:
        raise HTTPException(status_code=400, detail="Đã hết hạn đăng ký tham gia sự kiện này.")

    # Check max seats
    if ev.current_seats >= ev.max_seats:
        raise HTTPException(status_code=400, detail="Sự kiện đã đủ số lượng sinh viên tham gia.")

    # Check existing registration
    existing = (
        db.query(EventRegistration)
        .filter(
            EventRegistration.event_id == event_id,
            EventRegistration.user_id == current_user.id,
        )
        .first()
    )

    if existing:
        if existing.status == "registered":
            return MessageResponse(message="Bạn đã đăng ký tham gia sự kiện này rồi.")
        existing.status = "registered"
    else:
        new_reg = EventRegistration(
            event_id=event_id,
            user_id=current_user.id,
            status="registered",
        )
        db.add(new_reg)

    ev.current_seats += 1
    db.commit()

    return MessageResponse(message=f"Đăng ký tham gia '{ev.title}' thành công.")
