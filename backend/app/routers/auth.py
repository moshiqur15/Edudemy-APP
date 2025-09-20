from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from datetime import timedelta, datetime
from typing import List
from ..database import get_session
from ..models import User, AccessRequest, AccessRequestStatus, UserRole
from ..schemas import (
    Token, UserCreate, UserRead, LoginRequest, UserUpdate,
    AccessRequestCreate, AccessRequestVerify, AccessRequestResendCode,
    AccessRequestApprove, AccessRequestReject, AccessRequestRead
)
from ..core.security import verify_password, get_password_hash, create_access_token
from ..core.deps import get_current_user
from ..services.email_service import email_service
import asyncio
import re

router = APIRouter(prefix="/auth", tags=["auth"]) 

@router.post('/register', response_model=UserRead)
def register(payload: UserCreate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    # Only admin can create new users
    if current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="Only admin or superadmin can create new users")
    
    # Check if username or email already exists
    existing_user = session.exec(select(User).where((User.username == payload.username) | (User.email == payload.email))).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username or email already exists")
    
    user = User(
        email=payload.email,
        username=payload.username,
        full_name=payload.full_name,
        role=payload.role,
        designation=payload.designation,
        phone=payload.phone,
        department=payload.department,
        is_active=payload.is_active,
        hashed_password=get_password_hash(payload.password),
        created_by=current_user.id,
        updated_at=datetime.utcnow()
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@router.post('/login', response_model=Token)
def login(login_data: LoginRequest, session: Session = Depends(get_session)):
    stmt = select(User).where((User.username == login_data.username) | (User.email == login_data.username))
    user = session.exec(stmt).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="User account is deactivated")
    
    access_token_expires = timedelta(minutes=60)
    token = create_access_token(user.username, expires_delta=access_token_expires)
    # Convert user to dict manually to avoid model validation issues
    user_data = {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "full_name": user.full_name,
        "role": user.role,
        "designation": user.designation,
        "is_active": user.is_active,
        "phone": user.phone,
        "department": user.department,
        "created_at": user.created_at,
        "updated_at": user.updated_at
    }
    
    return {
        "access_token": token, 
        "token_type": "bearer",
        "user": user_data
    }

# Endpoint for initial super admin creation (should be secured in production)
@router.post('/create-superadmin', response_model=UserRead)
def create_initial_superadmin(session: Session = Depends(get_session)):
    # Check if any superadmin already exists
    from ..models import UserRole
    existing_superadmin = session.exec(select(User).where(User.role == UserRole.SUPERADMIN)).first()
    if existing_superadmin:
        raise HTTPException(status_code=400, detail="Super admin user already exists")
    
    superadmin_user = User(
        email="superadmin@edudemy.com",
        username="superadmin",
        full_name="Super Administrator",
        role=UserRole.SUPERADMIN,
        designation="Super Administrator",
        is_active=True,
        hashed_password=get_password_hash("superadmin123"),
        updated_at=datetime.utcnow()
    )
    session.add(superadmin_user)
    session.commit()
    session.refresh(superadmin_user)
    return superadmin_user

@router.get('/me', response_model=UserRead)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

