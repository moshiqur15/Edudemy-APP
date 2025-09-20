from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, or_
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from ..database import get_session
from ..models import Student, Gender, StudentVersion, Batch, User
from ..schemas import StudentCreate, StudentRead, StudentUpdate, StudentIDPreview
from ..core.deps import require_role, get_current_user
from ..utils.student_id_generator import StudentIDGenerator

router = APIRouter(prefix="/students", tags=["students"])

@router.post('/preview-id', response_model=StudentIDPreview)
def preview_student_id(
    gender: Gender,
    class_name: str,
    admission_date: Optional[datetime] = None,
    session: Session = Depends(get_session),
    _=Depends(require_role('superadmin', 'admin', 'management', 'academics'))
):
    """Preview what the student ID would look like"""
    # Get next serial for preview
    next_serial = StudentIDGenerator.get_next_admission_serial(session, class_name, gender)
    
    preview = StudentIDGenerator.preview_student_id(
        gender=gender,
        class_name=class_name,
        admission_date=admission_date,
        mock_serial=next_serial
    )
    return preview

@router.post('/', response_model=StudentRead)
def create_student(
    payload: StudentCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role('superadmin', 'admin', 'management', 'academics'))
):
    """Create a new student with auto-generated IDs"""
    try:
        # Generate student IDs
        id_data = StudentIDGenerator.validate_and_generate_ids(
            session=session,
            gender=payload.gender,
            class_name=payload.class_name,
            admission_date=payload.admission_date
        )
        
        # Create student with generated data
        student_data = payload.model_dump()
        student_data.update(id_data)
        
        # Set legacy fields for backward compatibility
        if payload.father_contact and not payload.phone:
            student_data['phone'] = payload.father_contact
        if not student_data.get('parent_name'):
            student_data['parent_name'] = payload.father_name
        if not student_data.get('parent_phone'):
            student_data['parent_phone'] = payload.father_contact
        
        student = Student(**student_data)
        session.add(student)
        session.commit()
        session.refresh(student)
        
        # Update batch student count if assigned to batch
        if student.batch_id:
            batch = session.get(Batch, student.batch_id)
            if batch:
                batch.current_students_count = (batch.current_students_count or 0) + 1
                session.commit()
        
        return student
        
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating student: {str(e)}")

@router.get('/', response_model=List[StudentRead])
def list_students(
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    search: Optional[str] = Query(None),
    batch_id: Optional[int] = Query(None),
    class_name: Optional[str] = Query(None),
    version: Optional[StudentVersion] = Query(None),
    gender: Optional[Gender] = Query(None),
    is_active: Optional[bool] = Query(None),
    session: Session = Depends(get_session),
    _=Depends(require_role('superadmin', 'admin', 'management', 'teacher', 'academics'))
):
    """List students with filtering and search capabilities"""
    query = select(Student)
    
    # Apply filters
    if search:
        query = query.where(
            or_(
                Student.full_name.icontains(search),
                Student.father_name.icontains(search),
                Student.mother_name.icontains(search),
                Student.student_reg_number.icontains(search),
                Student.student_roll_number.icontains(search)
            )
        )
    
    if batch_id:
        query = query.where(Student.batch_id == batch_id)
    
    if class_name:
        query = query.where(Student.class_name == class_name)
    
    if version:
        query = query.where(Student.version == version)
    
    if gender:
        query = query.where(Student.gender == gender)
    
    students = session.exec(
        query.order_by(Student.admission_date.desc())
        .offset(offset)
        .limit(limit)
    ).all()
    
    return students

@router.get('/{student_id}', response_model=StudentRead)
def get_student(
    student_id: int,
    session: Session = Depends(get_session),
    _=Depends(require_role('superadmin', 'admin', 'management', 'teacher', 'academics'))
):
    """Get student by ID"""
    student = session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail='Student not found')
    return student

