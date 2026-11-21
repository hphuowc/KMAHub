"""
KMA Hub — Admin Management API Router
File: backend/app/routers/admin.py
"""

from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..core.dependencies import require_role
from ..core.security import get_password_hash
from ..models.models import User, Event, Category, Attendance, MakeupRequest, SystemConfig
from ..schemas.schemas import (
    UserCreate,
    UserUpdate,
    UserResponse,
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
    SystemConfigSchema,
    MessageResponse,
)

router = APIRouter(prefix="/admin", tags=["Quản trị viên (Admin)"])


@router.get("/dashboard")
def get_admin_dashboard(
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    """Returns high-level statistics for the school-wide admin dashboard."""
    total_users = db.query(User).count()
    total_students = db.query(User).filter(User.role == "student").count()
    total_btc = db.query(User).filter(User.role == "btc").count()
    total_events = db.query(Event).count()
    total_categories = db.query(Category).count()
    total_attendances = db.query(Attendance).count()
    total_makeups = db.query(MakeupRequest).count()

    return {
        "total_users": total_users,
        "total_students": total_students,
        "total_btc": total_btc,
        "total_events": total_events,
        "total_categories": total_categories,
        "total_attendances": total_attendances,
        "total_makeups": total_makeups,
    }


# ----------------------------------------------------------------------------
# Users Management
# ----------------------------------------------------------------------------
@router.get("/users", response_model=List[UserResponse])
def list_users(
    role: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    """Lists accounts with filters by role and search keyword."""
    query = db.query(User)
    if role and role != "all":
        query = query.filter(User.role == role)
    if search:
        s = f"%{search}%"
        query = query.filter(
            (User.username.ilike(s)) | (User.full_name.ilike(s)) | (User.email.ilike(s))
        )
    return query.order_by(User.created_at.desc()).all()


@router.post("/users", response_model=UserResponse)
def create_user(
    payload: UserCreate,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    """Creates a new user account."""
    existing = (
        db.query(User)
        .filter((User.username == payload.username) | (User.email == payload.email))
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Tên đăng nhập hoặc Email đã tồn tại.")

    user = User(
        username=payload.username.lower(),
        email=payload.email.lower(),
        password_hash=get_password_hash(payload.password),
        role=payload.role,
        full_name=payload.full_name,
        phone=payload.phone,
        student_code=payload.student_code.upper() if payload.student_code else None,
        class_name=payload.class_name,
        cohort=payload.cohort,
        faculty=payload.faculty,
        birth_date=payload.birth_date,
        unit_code=payload.unit_code,
        management_scope=payload.management_scope,
        is_active=payload.is_active,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.put("/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: str,
    payload: UserUpdate,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    """Updates an existing user account."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng.")

    update_data = payload.dict(exclude_unset=True)
    for field, val in update_data.items():
        setattr(user, field, val)

    db.commit()
    db.refresh(user)
    return user


# ----------------------------------------------------------------------------
# Categories Management
# ----------------------------------------------------------------------------
@router.get("/categories", response_model=List[CategoryResponse])
def list_categories(
    current_user: User = Depends(require_role(["admin", "btc"])),
    db: Session = Depends(get_db),
):
    """Lists all event categories and count of related events."""
    cats = db.query(Category).order_by(Category.id.asc()).all()
    results = []
    for c in cats:
        count = db.query(Event).filter(Event.category_id == c.id).count()
        results.append(
            CategoryResponse(
                id=c.id,
                code=c.code,
                name=c.name,
                description=c.description,
                min_drl=c.min_drl,
                max_drl=c.max_drl,
                is_active=c.is_active,
                event_count=count,
            )
        )
    return results


@router.post("/categories", response_model=CategoryResponse)
def create_category(
    payload: CategoryCreate,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    """Creates a new event category."""
    existing = db.query(Category).filter(Category.code == payload.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Mã danh mục đã tồn tại.")

    cat = Category(
        code=payload.code,
        name=payload.name,
        description=payload.description,
        min_drl=payload.min_drl,
        max_drl=payload.max_drl,
        is_active=payload.is_active,
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return CategoryResponse(
        id=cat.id,
        code=cat.code,
        name=cat.name,
        description=cat.description,
        min_drl=cat.min_drl,
        max_drl=cat.max_drl,
        is_active=cat.is_active,
        event_count=0,
    )


# ----------------------------------------------------------------------------
# System Configuration
# ----------------------------------------------------------------------------
@router.get("/system-config", response_model=SystemConfigSchema)
def get_system_config(
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    """Retrieves current AI and GPS system configurations."""
    configs = db.query(SystemConfig).all()
    config_dict = {c.config_key: c.config_value for c in configs}

    return SystemConfigSchema(
        ai_model=config_dict.get("ai_model", "FaceNet / Dlib 128-D"),
        face_threshold_percent=float(config_dict.get("face_threshold_percent", 85.0)),
        min_face_res=config_dict.get("min_face_res", "150x150"),
        default_radius=float(config_dict.get("default_radius", 50.0)),
        max_gps_acc=float(config_dict.get("max_gps_acc", 100.0)),
        checkin_window_before=int(config_dict.get("checkin_window_before", 30)),
        checkin_window_after=int(config_dict.get("checkin_window_after", 30)),
        checkout_window_before=int(config_dict.get("checkout_window_before", 30)),
        checkout_window_after=int(config_dict.get("checkout_window_after", 30)),
        makeup_hours_after_end=int(config_dict.get("makeup_hours_after_end", 24)),
    )


@router.post("/system-config", response_model=MessageResponse)
def save_system_config(
    payload: SystemConfigSchema,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    """Updates AI and GPS system configurations."""
    data = payload.dict()
    for key, val in data.items():
        cfg = db.query(SystemConfig).filter(SystemConfig.config_key == key).first()
        if cfg:
            cfg.config_value = str(val)
            cfg.updated_by = current_user.id
            cfg.updated_at = datetime.utcnow()
        else:
            new_cfg = SystemConfig(
                config_key=key,
                config_value=str(val),
                updated_by=current_user.id,
            )
            db.add(new_cfg)
    db.commit()
    return MessageResponse(message="Đã lưu cấu hình hệ thống thành công.")
