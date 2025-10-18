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

@router.get("/analytics/priority-alerts")
def get_priority_alerts(session: Session = Depends(get_session)):
    """Get priority student alerts using real-time ML analytics"""
    try:
        # Try to use the ML analytics engine
        import sys
        import os
        sys.path.append(os.path.join(os.path.dirname(__file__), '../../../'))
        
        from student_analytics_engine import StudentAnalyticsEngine
        
        engine = StudentAnalyticsEngine(session)
        
        # Get all students and calculate their current analytics
        from sqlalchemy import text
        students = session.exec(text("SELECT id, full_name, class_name FROM student WHERE is_active = true LIMIT 100")).fetchall()
        
        alerts = {"critical": [], "high_priority": [], "medium_priority": []}
        
        for student_row in students:
            try:
                student_id, name, class_name = student_row
                analytics = engine.calculate_student_analytics(student_id)
                
                fifa_rating = analytics['ratings']['fifa_rating']
                risk_level = analytics['risk_level']
                
                # Determine alert category based on risk level and FIFA rating
                if risk_level == 'high' and fifa_rating < 40:
                    category = 'critical'
                elif risk_level == 'high' or fifa_rating < 55:
                    category = 'high_priority'  
                elif fifa_rating < 70:
                    category = 'medium_priority'
                else:
                    continue  # Skip students performing well
                
                alert = {
                    "student_id": student_id,
                    "name": name,
                    "class": class_name,
                    "fifa_rating": fifa_rating,
                    "risk_level": risk_level,
                    "issues": [],
                    "recommended_actions": [rec['title'] for rec in analytics.get('recommendations', [])[:3]]
                }
                
                # Add specific issues based on low ratings
                ratings = analytics['ratings']
                if ratings['attendance_rating'] < 60:
                    alert['issues'].append('Poor attendance')
                if ratings['homework_classwork_rating'] < 60:
                    alert['issues'].append('Homework/Classwork issues')
                if ratings['exam_rating'] < 60:
                    alert['issues'].append('Exam performance')
                if ratings['skill_rating'] < 60:
                    alert['issues'].append('Skill development needed')
                
                alerts[category].append(alert)
                
            except Exception as e:
                print(f"Error processing student {student_id}: {e}")
                continue
        
        return alerts
        
    except Exception as e:
        print(f"Error using ML engine: {e}")
        # Fallback to database query
        from sqlalchemy import text
        high_risk_students = session.exec(text("""
            SELECT s.id, s.full_name, s.class_name, sa.fifa_rating, sa.risk_level,
                   sa.rating_breakdown
            FROM student s
            JOIN studentanalytics sa ON s.id = sa.student_id
            WHERE sa.risk_level IN ('high', 'critical') OR sa.fifa_rating < 50
            ORDER BY CASE 
                WHEN sa.risk_level = 'critical' THEN 0
                WHEN sa.risk_level = 'high' THEN 1
                ELSE 2
            END, sa.fifa_rating ASC
            LIMIT 50
        """)).fetchall()
        
        alerts = {"critical": [], "high_priority": [], "medium_priority": []}
        
        for student in high_risk_students:
            alert = {
                "student_id": student[0],
                "name": student[1],
                "class": student[2],
                "fifa_rating": float(student[3]) if student[3] else 0,
                "risk_level": student[4] or 'medium',
                "issues": [],
                "recommended_actions": []
            }
            
            # Add to appropriate category
            if alert['risk_level'] == 'critical':
                alerts['critical'].append(alert)
            elif alert['risk_level'] == 'high':
                alerts['high_priority'].append(alert)
            else:
                alerts['medium_priority'].append(alert)
        
        return alerts