@router.put('/me', response_model=UserRead)
def update_current_user(payload: UserUpdate, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    # Users can update their own basic info
    update_data = payload.model_dump(exclude_unset=True)
    
    # Remove role and is_active from update if not admin/superadmin
    if current_user.role not in ["admin", "superadmin"]:
        update_data.pop("role", None)
        update_data.pop("is_active", None)
    
    # Handle password update
    if "password" in update_data:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
    
    update_data["updated_at"] = datetime.utcnow()
    
    for key, value in update_data.items():
        setattr(current_user, key, value)
    
    session.commit()
    session.refresh(current_user)
    return current_user

# Helper function to generate username
def generate_username(full_name: str, existing_usernames: List[str]) -> str:
    """Generate a unique username from full name"""
    # Clean and normalize the full name
    base_username = re.sub(r'[^a-zA-Z0-9]', '.', full_name.lower().strip())
    base_username = re.sub(r'\.+', '.', base_username).strip('.')
    
    # If base username is available, use it
    if base_username not in existing_usernames:
        return base_username
    
    # Otherwise, add a number suffix
    counter = 1
    while f"{base_username}.{counter}" in existing_usernames:
        counter += 1
    
    return f"{base_username}.{counter}"

# Helper function to check role hierarchy
def can_manage_role(current_user_role: UserRole, requested_role: UserRole) -> bool:
    """Check if current user can manage the requested role based on hierarchy"""
    role_hierarchy = {
        UserRole.SUPERADMIN: 6,
        UserRole.ADMIN: 5,
        UserRole.MANAGEMENT: 4,
        UserRole.ACADEMICS: 3,
        UserRole.TEACHER: 2,
        UserRole.STUDENT: 1
    }
    
    current_level = role_hierarchy.get(current_user_role, 0)
    requested_level = role_hierarchy.get(requested_role, 0)
    
    # Superadmin can manage everything
    if current_user_role == UserRole.SUPERADMIN:
        return True
    
    # Others can only manage roles below their level
    return current_level > requested_level

# Access Request Endpoints
@router.post('/register-request')
async def register_request(payload: AccessRequestCreate, request: Request, session: Session = Depends(get_session)):
    """Submit a new access request with email verification"""
    
    # Validate email format
    email_regex = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
    if not re.match(email_regex, payload.email):
        raise HTTPException(status_code=400, detail="Invalid email format")
    
    # Check if email already exists in users or pending requests
    existing_user = session.exec(select(User).where(User.email == payload.email)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email is already registered")
    
    existing_request = session.exec(
        select(AccessRequest).where(
            AccessRequest.email == payload.email,
            AccessRequest.status == AccessRequestStatus.PENDING
        )
    ).first()
    if existing_request:
        raise HTTPException(status_code=400, detail="A pending access request already exists for this email")
    
    # Generate verification code and token
    verification_code = email_service.generate_verification_code()
    registration_token = email_service.generate_registration_token()
    verification_expires_at = email_service.get_verification_expiry()
    
    # Create access request
    access_request = AccessRequest(
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        requested_role=payload.requested_role,
        reason=payload.reason,
        verification_code=verification_code,
        registration_token=registration_token,
        verification_expires_at=verification_expires_at,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )
    
    session.add(access_request)
    session.commit()
    session.refresh(access_request)
    
    # Send verification email
    try:
        await email_service.send_verification_email(
            payload.email, 
            verification_code, 
            payload.full_name
        )
    except Exception as e:
        # Log the error but don't fail the request
        print(f"Failed to send verification email: {e}")
    
    return {
        "message": "Registration request submitted. Please check your email for verification code.",
        "registration_token": registration_token
    }

@router.post('/verify-registration')
async def verify_registration(payload: AccessRequestVerify, session: Session = Depends(get_session)):
    """Verify email with the provided code"""
    
    # Find the access request
    access_request = session.exec(
        select(AccessRequest).where(
            AccessRequest.registration_token == payload.registration_token,
            AccessRequest.status == AccessRequestStatus.PENDING
        )
    ).first()
    
    if not access_request:
        raise HTTPException(status_code=400, detail="Invalid or expired registration token")
    
    # Check if verification code is expired
    if access_request.verification_expires_at and datetime.utcnow() > access_request.verification_expires_at:
        raise HTTPException(status_code=400, detail="Verification code has expired")
    
    # Check verification code
    if access_request.verification_code != payload.verification_code:
        raise HTTPException(status_code=400, detail="Invalid verification code")
    
    # Mark as verified
    access_request.email_verified = True
    access_request.verification_code = None  # Clear the code for security
    access_request.verification_expires_at = None
    access_request.updated_at = datetime.utcnow()
    
    session.commit()
    
    return {"message": "Email verified successfully. Your access request is now pending admin approval."}

@router.post('/resend-verification')
async def resend_verification_code(payload: AccessRequestResendCode, session: Session = Depends(get_session)):
    """Resend verification code for a pending registration"""
    
    # Find the access request
    access_request = session.exec(
        select(AccessRequest).where(
            AccessRequest.registration_token == payload.registration_token,
            AccessRequest.status == AccessRequestStatus.PENDING,
            AccessRequest.email_verified == False
        )
    ).first()
    
    if not access_request:
        raise HTTPException(status_code=400, detail="Invalid token or email already verified")
    
    # Generate new verification code
    verification_code = email_service.generate_verification_code()
    verification_expires_at = email_service.get_verification_expiry()
    
    access_request.verification_code = verification_code
    access_request.verification_expires_at = verification_expires_at
    access_request.updated_at = datetime.utcnow()
    
    session.commit()
    
    # Send verification email
    try:
        await email_service.send_verification_email(
            access_request.email,
            verification_code,
            access_request.full_name
        )
    except Exception as e:
        print(f"Failed to resend verification email: {e}")
    
    return {"message": "Verification code resent. Please check your email."}

@router.get('/access-requests', response_model=List[AccessRequestRead])
async def get_access_requests(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    """Get access requests that the current user can manage"""
    
    # Check if user can manage access requests
    if current_user.role not in [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGEMENT]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # Get all access requests, but we'll filter by hierarchy client-side
    access_requests = session.exec(
        select(AccessRequest).where(
            AccessRequest.email_verified == True
        ).order_by(AccessRequest.created_at.desc())
    ).all()
    
    # Filter based on role hierarchy
    filtered_requests = []
    for request in access_requests:
        if can_manage_role(current_user.role, request.requested_role):
            # Add reviewer name if reviewed
            request_data = AccessRequestRead.from_orm(request)
            if request.reviewed_by:
                reviewer = session.get(User, request.reviewed_by)
                request_data.reviewed_by_name = reviewer.full_name if reviewer else None
            filtered_requests.append(request_data)
    
    return filtered_requests

@router.post('/access-requests/{request_id}/approve')
async def approve_access_request(
    request_id: int, 
    payload: AccessRequestApprove, 
    current_user: User = Depends(get_current_user), 
    session: Session = Depends(get_session)
):
    """Approve an access request and create user account"""
    
    # Get the access request
    access_request = session.get(AccessRequest, request_id)
    if not access_request:
        raise HTTPException(status_code=404, detail="Access request not found")
    
    # Check permissions
    if not can_manage_role(current_user.role, access_request.requested_role):
        raise HTTPException(status_code=403, detail="Insufficient permissions to approve this role")
    
    # Check if already processed
    if access_request.status != AccessRequestStatus.PENDING:
        raise HTTPException(status_code=400, detail="Access request has already been processed")
    
    # Check if email verified
    if not access_request.email_verified:
        raise HTTPException(status_code=400, detail="Email not verified")
    
    # Check if email already exists (double-check)
    existing_user = session.exec(select(User).where(User.email == access_request.email)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email is already registered")
    
    # Generate username
    existing_usernames = [user.username for user in session.exec(select(User.username)).all()]
    username = generate_username(access_request.full_name, existing_usernames)
    
    # Create user account
    new_user = User(
        email=access_request.email,
        username=username,
        full_name=access_request.full_name,
        role=access_request.requested_role,
        is_active=True,
        hashed_password=access_request.hashed_password,
        created_by=current_user.id,
        updated_at=datetime.utcnow()
    )
    
    session.add(new_user)
    
    # Update access request
    access_request.status = AccessRequestStatus.APPROVED
    access_request.username = username
    access_request.reviewed_by = current_user.id
    access_request.reviewed_at = datetime.utcnow()
    access_request.admin_reason = payload.reason
    access_request.updated_at = datetime.utcnow()
    
    session.commit()
    session.refresh(new_user)
    
    # Send approval email
    try:
        await email_service.send_access_approved_email(
            access_request.email,
            access_request.full_name,
            username,
            access_request.requested_role
        )
    except Exception as e:
        print(f"Failed to send approval email: {e}")
    
    return {
        "message": "Access request approved successfully",
        "user_id": new_user.id,
        "username": username
    }

@router.post('/access-requests/{request_id}/reject')
async def reject_access_request(
    request_id: int,
    payload: AccessRequestReject,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Reject an access request"""
    
    # Get the access request
    access_request = session.get(AccessRequest, request_id)
    if not access_request:
        raise HTTPException(status_code=404, detail="Access request not found")
    
    # Check permissions
    if not can_manage_role(current_user.role, access_request.requested_role):
        raise HTTPException(status_code=403, detail="Insufficient permissions to manage this request")
    
    # Check if already processed
    if access_request.status != AccessRequestStatus.PENDING:
        raise HTTPException(status_code=400, detail="Access request has already been processed")
    
    # Update access request
    access_request.status = AccessRequestStatus.REJECTED
    access_request.reviewed_by = current_user.id
    access_request.reviewed_at = datetime.utcnow()
    access_request.admin_reason = payload.reason
    access_request.updated_at = datetime.utcnow()
    
    session.commit()
    
    # Send rejection email
    try:
        await email_service.send_access_rejected_email(
            access_request.email,
            access_request.full_name,
            payload.reason
        )
    except Exception as e:
        print(f"Failed to send rejection email: {e}")
    
    return {"message": "Access request rejected successfully"}
