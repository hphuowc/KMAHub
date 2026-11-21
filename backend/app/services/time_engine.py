"""
KMA Hub — Real-time Evaluation Engine
File: backend/app/services/time_engine.py
"""

from datetime import datetime, timedelta
from typing import Dict, Any


def evaluate_attendance_window(
    start_time: datetime,
    end_time: datetime,
    now: datetime = None,
    checkin_before_min: int = 30,
    checkin_after_min: int = 30,
    checkout_before_min: int = 30,
    checkout_after_min: int = 30,
) -> Dict[str, Any]:
    """
    Evaluates whether the current moment falls within Check-in or Check-out windows.
    - Check-in: [start_time - 30 min, start_time + 30 min]
    - Check-out: [end_time - 30 min, end_time + 30 min]
    """
    if now is None:
        now = datetime.utcnow()

    checkin_open = start_time - timedelta(minutes=checkin_before_min)
    checkin_close = start_time + timedelta(minutes=checkin_after_min)
    checkout_open = end_time - timedelta(minutes=checkout_before_min)
    checkout_close = end_time + timedelta(minutes=checkout_after_min)

    in_checkin = checkin_open <= now <= checkin_close
    in_checkout = checkout_open <= now <= checkout_close

    if in_checkin:
        active_phase = "CHECKIN"
        remaining_sec = max(0, int((checkin_close - now).total_seconds()))
    elif in_checkout:
        active_phase = "CHECKOUT"
        remaining_sec = max(0, int((checkout_close - now).total_seconds()))
    else:
        active_phase = "CLOSED"
        remaining_sec = 0

    return {
        "in_checkin": in_checkin,
        "in_checkout": in_checkout,
        "active_phase": active_phase,
        "remaining_seconds": remaining_sec,
        "checkin_open": checkin_open,
        "checkin_close": checkin_close,
        "checkout_open": checkout_open,
        "checkout_close": checkout_close,
    }


def evaluate_makeup_window(
    end_time: datetime,
    now: datetime = None,
    allowed_hours_after_end: int = 24,
) -> Dict[str, Any]:
    """
    Evaluates whether student can submit a makeup attendance request.
    Condition: Must be submitted AFTER event has ended and WITHIN 24 hours.
    """
    if now is None:
        now = datetime.utcnow()

    deadline = end_time + timedelta(hours=allowed_hours_after_end)

    if now <= end_time:
        return {
            "allowed": False,
            "code": "EVENT_NOT_ENDED",
            "message": "Chưa đến thời gian điểm danh bù (Sự kiện chưa kết thúc).",
            "deadline": deadline,
            "remaining_seconds": 0,
        }

    if now > deadline:
        return {
            "allowed": False,
            "code": "EXPIRED_24H",
            "message": "Sự kiện đã quá hạn 24 giờ cho phép gửi yêu cầu điểm danh bù.",
            "deadline": deadline,
            "remaining_seconds": 0,
        }

    remaining_sec = max(0, int((deadline - now).total_seconds()))
    return {
        "allowed": True,
        "code": "OPEN_WITHIN_24H",
        "message": "Hợp lệ trong khung 24h điểm danh bù.",
        "deadline": deadline,
        "remaining_seconds": remaining_sec,
    }
