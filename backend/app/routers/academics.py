from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from ..database import get_session
from ..models import (
    User, Student, Teacher, Batch, ClassAssignment, Exam, ExamResult, 
    Attendance, BehaviorRecord, ReportCard, Task, Payment
)
from ..schemas import (
    ClassAssignmentCreate, ClassAssignmentRead, BatchCreate, BatchRead, BatchUpdate, BatchWithStats,
    ExamCreate, ExamRead, ExamResultCreate, ExamResultRead,
    AttendanceCreate, AttendanceRead, BehaviorRecordCreate, BehaviorRecordRead,
    ReportCardCreate, ReportCardRead, TaskCreate, TaskRead, TaskUpdate,
    PaymentCreate, PaymentRead, TeacherCreate, TeacherRead, StudentCreate, StudentRead
)
from ..core.deps import get_current_user, require_role
from .notifications import send_task_assigned_notification

router = APIRouter(prefix="/academics", tags=["academics"])

# Batch Management
@router.post("/batches/", response_model=BatchRead)
def create_batch(
    batch: BatchCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("admin", "superadmin", "academics"))
):
    """Create a new batch"""
    try:
        # Generate batch code if not provided
        batch_data = batch.model_dump()
        
        if not batch_data.get('code'):
            # Generate simple batch code: year + class + version + sequential
            year = datetime.utcnow().year % 100  # Last 2 digits of year
            class_short = (batch_data.get('class_name', '')[:3]).upper()
            version = batch_data.get('version', 'BV')
            # Handle case where version is an enum string representation
            if 'StudentVersion.' in str(version):
                version = str(version).split('.')[-1]
            
            # Get next sequential number
            similar_batches = session.exec(
                select(Batch).where(Batch.code.like(f"{year}{class_short}{version}%"))
            ).all()
            seq_num = len(similar_batches) + 1
            
            batch_data['code'] = f"{year}{class_short}{version}{seq_num:02d}"
        
        batch_data['created_by'] = current_user.id
        batch_data['updated_at'] = datetime.utcnow()
        
        db_batch = Batch(**batch_data)
        session.add(db_batch)
        session.commit()
        session.refresh(db_batch)
        return db_batch
        
    except Exception as e:
        print(f"Error creating batch: {str(e)}")  # Debug log
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating batch: {str(e)}")

@router.get("/batches/", response_model=List[BatchWithStats])
def get_batches(
    limit: int = 100,
    offset: int = 0,
    search: Optional[str] = None,
    status: Optional[str] = None,
    version: Optional[str] = None,
    class_name: Optional[str] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get batches with filtering and statistics"""
    try:
        # Start with a basic query to avoid complex filtering issues
        query = select(Batch)
        
        # Apply only basic, safe filters
        if search and len(search.strip()) > 0:
            query = query.where(
                Batch.name.icontains(search) if Batch.name is not None else Batch.id.isnot(None)
            )
        
        # Execute basic query
        batches = session.exec(
            query.order_by(Batch.id.desc())
            .offset(offset)
            .limit(limit)
        ).all()
        
        # Create simplified response without complex stats
        result = []
        for batch in batches:
            # Use minimal stats to avoid field access issues
            stats = {
                "enrollment_rate": 0,
                "available_seats": batch.max_students or 30,
                "total_classes": 0,
                "active_assignments": 0
            }
            result.append(BatchWithStats(batch=batch, stats=stats))
        
        return result
        
    except Exception as e:
        # Return empty list if there are still database issues
        print(f"Batches query error: {str(e)}")
        return []

@router.get("/batches/{batch_id}", response_model=BatchWithStats)
def get_batch(
    batch_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get batch by ID with statistics"""
    batch = session.get(Batch, batch_id)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    # Calculate basic statistics (simplified to avoid relationship errors)
    current_count = batch.current_students_count or 0
    max_students = batch.max_students or 30
    
    stats = {
        "total_students": current_count,
        "active_students": current_count,  # Simplified
        "enrollment_rate": (current_count / max_students * 100) if max_students > 0 else 0,
        "available_seats": max(0, max_students - current_count),
        "total_classes": 0,  # Simplified - avoid relationship access
        "upcoming_classes": 0,  # Simplified - avoid relationship access
        "completed_classes": 0,  # Simplified - avoid relationship access
        "assigned_teachers": 0  # Simplified - avoid relationship access
    }
    
    return BatchWithStats(batch=batch, stats=stats)

@router.put("/batches/{batch_id}", response_model=BatchRead)
def update_batch(
    batch_id: int,
    batch_update: BatchUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("admin", "superadmin", "academics"))
):
    """Update batch information"""
    batch = session.get(Batch, batch_id)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    update_data = batch_update.model_dump(exclude_unset=True)
    update_data['updated_at'] = datetime.utcnow()
    
    for key, value in update_data.items():
        setattr(batch, key, value)
    
    session.commit()
    session.refresh(batch)
    return batch