@router.put('/{student_id}', response_model=StudentRead)
def update_student(
    student_id: int,
    payload: StudentUpdate,
    session: Session = Depends(get_session),
    _=Depends(require_role('superadmin', 'admin', 'management', 'academics'))
):
    """Update student information"""
    student = session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail='Student not found')
    
    update_data = payload.model_dump(exclude_unset=True)
    
    # Handle batch change - update counts
    old_batch_id = student.batch_id
    new_batch_id = update_data.get('batch_id')
    
    # Update student fields
    for key, value in update_data.items():
        setattr(student, key, value)
    
    # Update batch counts if batch changed
    if old_batch_id != new_batch_id:
        # Decrease count from old batch
        if old_batch_id:
            old_batch = session.get(Batch, old_batch_id)
            if old_batch and old_batch.current_students_count > 0:
                old_batch.current_students_count -= 1
        
        # Increase count in new batch
        if new_batch_id:
            new_batch = session.get(Batch, new_batch_id)
            if new_batch:
                new_batch.current_students_count = (new_batch.current_students_count or 0) + 1
    
    session.commit()
    session.refresh(student)
    return student

@router.delete('/{student_id}')
def delete_student(
    student_id: int,
    session: Session = Depends(get_session),
    _=Depends(require_role('superadmin', 'admin', 'management'))
):
    """Delete/deactivate student"""
    student = session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail='Student not found')
    
    # Update batch count if student was in a batch
    if student.batch_id:
        batch = session.get(Batch, student.batch_id)
        if batch and batch.current_students_count > 0:
            batch.current_students_count -= 1
    
    # Also deactivate associated user account
    if student.user_id:
        user = session.get(User, student.user_id)
        if user:
            user.is_active = False
    
    session.delete(student)
    session.commit()
    
    return {"message": "Student deleted successfully"}

@router.get('/by-batch/{batch_id}', response_model=List[StudentRead])
def get_students_by_batch(
    batch_id: int,
    session: Session = Depends(get_session),
    _=Depends(require_role('superadmin', 'admin', 'teacher', 'academics'))
):
    """Get all students in a specific batch"""
    students = session.exec(
        select(Student).where(Student.batch_id == batch_id)
        .order_by(Student.student_roll_number)
    ).all()
    return students

@router.get('/by-class/{class_name}', response_model=List[StudentRead])
def get_students_by_class(
    class_name: str,
    version: Optional[StudentVersion] = Query(None),
    session: Session = Depends(get_session),
    _=Depends(require_role('admin', 'teacher', 'academics'))
):
    """Get all students in a specific class"""
    query = select(Student).where(Student.class_name == class_name)
    
    if version:
        query = query.where(Student.version == version)
    
    students = session.exec(
        query.order_by(Student.student_roll_number)
    ).all()
    return students

class BulkAssignBatchRequest(BaseModel):
    student_ids: List[int]
    batch_id: int

@router.post('/bulk-assign-batch')
def bulk_assign_batch(
    request: BulkAssignBatchRequest,
    session: Session = Depends(get_session),
    _=Depends(require_role('superadmin', 'admin', 'academics'))
):
    """Assign multiple students to a batch"""
    # Verify batch exists
    batch = session.get(Batch, request.batch_id)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    updated_count = 0
    
    for student_id in request.student_ids:
        student = session.get(Student, student_id)
        if student:
            # Update old batch count
            if student.batch_id:
                old_batch = session.get(Batch, student.batch_id)
                if old_batch and old_batch.current_students_count > 0:
                    old_batch.current_students_count -= 1
            
            # Assign to new batch
            student.batch_id = request.batch_id
            updated_count += 1
    
    # Update new batch count
    batch.current_students_count = (batch.current_students_count or 0) + updated_count
    
    session.commit()
    
    return {
        "message": f"Successfully assigned {updated_count} students to batch {batch.name}",
        "updated_count": updated_count
    }

class UnassignBatchRequest(BaseModel):
    batch_id: int

@router.put('/{student_id}/unassign-batch')
def unassign_from_batch(
    student_id: int,
    request: UnassignBatchRequest,
    session: Session = Depends(get_session),
    _=Depends(require_role('superadmin', 'admin', 'academics'))
):
    """Unassign student from a batch"""
    student = session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Verify student is in the specified batch
    if student.batch_id != request.batch_id:
        raise HTTPException(status_code=400, detail="Student is not in the specified batch")
    
    # Update old batch count
    if student.batch_id:
        batch = session.get(Batch, student.batch_id)
        if batch and batch.current_students_count > 0:
            batch.current_students_count -= 1
    
    # Remove from batch
    student.batch_id = None
    session.commit()
    
    return {"message": "Student unassigned from batch successfully"}
