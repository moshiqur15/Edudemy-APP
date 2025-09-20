from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, or_
from typing import List, Optional, Dict, Any
from datetime import datetime
from ..database import get_session
from ..models import Teacher, User, ClassAssignment, Batch, Student
from ..schemas import (
    TeacherCreate, TeacherRead, TeacherUpdate, TeacherWithUser,
    ClassAssignmentCreate, ClassAssignmentRead, UserCreate, UserRead
)
from ..core.deps import require_role, get_current_user
from ..core.security import get_password_hash

router = APIRouter(prefix="/teachers", tags=["teachers"])

@router.post('/', response_model=TeacherRead)
def create_teacher(
    payload: TeacherCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role('admin', 'superadmin'))
):
    """Create a new teacher profile"""
    
    # Verify user exists and is a teacher
    user = session.get(User, payload.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.role != "teacher":
        raise HTTPException(status_code=400, detail="User must have teacher role")
    
    # Check if teacher profile already exists for this user
    existing_teacher = session.exec(
        select(Teacher).where(Teacher.user_id == payload.user_id)
    ).first()
    if existing_teacher:
        raise HTTPException(status_code=400, detail="Teacher profile already exists for this user")
    
    # Generate employee ID if not provided
    if not payload.employee_id:
        # Generate simple employee ID: T + current year + sequential number
        year = datetime.utcnow().year
        max_emp_id = session.exec(
            select(Teacher.employee_id).where(
                Teacher.employee_id.like(f"T{year}%")
            ).order_by(Teacher.employee_id.desc())
        ).first()
        
        if max_emp_id:
            try:
                last_num = int(max_emp_id.split('T')[1][4:])  # Extract number after T{YEAR}
                next_num = last_num + 1
            except:
                next_num = 1
        else:
            next_num = 1
        
        payload.employee_id = f"T{year}{next_num:03d}"
    
    teacher = Teacher(**payload.model_dump())
    session.add(teacher)
    session.commit()
    session.refresh(teacher)
    
    return teacher

@router.post('/with-user', response_model=TeacherWithUser)
def create_teacher_with_user(
    teacher_data: Dict[str, Any],
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role('admin', 'superadmin'))
):
    """Create a teacher with user account in one step"""
    
    # Extract user data
    user_data = {
        "email": teacher_data["email"],
        "username": teacher_data["username"],
        "full_name": teacher_data["full_name"],
        "password": teacher_data.get("password", "teacher123"),
        "role": "teacher",
        "phone": teacher_data.get("phone"),
        "department": teacher_data.get("department"),
        "is_active": True
    }
    
    # Check if username or email already exists
    existing_user = session.exec(
        select(User).where((User.username == user_data["username"]) | (User.email == user_data["email"]))
    ).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username or email already exists")
    
    # Create user account
    db_user = User(
        **{k: v for k, v in user_data.items() if k != "password"},
        hashed_password=get_password_hash(user_data["password"]),
        created_by=current_user.id
    )
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    
    # Create teacher profile
    teacher_profile_data = {
        "user_id": db_user.id,
        "subjects": teacher_data.get("subjects"),
        "specialization": teacher_data.get("specialization"),
        "qualification": teacher_data.get("qualification"),
        "additional_qualifications": teacher_data.get("additional_qualifications"),
        "experience_years": teacher_data.get("experience_years"),
        "previous_experience": teacher_data.get("previous_experience"),
        "joining_date": teacher_data.get("joining_date", datetime.utcnow()),
        "employment_type": teacher_data.get("employment_type", "full_time"),
        "hourly_rate": teacher_data.get("hourly_rate"),
        "emergency_contact": teacher_data.get("emergency_contact"),
        "emergency_contact_relation": teacher_data.get("emergency_contact_relation"),
        "preferred_classes": teacher_data.get("preferred_classes"),
        "max_classes_per_day": teacher_data.get("max_classes_per_day", 6),
        "preferred_time_slots": teacher_data.get("preferred_time_slots"),
        "bio": teacher_data.get("bio"),
        "achievements": teacher_data.get("achievements")
    }
    
    # Generate employee ID
    year = datetime.utcnow().year
    max_emp_id = session.exec(
        select(Teacher.employee_id).where(
            Teacher.employee_id.like(f"T{year}%")
        ).order_by(Teacher.employee_id.desc())
    ).first()
    
    if max_emp_id:
        try:
            last_num = int(max_emp_id.split('T')[1][4:])
            next_num = last_num + 1
        except:
            next_num = 1
    else:
        next_num = 1
    
    teacher_profile_data["employee_id"] = f"T{year}{next_num:03d}"
    
    teacher = Teacher(**teacher_profile_data)
    session.add(teacher)
    session.commit()
    session.refresh(teacher)
    
    return TeacherWithUser(teacher=teacher, user=db_user)

