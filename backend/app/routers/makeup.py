"""
KMA Hub — Makeup Attendance API Router
File: backend/app/routers/makeup.py
"""

from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..core.dependencies import get_current_user
from ..models.models import Event, MakeupRequest, MakeupEvidence, User, Notification
from ..schemas.schemas import (
    MakeupSubmitRequest,
    MakeupResponse,
    MakeupEvidenceResponse,
    MessageResponse,
)
from ..services.time_engine import evaluate_makeup_window

router = APIRouter(prefix="/makeup", tags=["Makeup Requests"])


@router.post("/submit", response_model=MessageResponse)
def submit_makeup_request(
    payload: MakeupSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Submits an exception makeup attendance request.
    Strict rule: Only allowed AFTER event ends and WITHIN 24 hours.
    """
    event = db.query(Event).filter(Event.id == payload.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Không tìm thấy sự kiện.")

    # Validate 24h window
    now = datetime.utcnow()
    window_eval = evaluate_makeup_window(event.end_time, now=now)
    if not window_eval["allowed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=window_eval["message"],
        )

    # Create makeup request
    makeup = MakeupRequest(
        event_id=event.id,
        user_id=current_user.id,
        check_type=payload.check_type,
        reason=payload.reason,
        status="PENDING_REVIEW",
        submitted_at=now,
    )
    db.add(makeup)
    db.flush()

    # Add evidence images if provided
    if payload.evidence_image_urls:
        for idx, url in enumerate(payload.evidence_image_urls[:3]):
            evidence = MakeupEvidence(
                makeup_request_id=makeup.id,
                image_url=url,
                file_name=f"evidence_{idx+1}.jpg",
                image_order=idx + 1,
            )
            db.add(evidence)

    # Push notification to BTC
    notif = Notification(
        user_id=None,
        target_role="btc",
        title="Yêu cầu điểm danh bù mới",
        content=f"Sinh viên {current_user.student_code or current_user.full_name} gửi đơn xin bù cho '{event.title}'.",
        type="warning",
        link="btc/attendance.html",
    )
    db.add(notif)
    db.commit()

    return MessageResponse(
        message=f"Đã gửi yêu cầu điểm danh bù cho '{event.title}' thành công."
    )


@router.get("/my-requests", response_model=List[MakeupResponse])
def get_my_makeup_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns all makeup requests submitted by the current student."""
    requests = (
        db.query(MakeupRequest)
        .filter(MakeupRequest.user_id == current_user.id)
        .order_by(MakeupRequest.submitted_at.desc())
        .all()
    )

    results = []
    for r in requests:
        evidences = [
            MakeupEvidenceResponse(
                id=e.id,
                image_url=e.image_url,
                image_order=e.image_order,
            )
            for e in r.evidences
        ]
        results.append(
            MakeupResponse(
                id=r.id,
                event_id=r.event_id,
                event_title=r.event.title if r.event else None,
                student_code=current_user.student_code,
                student_name=current_user.full_name,
                check_type=r.check_type,
                reason=r.reason,
                status=r.status,
                submitted_at=r.submitted_at,
                reviewed_at=r.reviewed_at,
                review_note=r.review_note,
                evidences=evidences,
            )
        )
    return results
