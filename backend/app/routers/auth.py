"""
KMA Hub — Authentication API Router
File: backend/app/routers/auth.py
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from ..core.database import get_db
from ..core.security import verify_password, get_password_hash, create_access_token
from ..core.dependencies import get_current_user
from ..models.models import User
from ..schemas.schemas import LoginRequest, TokenResponse, ChangePasswordRequest, MessageResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """
    Login endpoint supporting:
    - Student code (e.g., AT180123)
    - Username
    - Email (@actvn.edu.vn)
    """
    raw_user = payload.username.strip()
    user_lower = raw_user.lower()

    # Search user by username, email, or student_code
    user = (
        db.query(User)
        .filter(
            or_(
                User.username == user_lower,
                User.email == user_lower,
                User.student_code == raw_user.upper(),
            ),
            User.is_active == 1,
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tài khoản hoặc mật khẩu không chính xác.",
        )

    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tài khoản hoặc mật khẩu không chính xác.",
        )

    # Generate JWT
    token_data = {
        "sub": user.id,
        "username": user.username,
        "role": user.role,
        "full_name": user.full_name,
    }
    token = create_access_token(token_data)

    return TokenResponse(
        access_token=token,
        token_type="Bearer",
        user_id=user.student_code or user.username,
        username=user.username,
        full_name=user.full_name,
        role=user.role,
        email=user.email,
        student_code=user.student_code,
        avatar_url=user.avatar_url,
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Returns the authenticated user profile information."""
    return current_user


@router.post("/change-password", response_model=MessageResponse)
def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Changes password for the current authenticated user."""
    if not verify_password(payload.old_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mật khẩu hiện tại không chính xác.",
        )

    if len(payload.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mật khẩu mới phải có ít nhất 6 ký tự.",
        )

    current_user.password_hash = get_password_hash(payload.new_password)
    db.commit()

    return MessageResponse(message="Đổi mật khẩu thành công.")