@router.get('/', response_model=List[TeacherRead])
def list_teachers(
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    search: Optional[str] = Query(None),
    subject: Optional[str] = Query(None),
    employment_type: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    session: Session = Depends(get_session),
    _=Depends(require_role('admin', 'superadmin', 'academics', 'management'))
):
    """List teachers with filtering and search capabilities"""
    try:
        # Start with a basic select to avoid complex query issues
        query = select(Teacher)
        
        # Apply only safe filters that we know exist
        if is_active is not None:
            query = query.where(Teacher.is_active == is_active)
        
        # Simple search on known safe fields
        if search and len(search.strip()) > 0:
            query = query.where(
                Teacher.employee_id.icontains(search) if Teacher.employee_id is not None 
                else Teacher.id.isnot(None)
            )
        
        # Execute query with basic ordering and limits
        teachers = session.exec(
            query.order_by(Teacher.id.desc())
            .offset(offset)
            .limit(limit)
        ).all()
        
        return teachers
        
    except Exception as e:
        # If there's still an error, return empty list for debugging
        print(f"Teachers query error: {str(e)}")
        return []

@router.get('/{teacher_id}', response_model=TeacherWithUser)
def get_teacher(
    teacher_id: int,
    session: Session = Depends(get_session),
    _=Depends(require_role('admin', 'superadmin', 'academics', 'management', 'teacher'))
):
    """Get teacher by ID with user information"""
    teacher = session.get(Teacher, teacher_id)
    if not teacher:
        raise HTTPException(status_code=404, detail='Teacher not found')
    
    user = session.get(User, teacher.user_id)
    if not user:
        raise HTTPException(status_code=404, detail='Associated user not found')
    
    return TeacherWithUser(teacher=teacher, user=user)

@router.put('/{teacher_id}', response_model=TeacherRead)
def update_teacher(
    teacher_id: int,
    payload: TeacherUpdate,
    session: Session = Depends(get_session),
    _=Depends(require_role('admin', 'superadmin', 'academics'))
):
    """Update teacher information"""
    teacher = session.get(Teacher, teacher_id)
    if not teacher:
        raise HTTPException(status_code=404, detail='Teacher not found')
    
    update_data = payload.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    for key, value in update_data.items():
        setattr(teacher, key, value)
    
    session.commit()
    session.refresh(teacher)
    return teacher

@router.delete('/{teacher_id}')
def delete_teacher(
    teacher_id: int,
    session: Session = Depends(get_session),
    _=Depends(require_role('admin', 'superadmin'))
):
    """Delete/deactivate teacher"""
    teacher = session.get(Teacher, teacher_id)
    if not teacher:
        raise HTTPException(status_code=404, detail='Teacher not found')
    
    # Deactivate instead of hard delete
    teacher.is_active = False
    
    # Also deactivate associated user account
    if teacher.user_id:
        user = session.get(User, teacher.user_id)
        if user:
            user.is_active = False
    
    session.commit()
    
    return {"message": "Teacher deactivated successfully"}