@router.get("/analytics/dashboard-summary")
def get_dashboard_summary(session: Session = Depends(get_session)):
    """Get dashboard analytics summary using real-time ML data"""
    try:
        # Try to use the ML analytics engine
        import sys
        import os
        sys.path.append(os.path.join(os.path.dirname(__file__), '../../../'))
        
        from student_analytics_engine import StudentAnalyticsEngine
        from sqlalchemy import text
        
        engine = StudentAnalyticsEngine(session)
        
        # Get basic stats
        basic_stats = session.exec(text("""
            SELECT 
                COUNT(DISTINCT s.id) as total_students,
                COUNT(DISTINCT b.id) as total_batches,
                COUNT(DISTINCT s.class_name) as total_classes
            FROM student s
            LEFT JOIN batch b ON s.batch_id = b.id
            WHERE s.is_active = true
        """)).fetchone()
        
        # Get all active students
        students = session.exec(text("SELECT id, full_name, class_name FROM student WHERE is_active = true LIMIT 50")).fetchall()
        
        total_fifa_rating = 0
        fifa_count = 0
        high_risk_count = 0
        critical_count = 0
        class_performance = {}
        recent_updates = []
        
        for student_row in students:
            try:
                student_id, name, class_name = student_row
                analytics = engine.calculate_student_analytics(student_id)
                
                fifa_rating = analytics['ratings']['fifa_rating']
                risk_level = analytics['risk_level']
                
                # Aggregate FIFA ratings
                total_fifa_rating += fifa_rating
                fifa_count += 1
                
                # Count high risk students
                if risk_level == 'high':
                    high_risk_count += 1
                elif fifa_rating < 40:
                    critical_count += 1
                    high_risk_count += 1
                
                # Class performance aggregation
                if class_name not in class_performance:
                    class_performance[class_name] = {
                        'class_name': class_name,
                        'total_students': 0,
                        'avg_rating': 0,
                        'high_risk_students': 0,
                        'critical_students': 0,
                        'ratings_sum': 0
                    }
                
                cp = class_performance[class_name]
                cp['total_students'] += 1
                cp['ratings_sum'] += fifa_rating
                cp['avg_rating'] = cp['ratings_sum'] / cp['total_students']
                
                if risk_level == 'high':
                    cp['high_risk_students'] += 1
                if fifa_rating < 40:
                    cp['critical_students'] += 1
                
                # Add to recent updates if improved or needs attention
                if fifa_rating > 85:
                    recent_updates.append({
                        'student_name': name,
                        'class_name': class_name,
                        'fifa_rating': fifa_rating,
                        'status': 'excellent',
                        'message': f'{name} is performing excellently with {fifa_rating:.1f} rating'
                    })
                elif fifa_rating < 50:
                    recent_updates.append({
                        'student_name': name,
                        'class_name': class_name,
                        'fifa_rating': fifa_rating,
                        'status': 'warning',
                        'message': f'{name} needs immediate attention - rating {fifa_rating:.1f}'
                    })
                
            except Exception as e:
                print(f"Error processing student {student_id}: {e}")
                continue
        
        # Calculate average FIFA rating
        avg_fifa_rating = total_fifa_rating / fifa_count if fifa_count > 0 else 0
        
        return {
            "system_stats": {
                "total_students": basic_stats[0] or 0,
                "total_batches": basic_stats[1] or 0,
                "total_classes": basic_stats[2] or 0,
                "avg_fifa_rating": round(avg_fifa_rating, 2),
                "high_risk_students": high_risk_count,
                "critical_students": critical_count
            },
            "class_performance": list(class_performance.values()),
            "recent_updates": recent_updates[-10:]  # Latest 10 updates
        }
        
    except Exception as e:
        print(f"Error using ML engine for dashboard: {e}")
        # Fallback to basic database query
        from sqlalchemy import text
        basic_stats = session.exec(text("""
            SELECT 
                COUNT(DISTINCT s.id) as total_students,
                COUNT(DISTINCT b.id) as total_batches,
                COUNT(DISTINCT s.class_name) as total_classes,
                COALESCE(AVG(sa.fifa_rating), 0) as avg_fifa_rating
            FROM student s
            LEFT JOIN batch b ON s.batch_id = b.id
            LEFT JOIN studentanalytics sa ON s.id = sa.student_id
        """)).fetchone()
        
        return {
            "system_stats": {
                "total_students": basic_stats[0] or 0,
                "total_batches": basic_stats[1] or 0,
                "total_classes": basic_stats[2] or 0,
                "avg_fifa_rating": float(basic_stats[3]) if basic_stats[3] else 0,
                "high_risk_students": 0
            },
            "class_performance": [],
            "recent_updates": []
        }

