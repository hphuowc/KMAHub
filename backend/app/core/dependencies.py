"""
KMA Hub — Request Dependencies & Role-Based Access Control (RBAC)
File: backend/app/core/dependencies.py
"""

from typing import List, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from .database import get_db
from .security import decode_access_token

security_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db)
):
    """
    Validates JWT token and fetches the current authenticated user.
    """
    from ..models.models import User  # Deferred import to avoid circular dependency

    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Yêu cầu đăng nhập (Không tìm thấy Bearer Token).",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Phiên làm việc hết hạn hoặc token không hợp lệ.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Dữ liệu token không hợp lệ.",
        )
    
    user = db.query(User).filter(User.id == user_id, User.is_active == 1).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tài khoản không tồn tại hoặc đã bị vô hiệu hóa.",
        )
    
    return user


def require_role(allowed_roles: List[str]):
    """
    Decorator dependency to check if current user has one of the allowed roles.
    Example: Depends(require_role(["admin", "btc"]))
    """
    def role_checker(current_user=Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Bạn không có quyền thực hiện chức năng này (Yêu cầu vai trò: {', '.join(allowed_roles)}).",
            )
        return current_user
    
    return role_checker