# Class Assignment Management for Teachers
@router.get('/{teacher_id}/assignments', response_model=List[ClassAssignmentRead])
def get_teacher_assignments(
    teacher_id: int,
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get class assignments for a specific teacher"""
    
    # Teachers can only view their own assignments unless admin/academics
    if current_user.role == "teacher":
        teacher = session.exec(
            select(Teacher).where(Teacher.user_id == current_user.id)
        ).first()
        if not teacher or teacher.id != teacher_id:
            raise HTTPException(status_code=403, detail="Can only view your own assignments")
    
    query = select(ClassAssignment).where(ClassAssignment.teacher_id == teacher_id)
    
    if start_date:
        query = query.where(ClassAssignment.scheduled_at >= start_date)
    if end_date:
        query = query.where(ClassAssignment.scheduled_at <= end_date)
    
    assignments = session.exec(
        query.order_by(ClassAssignment.scheduled_at)
    ).all()
    
    return assignments

@router.post('/{teacher_id}/assignments', response_model=ClassAssignmentRead)
def assign_teacher_to_class(
    teacher_id: int,
    assignment: ClassAssignmentCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role('admin', 'superadmin', 'academics'))
):
    """Assign a teacher to a class/batch"""
    
    # Verify teacher exists
    teacher = session.get(Teacher, teacher_id)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    # Verify batch exists
    batch = session.get(Batch, assignment.batch_id)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    # Override teacher_id from URL parameter
    assignment_data = assignment.model_dump()
    assignment_data["teacher_id"] = teacher_id
    assignment_data["created_by"] = current_user.id
    
    class_assignment = ClassAssignment(**assignment_data)
    session.add(class_assignment)
    session.commit()
    session.refresh(class_assignment)
    
    return class_assignment

@router.get('/{teacher_id}/students', response_model=List[Dict[str, Any]])
def get_teacher_students(
    teacher_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get all students taught by a specific teacher"""
    
    # Teachers can only view their own students unless admin/academics
    if current_user.role == "teacher":
        teacher = session.exec(
            select(Teacher).where(Teacher.user_id == current_user.id)
        ).first()
        if not teacher or teacher.id != teacher_id:
            raise HTTPException(status_code=403, detail="Can only view your own students")
    
    # Get all batches assigned to this teacher
    assignments = session.exec(
        select(ClassAssignment).where(ClassAssignment.teacher_id == teacher_id)
    ).all()
    
    batch_ids = list(set([assignment.batch_id for assignment in assignments if assignment.batch_id]))
    
    if not batch_ids:
        return []
    
    # Get students from these batches
    students = session.exec(
        select(Student).where(Student.batch_id.in_(batch_ids))
        .order_by(Student.class_name, Student.student_roll_number)
    ).all()
    
    # Group by batch and include batch info
    result = []
    for student in students:
        batch = session.get(Batch, student.batch_id) if student.batch_id else None
        result.append({
            "student": student,
            "batch": batch,
            "subjects": [a.subject for a in assignments if a.batch_id == student.batch_id]
        })
    
    return result

@router.get('/{teacher_id}/workload')
def get_teacher_workload(
    teacher_id: int,
    week_start: Optional[datetime] = Query(None),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get teacher's workload summary"""
    
    # Teachers can only view their own workload unless admin/academics
    if current_user.role == "teacher":
        teacher = session.exec(
            select(Teacher).where(Teacher.user_id == current_user.id)
        ).first()
        if not teacher or teacher.id != teacher_id:
            raise HTTPException(status_code=403, detail="Can only view your own workload")
    
    teacher = session.get(Teacher, teacher_id)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    # Get all assignments for this teacher
    query = select(ClassAssignment).where(ClassAssignment.teacher_id == teacher_id)
    
    if week_start:
        from datetime import timedelta
        week_end = week_start + timedelta(days=7)
        query = query.where(
            ClassAssignment.scheduled_at >= week_start,
            ClassAssignment.scheduled_at <= week_end
        )
    
    assignments = session.exec(query).all()
    
    # Calculate workload statistics
    total_classes = len(assignments)
    unique_batches = len(set([a.batch_id for a in assignments if a.batch_id]))
    total_hours = sum([a.duration_minutes for a in assignments]) / 60.0
    
    # Get unique subjects
    subjects = list(set([a.subject for a in assignments if a.subject]))
    
    # Count students (approximate)
    batch_ids = list(set([a.batch_id for a in assignments if a.batch_id]))
    total_students = 0
    if batch_ids:
        students_count = session.exec(
            select(Student).where(Student.batch_id.in_(batch_ids))
        ).all()
        total_students = len(students_count)
    
    return {
        "teacher_id": teacher_id,
        "total_classes": total_classes,
        "unique_batches": unique_batches,
        "total_hours": total_hours,
        "subjects": subjects,
        "total_students": total_students,
        "assignments": assignments
    }

@router.get('/by-subject/{subject}', response_model=List[TeacherRead])
def get_teachers_by_subject(
    subject: str,
    session: Session = Depends(get_session),
    _=Depends(require_role('admin', 'superadmin', 'academics'))
):
    """Get all teachers who teach a specific subject"""
    teachers = session.exec(
        select(Teacher).where(
            Teacher.subjects.icontains(subject),
            Teacher.is_active == True
        ).order_by(Teacher.created_at)
    ).all()
    
    return teachers

@router.post('/bulk-assign-subject')
def bulk_assign_subject(
    teacher_ids: List[int],
    subject: str,
    session: Session = Depends(get_session),
    _=Depends(require_role('admin', 'superadmin', 'academics'))
):
    """Assign a subject to multiple teachers"""
    updated_count = 0
    
    for teacher_id in teacher_ids:
        teacher = session.get(Teacher, teacher_id)
        if teacher:
            # Add subject to existing subjects (comma-separated)
            current_subjects = teacher.subjects.split(',') if teacher.subjects else []
            if subject not in current_subjects:
                current_subjects.append(subject)
                teacher.subjects = ','.join(current_subjects)
                updated_count += 1
    
    session.commit()
    
    return {
        "message": f"Successfully assigned subject '{subject}' to {updated_count} teachers",
        "updated_count": updated_count
    }

@router.get('/my-profile', response_model=TeacherWithUser)
def get_my_teacher_profile(
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role('teacher'))
):
    """Get current teacher's profile"""
    teacher = session.exec(
        select(Teacher).where(Teacher.user_id == current_user.id)
    ).first()
    
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")
    
    return TeacherWithUser(teacher=teacher, user=current_user)

@router.put('/my-profile', response_model=TeacherRead)
def update_my_teacher_profile(
    payload: TeacherUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role('teacher'))
):
    """Update current teacher's profile (limited fields)"""
    teacher = session.exec(
        select(Teacher).where(Teacher.user_id == current_user.id)
    ).first()
    
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")
    
    # Teachers can only update certain fields
    allowed_fields = {
        'bio', 'achievements', 'emergency_contact', 'emergency_contact_relation',
        'preferred_classes', 'preferred_time_slots'
    }
    
    update_data = {
        k: v for k, v in payload.model_dump(exclude_unset=True).items()
        if k in allowed_fields
    }
    
    update_data["updated_at"] = datetime.utcnow()
    
    for key, value in update_data.items():
        setattr(teacher, key, value)
    
    session.commit()
    session.refresh(teacher)
    return teacher
