from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.exc import NoResultFound
from sqlmodel import Session, select
from ..database import get_session
from ..models import User
from ..core.security import decode_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)) -> User:
    username = decode_token(token)
    statement = select(User).where((User.username == username) | (User.email == username))
    results = session.exec(statement)
    user = results.first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User account is deactivated")
    return user

def require_role(*roles):
    def _role_checker(current_user: User = Depends(get_current_user)):
        # Handle both enum and string roles
        user_role = current_user.role.value if hasattr(current_user.role, 'value') else current_user.role
        if user_role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
        return current_user
    return _role_checker

def require_admin(current_user: User = Depends(get_current_user)):
    # Handle both enum and string roles
    user_role = current_user.role.value if hasattr(current_user.role, 'value') else current_user.role
    if user_role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user