@router.delete("/batches/{batch_id}")
def delete_batch(
    batch_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("admin", "superadmin"))
):
    """Delete/deactivate batch"""
    batch = session.get(Batch, batch_id)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    # Check if batch has students
    if batch.current_students_count and batch.current_students_count > 0:
        # Don't delete, just deactivate
        batch.status = "cancelled"
        session.commit()
        return {"message": "Batch deactivated successfully (had enrolled students)"}
    else:
        # Safe to delete if no students
        session.delete(batch)
        session.commit()
        return {"message": "Batch deleted successfully"}

# Class Assignment Management
@router.post("/class-assignments/", response_model=ClassAssignmentRead)
def create_class_assignment(
    assignment: ClassAssignmentCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("admin", "superadmin", "academics"))
):
    # Verify batch and teacher exist
    batch = session.get(Batch, assignment.batch_id)
    teacher = session.get(Teacher, assignment.teacher_id)
    
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    db_assignment = ClassAssignment(**assignment.model_dump(), created_by=current_user.id)
    session.add(db_assignment)
    session.commit()
    session.refresh(db_assignment)
    
    return db_assignment

@router.get("/class-assignments/", response_model=List[ClassAssignmentRead])
def get_class_assignments(
    batch_id: Optional[int] = None,
    teacher_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    query = select(ClassAssignment)
    
    # Apply filters based on user role
    if current_user.role == "teacher":
        # Teachers can only see their own assignments
        teacher = session.exec(
            select(Teacher).where(Teacher.user_id == current_user.id)
        ).first()
        if teacher:
            query = query.where(ClassAssignment.teacher_id == teacher.id)
        else:
            return []
    elif current_user.role == "student":
        # Students can only see assignments for their batch
        student = session.exec(
            select(Student).where(Student.user_id == current_user.id)
        ).first()
        if student and student.batch_id:
            query = query.where(ClassAssignment.batch_id == student.batch_id)
        else:
            return []
    
    # Apply additional filters
    if batch_id:
        query = query.where(ClassAssignment.batch_id == batch_id)
    if teacher_id:
        query = query.where(ClassAssignment.teacher_id == teacher_id)
    if start_date:
        query = query.where(ClassAssignment.scheduled_at >= start_date)
    if end_date:
        query = query.where(ClassAssignment.scheduled_at <= end_date)
    
    assignments = session.exec(query.order_by(ClassAssignment.scheduled_at)).all()
    return assignments

@router.get("/class-assignments/upcoming", response_model=List[ClassAssignmentRead])
def get_upcoming_classes(
    days: int = 7,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    start_time = datetime.utcnow()
    end_time = start_time + timedelta(days=days)
    
    query = select(ClassAssignment).where(
        ClassAssignment.scheduled_at >= start_time,
        ClassAssignment.scheduled_at <= end_time
    )
    
    # Filter by user role
    if current_user.role == "teacher":
        teacher = session.exec(
            select(Teacher).where(Teacher.user_id == current_user.id)
        ).first()
        if teacher:
            query = query.where(ClassAssignment.teacher_id == teacher.id)
    elif current_user.role == "student":
        student = session.exec(
            select(Student).where(Student.user_id == current_user.id)
        ).first()
        if student and student.batch_id:
            query = query.where(ClassAssignment.batch_id == student.batch_id)
    
    assignments = session.exec(query.order_by(ClassAssignment.scheduled_at)).all()
    return assignments

# Exam Management
@router.post("/exams/", response_model=ExamRead)
def create_exam(
    exam: ExamCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("admin", "superadmin", "academics", "teacher"))
):
    # Verify batch exists
    batch = session.get(Batch, exam.batch_id)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    db_exam = Exam(**exam.model_dump(), created_by=current_user.id)
    session.add(db_exam)
    session.commit()
    session.refresh(db_exam)
    
    return db_exam

@router.get("/exams/", response_model=List[ExamRead])
def get_exams(
    batch_id: Optional[int] = None,
    subject: Optional[str] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    query = select(Exam)
    
    # Filter by user role
    if current_user.role == "student":
        student = session.exec(
            select(Student).where(Student.user_id == current_user.id)
        ).first()
        if student and student.batch_id:
            query = query.where(Exam.batch_id == student.batch_id)
        else:
            return []
    
    # Apply filters
    if batch_id:
        query = query.where(Exam.batch_id == batch_id)
    if subject:
        query = query.where(Exam.subject == subject)
    
    exams = session.exec(query.order_by(Exam.exam_date.desc())).all()
    return exams

# Exam Results Management
@router.post("/exam-results/", response_model=ExamResultRead)
def create_exam_result(
    result: ExamResultCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("teacher", "academics", "admin", "superadmin"))
):
    # Verify exam and student exist
    exam = session.get(Exam, result.exam_id)
    student = session.get(Student, result.student_id)
    
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Get teacher ID
    teacher_id = None
    if current_user.role == "teacher":
        teacher = session.exec(
            select(Teacher).where(Teacher.user_id == current_user.id)
        ).first()
        if teacher:
            teacher_id = teacher.id
        else:
            raise HTTPException(status_code=404, detail="Teacher record not found")
    
    # Calculate grade based on percentage
    percentage = (result.marks_obtained / exam.max_marks) * 100
    grade = "F"
    if percentage >= 90: grade = "A+"
    elif percentage >= 80: grade = "A"
    elif percentage >= 70: grade = "B+"
    elif percentage >= 60: grade = "B"
    elif percentage >= 50: grade = "C+"
    elif percentage >= 40: grade = "C"
    elif percentage >= 35: grade = "D"
    
    db_result = ExamResult(
        **result.model_dump(),
        teacher_id=teacher_id,
        grade=grade
    )
    session.add(db_result)
    session.commit()
    session.refresh(db_result)
    
    return db_result

@router.get("/exam-results/", response_model=List[ExamResultRead])
def get_exam_results(
    exam_id: Optional[int] = None,
    student_id: Optional[int] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    query = select(ExamResult)
    
    # Filter by user role
    if current_user.role == "student":
        student = session.exec(
            select(Student).where(Student.user_id == current_user.id)
        ).first()
        if student:
            query = query.where(ExamResult.student_id == student.id)
        else:
            return []
    elif current_user.role == "teacher":
        teacher = session.exec(
            select(Teacher).where(Teacher.user_id == current_user.id)
        ).first()
        if teacher:
            query = query.where(ExamResult.teacher_id == teacher.id)
    
    # Apply filters
    if exam_id:
        query = query.where(ExamResult.exam_id == exam_id)
    if student_id:
        query = query.where(ExamResult.student_id == student_id)
    
    results = session.exec(query.order_by(ExamResult.entered_at.desc())).all()
    return results

# Attendance Management
@router.post("/attendance/", response_model=AttendanceRead)
def mark_attendance(
    attendance: AttendanceCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("teacher", "academics", "admin", "superadmin"))
):
    # Verify student exists
    student = session.get(Student, attendance.student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Get teacher ID
    teacher_id = None
    if current_user.role == "teacher":
        teacher = session.exec(
            select(Teacher).where(Teacher.user_id == current_user.id)
        ).first()
        if teacher:
            teacher_id = teacher.id
        else:
            raise HTTPException(status_code=404, detail="Teacher record not found")
    
    db_attendance = Attendance(**attendance.model_dump(), teacher_id=teacher_id)
    session.add(db_attendance)
    session.commit()
    session.refresh(db_attendance)
    
    return db_attendance

@router.post("/attendance/bulk", response_model=dict)
def mark_bulk_attendance(
    attendances: List[AttendanceCreate],
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("teacher", "academics", "admin", "superadmin"))
):
    # Get teacher ID
    teacher_id = None
    if current_user.role == "teacher":
        teacher = session.exec(
            select(Teacher).where(Teacher.user_id == current_user.id)
        ).first()
        if teacher:
            teacher_id = teacher.id
        else:
            raise HTTPException(status_code=404, detail="Teacher record not found")
    
    created_count = 0
    for attendance in attendances:
        # Verify student exists
        student = session.get(Student, attendance.student_id)
        if student:
            db_attendance = Attendance(**attendance.model_dump(), teacher_id=teacher_id)
            session.add(db_attendance)
            created_count += 1
    
    session.commit()
    return {"message": f"Marked attendance for {created_count} students"}

@router.get("/attendance/", response_model=List[AttendanceRead])
def get_attendance(
    student_id: Optional[int] = None,
    subject: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    query = select(Attendance)
    
    # Filter by user role
    if current_user.role == "student":
        student = session.exec(
            select(Student).where(Student.user_id == current_user.id)
        ).first()
        if student:
            query = query.where(Attendance.student_id == student.id)
        else:
            return []
    elif current_user.role == "teacher":
        teacher = session.exec(
            select(Teacher).where(Teacher.user_id == current_user.id)
        ).first()
        if teacher:
            query = query.where(Attendance.teacher_id == teacher.id)
    
    # Apply filters
    if student_id:
        query = query.where(Attendance.student_id == student_id)
    if subject:
        query = query.where(Attendance.subject == subject)
    if start_date:
        query = query.where(Attendance.class_date >= start_date)
    if end_date:
        query = query.where(Attendance.class_date <= end_date)
    
    attendance_records = session.exec(query.order_by(Attendance.class_date.desc())).all()
    return attendance_records

@router.get("/attendance/summary/{student_id}", response_model=dict)
def get_attendance_summary(
    student_id: int,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # Check permissions
    if current_user.role == "student":
        student = session.exec(
            select(Student).where(Student.user_id == current_user.id)
        ).first()
        if not student or student.id != student_id:
            raise HTTPException(status_code=403, detail="Not authorized")
    
    query = select(Attendance).where(Attendance.student_id == student_id)
    
    if start_date:
        query = query.where(Attendance.class_date >= start_date)
    if end_date:
        query = query.where(Attendance.class_date <= end_date)
    
    records = session.exec(query).all()
    
    total_classes = len(records)
    present_classes = len([r for r in records if r.is_present])
    attendance_percentage = (present_classes / total_classes * 100) if total_classes > 0 else 0
    
    # Subject-wise attendance
    subject_attendance = {}
    for record in records:
        if record.subject not in subject_attendance:
            subject_attendance[record.subject] = {"total": 0, "present": 0}
        subject_attendance[record.subject]["total"] += 1
        if record.is_present:
            subject_attendance[record.subject]["present"] += 1
    
    for subject in subject_attendance:
        subject_data = subject_attendance[subject]
        subject_data["percentage"] = (subject_data["present"] / subject_data["total"] * 100) if subject_data["total"] > 0 else 0
    
    return {
        "student_id": student_id,
        "total_classes": total_classes,
        "present_classes": present_classes,
        "absent_classes": total_classes - present_classes,
        "attendance_percentage": round(attendance_percentage, 2),
        "subject_wise": subject_attendance
    }

# Behavior Record Management
@router.post("/behavior-records/", response_model=BehaviorRecordRead)
def create_behavior_record(
    record: BehaviorRecordCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("teacher", "academics", "admin", "superadmin"))
):
    # Verify student exists
    student = session.get(Student, record.student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Get teacher ID
    teacher_id = None
    if current_user.role == "teacher":
        teacher = session.exec(
            select(Teacher).where(Teacher.user_id == current_user.id)
        ).first()
        if teacher:
            teacher_id = teacher.id
        else:
            raise HTTPException(status_code=404, detail="Teacher record not found")
    
    db_record = BehaviorRecord(**record.model_dump(), teacher_id=teacher_id)
    session.add(db_record)
    session.commit()
    session.refresh(db_record)
    
    return db_record

@router.get("/behavior-records/", response_model=List[BehaviorRecordRead])
def get_behavior_records(
    student_id: Optional[int] = None,
    behavior_type: Optional[str] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    query = select(BehaviorRecord)
    
    # Filter by user role
    if current_user.role == "student":
        student = session.exec(
            select(Student).where(Student.user_id == current_user.id)
        ).first()
        if student:
            query = query.where(BehaviorRecord.student_id == student.id)
        else:
            return []
    elif current_user.role == "teacher":
        teacher = session.exec(
            select(Teacher).where(Teacher.user_id == current_user.id)
        ).first()
        if teacher:
            query = query.where(BehaviorRecord.teacher_id == teacher.id)
    
    # Apply filters
    if student_id:
        query = query.where(BehaviorRecord.student_id == student_id)
    if behavior_type:
        query = query.where(BehaviorRecord.behavior_type == behavior_type)
    
    records = session.exec(query.order_by(BehaviorRecord.date_recorded.desc())).all()
    return records

# Report Card Generation
@router.post("/report-cards/", response_model=ReportCardRead)
def generate_report_card(
    report: ReportCardCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("academics", "admin", "superadmin"))
):
    # Verify student exists
    student = session.get(Student, report.student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Auto-calculate data if not provided
    if not report.subject_grades or not report.attendance_percentage:
        # Get exam results for the term
        exam_results = session.exec(
            select(ExamResult, Exam)
            .join(Exam, ExamResult.exam_id == Exam.id)
            .where(ExamResult.student_id == report.student_id)
        ).all()
        
        # Calculate subject grades
        subject_grades = {}
        total_percentage = 0
        subject_count = 0
        
        for result, exam in exam_results:
            subject = exam.subject
            percentage = (result.marks_obtained / exam.max_marks) * 100
            
            if subject not in subject_grades:
                subject_grades[subject] = {
                    "marks": [],
                    "total_marks": [],
                    "grade": result.grade
                }
            
            subject_grades[subject]["marks"].append(result.marks_obtained)
            subject_grades[subject]["total_marks"].append(exam.max_marks)
            
            total_percentage += percentage
            subject_count += 1
        
        # Calculate averages
        for subject in subject_grades:
            total_marks = sum(subject_grades[subject]["marks"])
            total_possible = sum(subject_grades[subject]["total_marks"])
            subject_grades[subject]["percentage"] = (total_marks / total_possible * 100) if total_possible > 0 else 0
        
        # Calculate attendance
        attendance_records = session.exec(
            select(Attendance).where(Attendance.student_id == report.student_id)
        ).all()
        
        total_classes = len(attendance_records)
        present_classes = len([r for r in attendance_records if r.is_present])
        attendance_percentage = (present_classes / total_classes * 100) if total_classes > 0 else 0
        
        # Get behavior summary
        behavior_records = session.exec(
            select(BehaviorRecord).where(BehaviorRecord.student_id == report.student_id)
        ).all()
        
        behavior_summary = {
            "strengths": [r for r in behavior_records if r.behavior_type == "strength"],
            "weaknesses": [r for r in behavior_records if r.behavior_type == "weakness"],
            "behavior_notes": [r for r in behavior_records if r.behavior_type == "behavior"]
        }
        
        # Update report data
        report.subject_grades = subject_grades
        report.attendance_percentage = round(attendance_percentage, 2)
        report.overall_percentage = round(total_percentage / subject_count, 2) if subject_count > 0 else 0
        report.behavior_summary = behavior_summary
    
    db_report = ReportCard(**report.model_dump(), generated_by=current_user.id)
    session.add(db_report)
    session.commit()
    session.refresh(db_report)
    
    return db_report

@router.get("/report-cards/", response_model=List[ReportCardRead])
def get_report_cards(
    student_id: Optional[int] = None,
    academic_year: Optional[str] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    query = select(ReportCard)
    
    # Filter by user role
    if current_user.role == "student":
        student = session.exec(
            select(Student).where(Student.user_id == current_user.id)
        ).first()
        if student:
            query = query.where(ReportCard.student_id == student.id)
        else:
            return []
    
    # Apply filters
    if student_id:
        query = query.where(ReportCard.student_id == student_id)
    if academic_year:
        query = query.where(ReportCard.academic_year == academic_year)
    
    reports = session.exec(query.order_by(ReportCard.generated_at.desc())).all()
    return reports

# Task Management
@router.post("/tasks/", response_model=TaskRead)
def create_task(
    task: TaskCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("admin", "superadmin", "management"))
):
    # Verify assigned user exists
    assigned_user = session.get(User, task.assigned_to)
    if not assigned_user:
        raise HTTPException(status_code=404, detail="Assigned user not found")
    
    db_task = Task(**task.model_dump(), created_by=current_user.id)
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    
    # Send notification
    send_task_assigned_notification(session, db_task)
    
    return db_task

@router.get("/tasks/", response_model=List[TaskRead])
def get_tasks(
    assigned_to: Optional[int] = None,
    status: Optional[str] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    query = select(Task)
    
    # Filter by user role
    if current_user.role not in ["admin", "superadmin", "management"]:
        # Non-admin users can only see tasks assigned to them or created by them
        query = query.where(
            (Task.assigned_to == current_user.id) | (Task.created_by == current_user.id)
        )
    
    # Apply filters
    if assigned_to:
        query = query.where(Task.assigned_to == assigned_to)
    if status:
        query = query.where(Task.status == status)
    
    tasks = session.exec(query.order_by(Task.created_at.desc())).all()
    return tasks

@router.put("/tasks/{task_id}", response_model=TaskRead)
def update_task(
    task_id: int,
    task_update: TaskUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Check permissions
    if current_user.role not in ["admin", "superadmin", "management"]:
        if task.assigned_to != current_user.id and task.created_by != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to update this task")
    
    # Update task
    update_data = task_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)
    
    if task_update.status == "completed" and not task.completed_at:
        task.completed_at = datetime.utcnow()
    
    session.commit()
    session.refresh(task)
    
    return task

# Payment Management
@router.post("/payments/", response_model=PaymentRead)
def create_payment(
    payment: PaymentCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("admin", "superadmin", "management"))
):
    # Verify student exists
    student = session.get(Student, payment.student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    db_payment = Payment(**payment.model_dump(), collected_by=current_user.id)
    session.add(db_payment)
    session.commit()
    session.refresh(db_payment)
    
    return db_payment

@router.get("/payments/", response_model=List[PaymentRead])
def get_payments(
    student_id: Optional[int] = None,
    status: Optional[str] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    query = select(Payment)
    
    # Filter by user role
    if current_user.role == "student":
        student = session.exec(
            select(Student).where(Student.user_id == current_user.id)
        ).first()
        if student:
            query = query.where(Payment.student_id == student.id)
        else:
            return []
    
    # Apply filters
    if student_id:
        query = query.where(Payment.student_id == student_id)
    if status:
        query = query.where(Payment.status == status)
    
    payments = session.exec(query.order_by(Payment.payment_date.desc())).all()
    return payments

# Dashboard Statistics
@router.get("/dashboard/stats", response_model=dict)
def get_dashboard_stats(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    stats = {}
    
    if current_user.role == "student":
        # Student dashboard stats
        student = session.exec(
            select(Student).where(Student.user_id == current_user.id)
        ).first()
        
        if student:
            # Upcoming classes
            upcoming_classes = session.exec(
                select(ClassAssignment).where(
                    ClassAssignment.batch_id == student.batch_id,
                    ClassAssignment.scheduled_at >= datetime.utcnow()
                ).limit(5)
            ).all()
            
            # Recent results
            recent_results = session.exec(
                select(ExamResult).where(ExamResult.student_id == student.id)
                .order_by(ExamResult.entered_at.desc())
                .limit(5)
            ).all()
            
            # Attendance summary
            attendance_summary = session.exec(
                select(Attendance).where(Attendance.student_id == student.id)
            ).all()
            
            total_classes = len(attendance_summary)
            present_classes = len([a for a in attendance_summary if a.is_present])
            attendance_percentage = (present_classes / total_classes * 100) if total_classes > 0 else 0
            
            stats = {
                "upcoming_classes": len(upcoming_classes),
                "recent_results": len(recent_results),
                "attendance_percentage": round(attendance_percentage, 2),
                "total_classes": total_classes
            }
    
    elif current_user.role == "teacher":
        # Teacher dashboard stats
        teacher = session.exec(
            select(Teacher).where(Teacher.user_id == current_user.id)
        ).first()
        
        if teacher:
            # Classes today
            today = datetime.utcnow().date()
            today_classes = session.exec(
                select(ClassAssignment).where(
                    ClassAssignment.teacher_id == teacher.id,
                    ClassAssignment.scheduled_at >= today,
                    ClassAssignment.scheduled_at < today + timedelta(days=1)
                )
            ).all()
            
            # Students taught
            taught_batches = session.exec(
                select(ClassAssignment.batch_id).where(
                    ClassAssignment.teacher_id == teacher.id
                ).distinct()
            ).all()
            
            total_students = 0
            for batch_id in taught_batches:
                students = session.exec(
                    select(Student).where(Student.batch_id == batch_id)
                ).all()
                total_students += len(students)
            
            stats = {
                "classes_today": len(today_classes),
                "total_students": total_students,
                "total_batches": len(taught_batches)
            }
    
    else:
        # Admin/Management dashboard stats
        total_students = len(session.exec(select(Student)).all())
        total_teachers = len(session.exec(select(Teacher)).all())
        total_batches = len(session.exec(select(Batch)).all())
        pending_tasks = len(session.exec(select(Task).where(Task.status == "pending")).all())
        
        stats = {
            "total_students": total_students,
            "total_teachers": total_teachers,
            "total_batches": total_batches,
            "pending_tasks": pending_tasks
        }
    
    return stats
