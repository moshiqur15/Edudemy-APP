from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from ..database import get_session
from ..models import User, Permission, RolePermission, UserPermission, UserRole
from ..schemas import PermissionCreate, PermissionRead, RolePermissionCreate, UserPermissionCreate
from ..core.deps import get_current_user, require_role

router = APIRouter(prefix="/permissions", tags=["permissions"])

@router.post("/", response_model=PermissionRead)
def create_permission(
    permission: PermissionCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("superadmin", "admin"))
):
    # Check if permission already exists
    existing = session.exec(
        select(Permission).where(Permission.name == permission.name)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Permission already exists")
    
    db_permission = Permission(**permission.model_dump())
    session.add(db_permission)
    session.commit()
    session.refresh(db_permission)
    return db_permission

@router.get("/", response_model=List[PermissionRead])
def list_permissions(
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("superadmin", "admin"))
):
    permissions = session.exec(select(Permission)).all()
    return permissions

@router.post("/role-permissions/", response_model=dict)
def assign_role_permission(
    role_permission: RolePermissionCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("superadmin", "admin"))
):
    # Check if permission exists
    permission = session.get(Permission, role_permission.permission_id)
    if not permission:
        raise HTTPException(status_code=404, detail="Permission not found")
    
    # Check if role permission already exists
    existing = session.exec(
        select(RolePermission).where(
            RolePermission.role == role_permission.role,
            RolePermission.permission_id == role_permission.permission_id
        )
    ).first()
    
    if existing:
        existing.granted = role_permission.granted
    else:
        db_role_permission = RolePermission(**role_permission.model_dump())
        session.add(db_role_permission)
    
    session.commit()
    return {"message": "Role permission updated successfully"}

@router.post("/user-permissions/", response_model=dict)
def assign_user_permission(
    user_permission: UserPermissionCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("superadmin", "admin"))
):
    # Check if user and permission exist
    user = session.get(User, user_permission.user_id)
    permission = session.get(Permission, user_permission.permission_id)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not permission:
        raise HTTPException(status_code=404, detail="Permission not found")
    
    # Check if user permission already exists
    existing = session.exec(
        select(UserPermission).where(
            UserPermission.user_id == user_permission.user_id,
            UserPermission.permission_id == user_permission.permission_id
        )
    ).first()
    
    if existing:
        existing.granted = user_permission.granted
        existing.granted_by = current_user.id
    else:
        db_user_permission = UserPermission(
            **user_permission.model_dump(),
            granted_by=current_user.id
        )
        session.add(db_user_permission)
    
    session.commit()
    return {"message": "User permission updated successfully"}

@router.get("/role/{role}/permissions", response_model=List[PermissionRead])
def get_role_permissions(
    role: UserRole,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("superadmin", "admin"))
):
    role_permissions = session.exec(
        select(Permission)
        .join(RolePermission, Permission.id == RolePermission.permission_id)
        .where(RolePermission.role == role, RolePermission.granted == True)
    ).all()
    return role_permissions

@router.get("/user/{user_id}/permissions", response_model=List[PermissionRead])
def get_user_permissions(
    user_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("superadmin", "admin"))
):
    # Get role-based permissions
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    role_permissions = session.exec(
        select(Permission)
        .join(RolePermission, Permission.id == RolePermission.permission_id)
        .where(RolePermission.role == user.role, RolePermission.granted == True)
    ).all()
    
    # Get user-specific permissions
    user_permissions = session.exec(
        select(Permission)
        .join(UserPermission, Permission.id == UserPermission.permission_id)
        .where(UserPermission.user_id == user_id, UserPermission.granted == True)
    ).all()
    
    # Combine and deduplicate
    all_permissions = {p.id: p for p in role_permissions}
    for p in user_permissions:
        all_permissions[p.id] = p
    
    return list(all_permissions.values())

# Helper function to check if user has specific permission
def has_permission(user: User, resource: str, action: str, session: Session) -> bool:
    # Check role-based permissions
    role_permission = session.exec(
        select(RolePermission)
        .join(Permission, RolePermission.permission_id == Permission.id)
        .where(
            RolePermission.role == user.role,
            Permission.resource == resource,
            Permission.action == action,
            RolePermission.granted == True
        )
    ).first()
    
    if role_permission:
        return True
    
    # Check user-specific permissions
    user_permission = session.exec(
        select(UserPermission)
        .join(Permission, UserPermission.permission_id == Permission.id)
        .where(
            UserPermission.user_id == user.id,
            Permission.resource == resource,
            Permission.action == action,
            UserPermission.granted == True
        )
    ).first()
    
    return user_permission is not None