@router.post("/{student_id}/assign-batch/{batch_id}")
def assign_student_to_batch(student_id: int, batch_id: int, session: Session = Depends(get_session)):
    """Assign a student to a specific batch"""
    from sqlalchemy import text
    
    # Get student and batch info
    student_data = session.exec(text(
        "SELECT id, full_name, class_name, version FROM student WHERE id = :student_id"
    ), {"student_id": student_id}).fetchone()
    
    if not student_data:
        raise HTTPException(status_code=404, detail="Student not found")
    
    batch_data = session.exec(text(
        "SELECT id, name, class_name, version, current_students_count, max_students FROM batch WHERE id = :batch_id"
    ), {"batch_id": batch_id}).fetchone()
    
    if not batch_data:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    # Validate compatibility
    if batch_data[2] != student_data[2]:  # class_name mismatch
        raise HTTPException(status_code=400, detail=f"Cannot assign {student_data[2]} student to {batch_data[2]} batch")
    
    # Check batch capacity
    if batch_data[5] and batch_data[4] >= batch_data[5]:  # max_students check
        raise HTTPException(status_code=400, detail="Batch is at maximum capacity")
    
    try:
        # Remove from old batch if exists
        old_batch = session.exec(text(
            "SELECT batch_id FROM student WHERE id = :student_id"
        ), {"student_id": student_id}).fetchone()
        
        if old_batch and old_batch[0]:
            session.exec(text(
                "UPDATE batch SET current_students_count = current_students_count - 1 WHERE id = :batch_id"
            ), {"batch_id": old_batch[0]})
        
        # Assign to new batch
        session.exec(text(
            "UPDATE student SET batch_id = :batch_id WHERE id = :student_id"
        ), {"batch_id": batch_id, "student_id": student_id})
        
        # Update batch student count
        session.exec(text(
            "UPDATE batch SET current_students_count = current_students_count + 1 WHERE id = :batch_id"
        ), {"batch_id": batch_id})
        
        session.commit()
        
        return {
            "message": f"Successfully assigned {student_data[1]} to batch {batch_data[1]}",
            "student_id": student_id,
            "batch_id": batch_id,
            "student_name": student_data[1],
            "batch_name": batch_data[1]
        }
        
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Assignment failed: {str(e)}")

@router.get("/batch-assignment/available-batches")
def get_available_batches(class_name: str = None, session: Session = Depends(get_session)):
    """Get available batches for student assignment"""
    from sqlalchemy import text
    
    query = """
        SELECT b.id, b.name, b.class_name, b.version, b.current_students_count, b.max_students
        FROM batch b
        WHERE b.status = 'active' 
          AND (b.current_students_count < b.max_students OR b.max_students IS NULL)
    """
    
    params = {}
    if class_name:
        query += " AND b.class_name = :class_name"
        params["class_name"] = class_name
    
    query += " ORDER BY b.class_name, b.name"
    
    batches = session.exec(text(query), params).fetchall()
    
    return [
        {
            "id": batch[0],
            "name": batch[1],
            "class_name": batch[2],
            "version": batch[3],
            "current_students": batch[4] or 0,
            "max_students": batch[5],
            "available_spots": (batch[5] - (batch[4] or 0)) if batch[5] else None
        } for batch in batches
    ]

