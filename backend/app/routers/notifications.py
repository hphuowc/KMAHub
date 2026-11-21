"""
KMA Hub — Notifications API Router
File: backend/app/routers/notifications.py
"""

from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_

from ..core.database import get_db
from ..core.dependencies import get_current_user
from ..models.models import Notification, User
from ..schemas.schemas import NotificationResponse, MessageResponse

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=List[NotificationResponse])
def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns unread and recent notifications targeting the user
    or targeting their user role (student / btc / admin / all).
    """
    notifs = (
        db.query(Notification)
        .filter(
            or_(
                Notification.user_id == current_user.id,
                Notification.target_role == current_user.role,
                Notification.target_role == "all",
            )
        )
        .order_by(Notification.created_at.desc())
        .limit(20)
        .all()
    )
    return notifs


@router.post("/{notif_id}/read", response_model=MessageResponse)
def mark_notification_read(
    notif_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Marks a single notification as read."""
    notif = db.query(Notification).filter(Notification.id == notif_id).first()
    if notif:
        notif.is_read = True
        db.commit()
    return MessageResponse(message="Đã đánh dấu đã đọc.")


@router.post("/read-all", response_model=MessageResponse)
def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Marks all user's notifications as read."""
    db.query(Notification).filter(
        or_(
            Notification.user_id == current_user.id,
            Notification.target_role == current_user.role,
        )
    ).update({"is_read": True}, synchronize_session=False)
    db.commit()
    return MessageResponse(message="Đã đánh dấu tất cả đã đọc.")