@router.get("/my-permissions", response_model=List[PermissionRead])
def get_my_permissions(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # Get role-based permissions
    role_permissions = session.exec(
        select(Permission)
        .join(RolePermission, Permission.id == RolePermission.permission_id)
        .where(RolePermission.role == current_user.role, RolePermission.granted == True)
    ).all()
    
    # Get user-specific permissions
    user_permissions = session.exec(
        select(Permission)
        .join(UserPermission, Permission.id == UserPermission.permission_id)
        .where(UserPermission.user_id == current_user.id, UserPermission.granted == True)
    ).all()
    
    # Combine and deduplicate
    all_permissions = {p.id: p for p in role_permissions}
    for p in user_permissions:
        all_permissions[p.id] = p
    
    return list(all_permissions.values())

# Available system permissions/tabs for UI management
SYSTEM_PERMISSIONS = [
    {"id": "dashboard", "name": "Dashboard", "description": "Access to main dashboard"},
    {"id": "user_management", "name": "User Management", "description": "Manage system users"},
    {"id": "students", "name": "Students", "description": "Manage student records"},
    {"id": "teachers", "name": "Teachers", "description": "Manage teacher records"},
    {"id": "batches", "name": "Batches", "description": "Manage student batches"},
    {"id": "analytics", "name": "Analytics", "description": "View system analytics"},
    {"id": "attendance", "name": "Attendance", "description": "Manage attendance records"},
    {"id": "gradebook", "name": "Grade Book", "description": "Access grade management"},
    {"id": "classes", "name": "Class Management", "description": "Manage class schedules"},
    {"id": "exams", "name": "Exam Management", "description": "Manage exams and assessments"},
    {"id": "reports", "name": "Reports", "description": "Generate and view reports"},
    {"id": "behavior", "name": "Behavior Records", "description": "Manage behavior tracking"},
    {"id": "tasks", "name": "Task Management", "description": "Manage tasks and assignments"},
    {"id": "feedback", "name": "Feedback", "description": "Handle feedback system"},
    {"id": "permissions", "name": "Permissions", "description": "Manage user permissions"},
    {"id": "settings", "name": "Settings", "description": "System configuration"},
]

# Default role permissions
DEFAULT_ROLE_PERMISSIONS = {
    "superadmin": [p["id"] for p in SYSTEM_PERMISSIONS],
    "admin": ["dashboard", "user_management", "students", "teachers", "batches", "analytics", "attendance", "gradebook", "classes", "exams", "reports", "behavior", "tasks", "feedback", "permissions", "settings"],
    "management": ["dashboard", "analytics", "attendance", "gradebook", "tasks", "reports", "feedback"],
    "academics": ["dashboard", "analytics", "attendance", "gradebook", "classes", "exams", "reports", "behavior", "batches"],
    "teacher": ["dashboard", "classes", "gradebook", "attendance"],
    "student": ["dashboard", "gradebook", "attendance", "feedback"]
}

@router.get("/system/available")
def get_available_system_permissions(
    current_user: User = Depends(require_role("superadmin", "admin"))
):
    """Get all available system permissions for UI management"""
    return {"permissions": SYSTEM_PERMISSIONS}

@router.get("/system/roles")
def get_system_role_permissions(
    current_user: User = Depends(require_role("superadmin", "admin"))
):
    """Get permission settings for all roles"""
    return {"role_permissions": DEFAULT_ROLE_PERMISSIONS}

@router.put("/system/roles/{role}")
def update_system_role_permissions(
    role: str,
    permissions: dict,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("superadmin", "admin"))
):
    """Update default permissions for a role"""
    permission_list = permissions.get("permissions", [])
    
    # Validate role exists
    if role not in [r.value for r in UserRole]:
        raise HTTPException(status_code=400, detail=f"Invalid role: {role}")
    
    # Validate all permissions exist
    valid_permission_ids = [p["id"] for p in SYSTEM_PERMISSIONS]
    invalid_permissions = [p for p in permission_list if p not in valid_permission_ids]
    if invalid_permissions:
        raise HTTPException(status_code=400, detail=f"Invalid permissions: {invalid_permissions}")
    
    # For now, we'll store this in memory
    # In production, you might want to store this in database
    DEFAULT_ROLE_PERMISSIONS[role] = permission_list
    
    return {
        "message": f"Successfully updated permissions for {role} role",
        "role": role,
        "permissions": permission_list
    }