@router.get("/analytics/{student_id}")
def get_student_analytics(student_id: int, session: Session = Depends(get_session)):
    """Get detailed analytics for a specific student using real-time ML"""
    try:
        # Try to use the ML analytics engine for real-time calculation
        import sys
        import os
        sys.path.append(os.path.join(os.path.dirname(__file__), '../../../'))
        
        from student_analytics_engine import StudentAnalyticsEngine
        
        engine = StudentAnalyticsEngine(session)
        analytics = engine.calculate_student_analytics(student_id)
        
        # Save the analytics to database for future reference
        engine.save_analytics_to_database(analytics)
        
        ratings = analytics['ratings']
        
        return {
            "student_id": student_id,
            "student_name": analytics['student_name'],
            "class_name": analytics['class_name'],
            "fifa_rating": ratings['fifa_rating'],
            "attendance_rating": ratings['attendance_rating'],
            "homework_rating": ratings['homework_classwork_rating'],
            "exam_rating": ratings['exam_rating'],
            "skill_rating": ratings['skill_rating'],
            "risk_level": analytics['risk_level'],
            "predicted_rating": analytics.get('predicted_rating', 0),
            "confidence": analytics.get('prediction_confidence', 0),
            "improvement_trend": analytics.get('improvement_trend', 0),
            "consistency_score": 0,  # Can be calculated from trend data
            "rating_breakdown": ratings['breakdown'],
            "recommendations": analytics.get('recommendations', []),
            "subject_marks": analytics.get('subject_marks', {}),
            "attendance_stats": analytics.get('attendance_stats', {}),
            "last_updated": analytics.get('timestamp', None)
        }
        
    except Exception as e:
        print(f"Error using ML engine for student {student_id}: {e}")
        
        # Fallback to database query
        from sqlalchemy import text
        import json
        
        analytics = session.exec(text("""
            SELECT sa.fifa_rating, sa.attendance_rating, sa.homework_classwork_rating,
                   sa.exam_rating, sa.skill_rating, sa.risk_level, sa.predicted_rating,
                   sa.prediction_confidence, sa.improvement_trend, sa.consistency_score,
                   sa.rating_breakdown, sa.last_calculated_at, s.full_name, s.class_name
            FROM studentanalytics sa
            JOIN student s ON sa.student_id = s.id
            WHERE sa.student_id = :student_id
        """), {"student_id": student_id}).fetchone()
        
        if not analytics:
            raise HTTPException(status_code=404, detail="Student analytics not found")
        
        try:
            rating_breakdown = json.loads(analytics[10]) if analytics[10] else {}
        except:
            rating_breakdown = {}
        
        return {
            "student_id": student_id,
            "student_name": analytics[12],
            "class_name": analytics[13],
            "fifa_rating": float(analytics[0]) if analytics[0] else 0,
            "attendance_rating": float(analytics[1]) if analytics[1] else 0,
            "homework_rating": float(analytics[2]) if analytics[2] else 0,
            "exam_rating": float(analytics[3]) if analytics[3] else 0,
            "skill_rating": float(analytics[4]) if analytics[4] else 0,
            "risk_level": analytics[5],
            "predicted_rating": float(analytics[6]) if analytics[6] else 0,
            "confidence": float(analytics[7]) if analytics[7] else 0,
            "improvement_trend": float(analytics[8]) if analytics[8] else 0,
            "consistency_score": float(analytics[9]) if analytics[9] else 0,
            "rating_breakdown": rating_breakdown,
            "last_updated": analytics[11].isoformat() if analytics[11] else None
        }

@router.post("/analytics/train-ml-model")
def train_ml_model(session: Session = Depends(get_session)):
    """Train the ML model with current student data"""
    try:
        import sys
        import os
        sys.path.append(os.path.join(os.path.dirname(__file__), '../../../'))
        
        from student_analytics_engine import StudentAnalyticsEngine
        
        engine = StudentAnalyticsEngine(session)
        model_stats = engine.train_ml_model()
        
        if model_stats:
            return {
                "status": "success",
                "message": "ML model trained successfully",
                "model_stats": model_stats
            }
        else:
            return {
                "status": "failed",
                "message": "Failed to train ML model - insufficient data or ML libraries unavailable"
            }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error training ML model: {str(e)}"
        }

@router.post("/analytics/refresh-all")
def refresh_all_analytics(session: Session = Depends(get_session)):
    """Refresh analytics for all students"""
    try:
        import sys
        import os
        sys.path.append(os.path.join(os.path.dirname(__file__), '../../../'))
        
        from student_analytics_engine import StudentAnalyticsEngine
        from sqlalchemy import text
        
        engine = StudentAnalyticsEngine(session)
        
        # Get all active students
        students = session.exec(text("SELECT id FROM student WHERE is_active = true LIMIT 100")).fetchall()
        
        processed_count = 0
        error_count = 0
        
        for student_row in students:
            try:
                student_id = student_row[0]
                analytics = engine.calculate_student_analytics(student_id)
                engine.save_analytics_to_database(analytics)
                processed_count += 1
            except Exception as e:
                print(f"Error processing student {student_id}: {e}")
                error_count += 1
                continue
        
        return {
            "status": "success",
            "message": f"Analytics refreshed for {processed_count} students",
            "processed_count": processed_count,
            "error_count": error_count
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error refreshing analytics: {str(e)}"
        }