@router.get("/system/user/{user_id}")
def get_system_user_permissions(
    user_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("superadmin", "admin"))
):
    """Get system permissions for a specific user"""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get user-specific permissions (custom overrides)
    user_permissions = session.exec(
        select(Permission)
        .join(UserPermission, Permission.id == UserPermission.permission_id)
        .where(UserPermission.user_id == user_id, UserPermission.granted == True)
    ).all()
    
    custom_permissions = [p.name for p in user_permissions]
    
    # If no custom permissions, use role defaults
    effective_permissions = custom_permissions if custom_permissions else DEFAULT_ROLE_PERMISSIONS.get(user.role.value, [])
    
    return {
        "user_id": user_id,
        "user": {
            "id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role.value,
            "is_active": user.is_active
        },
        "effective_permissions": effective_permissions,
        "has_custom_permissions": len(custom_permissions) > 0,
        "custom_permissions": custom_permissions
    }

@router.put("/system/user/{user_id}")
def update_system_user_permissions(
    user_id: int,
    permissions: dict,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("superadmin", "admin"))
):
    """Update system permissions for a specific user"""
    permission_list = permissions.get("permissions", [])
    
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Validate all permissions exist
    valid_permission_ids = [p["id"] for p in SYSTEM_PERMISSIONS]
    invalid_permissions = [p for p in permission_list if p not in valid_permission_ids]
    if invalid_permissions:
        raise HTTPException(status_code=400, detail=f"Invalid permissions: {invalid_permissions}")
    
    # Remove existing user permissions
    existing_permissions = session.exec(
        select(UserPermission).where(UserPermission.user_id == user_id)
    ).all()
    for perm in existing_permissions:
        session.delete(perm)
    
    # Create/update permissions in database
    for perm_id in permission_list:
        # Ensure permission exists in system
        permission = session.exec(
            select(Permission).where(Permission.name == perm_id)
        ).first()
        
        if not permission:
            # Create permission if it doesn't exist
            permission = Permission(
                name=perm_id,
                description=f"Access to {perm_id}",
                resource=perm_id,
                action="access"
            )
            session.add(permission)
            session.commit()
            session.refresh(permission)
        
        # Create user permission
        user_permission = UserPermission(
            user_id=user_id,
            permission_id=permission.id,
            granted=True,
            granted_by=current_user.id
        )
        session.add(user_permission)
    
    session.commit()
    
    return {
        "message": f"Successfully updated permissions for user {user.username}",
        "user_id": user_id,
        "permissions": permission_list
    }

@router.get("/system/effective/{user_id}")
def get_effective_system_permissions(
    user_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get effective system permissions for a user (for navigation)"""
    # Allow users to check their own permissions, or admins to check any user
    if current_user.id != user_id and current_user.role.value not in ['superadmin', 'admin']:
        raise HTTPException(status_code=403, detail="Access denied")
    
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check for user-specific permissions first
    user_permissions = session.exec(
        select(Permission)
        .join(UserPermission, Permission.id == UserPermission.permission_id)
        .where(UserPermission.user_id == user_id, UserPermission.granted == True)
    ).all()
    
    if user_permissions:
        # User has custom permissions
        custom_permission_ids = [p.name for p in user_permissions]
        return {
            "user_id": user_id,
            "permissions": custom_permission_ids,
            "source": "custom"
        }
    else:
        # Use role defaults
        role_permissions = DEFAULT_ROLE_PERMISSIONS.get(user.role.value, [])
        return {
            "user_id": user_id,
            "permissions": role_permissions,
            "source": "role_default"
        }

@router.get("/system/stats")
def get_permission_stats(
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("superadmin", "admin"))
):
    """Get statistics about users and permissions"""
    # Get user counts by role
    role_stats = {}
    for role in UserRole:
        users = session.exec(select(User).where(User.role == role)).all()
        role_stats[role.value] = {
            "total": len(users),
            "active": len([u for u in users if u.is_active]),
            "inactive": len([u for u in users if not u.is_active])
        }
    
    # Get custom permissions count
    custom_permissions = session.exec(
        select(UserPermission).where(UserPermission.granted == True)
    ).all()
    users_with_custom = len(set([up.user_id for up in custom_permissions]))
    
    return {
        "role_stats": role_stats,
        "users_with_custom_permissions": users_with_custom,
        "total_custom_permissions": len(custom_permissions),
        "available_permissions": len(SYSTEM_PERMISSIONS)
    }
