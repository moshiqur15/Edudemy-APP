from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlmodel import Session, select, func
from typing import List, Optional
from datetime import datetime
import os
import uuid
import shutil

from ..database import get_session
from ..models import User
from ..models.feedback import (
    Feedback, FeedbackResponse, FeedbackCreate, FeedbackResponse_Create,
    FeedbackRead, FeedbackResponseRead, FeedbackList
)
from ..core.deps import get_current_user
from ..core.permissions import require_role
from ..routers.notifications import create_notification

router = APIRouter(prefix="/feedback", tags=["feedback"])

# Directory to store feedback attachments
UPLOAD_DIR = "uploads/feedback"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/", response_model=dict)
async def create_feedback(
    subject: str = Form(...),
    content: str = Form(...),
    is_anonymous: bool = Form(False),
    attachment: Optional[UploadFile] = File(None),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Create a new feedback submission"""
    try:
        # Handle file upload if present
        attachment_path = None
        attachment_filename = None
        
        if attachment:
            # Generate unique filename
            file_extension = os.path.splitext(attachment.filename)[1]
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            attachment_path = os.path.join(UPLOAD_DIR, unique_filename)
            attachment_filename = attachment.filename
            
            # Save file
            with open(attachment_path, "wb") as buffer:
                shutil.copyfileobj(attachment.file, buffer)
        
        # Create feedback record
        feedback = Feedback(
            subject=subject,
            content=content,
            is_anonymous=is_anonymous,
            sender_id=current_user.id,
            sender_name=None if is_anonymous else current_user.full_name,
            sender_position=None if is_anonymous else getattr(current_user, 'designation', current_user.role.value),
            attachment_path=attachment_path,
            attachment_filename=attachment_filename,
            status="pending"
        )
        
        session.add(feedback)
        session.commit()
        session.refresh(feedback)
        
        # Send notifications to all admins and superadmins
        admin_users = session.exec(
            select(User).where(User.role.in_(["admin", "superadmin"]))
        ).all()
        
        for admin in admin_users:
            await create_notification(
                session=session,
                user_id=admin.id,
                title="New Feedback Received",
                message=f"New feedback: '{subject}' from {current_user.full_name if not is_anonymous else 'Anonymous'}",
                type="general",
                created_by=current_user.id
            )
        
        return {"message": "Feedback submitted successfully", "feedback_id": feedback.id}
        
    except Exception as e:
        session.rollback()
        if attachment_path and os.path.exists(attachment_path):
            os.remove(attachment_path)
        raise HTTPException(status_code=500, detail=f"Failed to submit feedback: {str(e)}")

@router.get("/my-feedback", response_model=List[FeedbackRead])
def get_my_feedback(
    limit: int = 50,
    offset: int = 0,
    status: Optional[str] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # Check if user is a student
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can view their feedback")
    
    # Get student record
    student = session.exec(
        select(Student).where(Student.user_id == current_user.id)
    ).first()
    
    if not student:
        raise HTTPException(status_code=404, detail="Student record not found")
    
    query = select(FeedbackForm).where(FeedbackForm.student_id == student.id)
    
    if status:
        query = query.where(FeedbackForm.status == status)
    
    feedback_list = session.exec(
        query.order_by(FeedbackForm.submitted_at.desc())
        .offset(offset)
        .limit(limit)
    ).all()
    
    return feedback_list

@router.get("/", response_model=List[FeedbackRead])
def get_all_feedback(
    limit: int = 50,
    offset: int = 0,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    feedback_type: Optional[str] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("admin", "superadmin", "management"))
):
    query = select(FeedbackForm)
    
    # Apply filters
    if status:
        query = query.where(FeedbackForm.status == status)
    if priority:
        query = query.where(FeedbackForm.priority == priority)
    if feedback_type:
        query = query.where(FeedbackForm.feedback_type == feedback_type)
    
    feedback_list = session.exec(
        query.order_by(FeedbackForm.submitted_at.desc())
        .offset(offset)
        .limit(limit)
    ).all()
    
    return feedback_list

@router.get("/pending", response_model=List[FeedbackRead])
def get_pending_feedback(
    limit: int = 50,
    offset: int = 0,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("admin", "superadmin", "management"))
):
    feedback_list = session.exec(
        select(FeedbackForm)
        .where(FeedbackForm.status == "pending")
        .order_by(FeedbackForm.submitted_at.desc())
        .offset(offset)
        .limit(limit)
    ).all()
    
    return feedback_list

@router.get("/stats", response_model=dict)
def get_feedback_stats(
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("admin", "superadmin", "management"))
):
    # Get counts by status
    total_feedback = len(session.exec(select(FeedbackForm)).all())
    pending_feedback = len(session.exec(select(FeedbackForm).where(FeedbackForm.status == "pending")).all())
    reviewing_feedback = len(session.exec(select(FeedbackForm).where(FeedbackForm.status == "reviewing")).all())
    resolved_feedback = len(session.exec(select(FeedbackForm).where(FeedbackForm.status == "resolved")).all())
    
    # Get counts by type
    issues = len(session.exec(select(FeedbackForm).where(FeedbackForm.feedback_type == "issue")).all())
    complaints = len(session.exec(select(FeedbackForm).where(FeedbackForm.feedback_type == "complaint")).all())
    suggestions = len(session.exec(select(FeedbackForm).where(FeedbackForm.feedback_type == "suggestion")).all())
    praise = len(session.exec(select(FeedbackForm).where(FeedbackForm.feedback_type == "praise")).all())
    
    # Get counts by priority
    high_priority = len(session.exec(select(FeedbackForm).where(FeedbackForm.priority == "high")).all())
    medium_priority = len(session.exec(select(FeedbackForm).where(FeedbackForm.priority == "medium")).all())
    low_priority = len(session.exec(select(FeedbackForm).where(FeedbackForm.priority == "low")).all())
    
    return {
        "total_feedback": total_feedback,
        "by_status": {
            "pending": pending_feedback,
            "reviewing": reviewing_feedback,
            "resolved": resolved_feedback
        },
        "by_type": {
            "issues": issues,
            "complaints": complaints,
            "suggestions": suggestions,
            "praise": praise
        },
        "by_priority": {
            "high": high_priority,
            "medium": medium_priority,
            "low": low_priority
        }
    }

@router.get("/{feedback_id}", response_model=FeedbackRead)
def get_feedback_detail(
    feedback_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    feedback = session.get(FeedbackForm, feedback_id)
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    # Check permissions
    if current_user.role == "student":
        # Students can only view their own feedback
        student = session.exec(
            select(Student).where(Student.user_id == current_user.id)
        ).first()
        if not student or feedback.student_id != student.id:
            raise HTTPException(status_code=403, detail="Not authorized to view this feedback")
    elif current_user.role not in ["admin", "superadmin", "management"]:
        raise HTTPException(status_code=403, detail="Not authorized to view feedback")
    
    return feedback

@router.put("/{feedback_id}/respond", response_model=FeedbackRead)
def respond_to_feedback(
    feedback_id: int,
    response: FeedbackResponse,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("admin", "superadmin", "management"))
):
    feedback = session.get(FeedbackForm, feedback_id)
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    # Update feedback with response
    feedback.admin_response = response.admin_response
    feedback.status = response.status
    feedback.resolved_by = current_user.id
    feedback.resolved_at = datetime.utcnow()
    
    session.commit()
    session.refresh(feedback)
    
    # Send notification to student (if not anonymous)
    if not feedback.is_anonymous and feedback.student and feedback.student.user:
        from ..models import Notification, NotificationType
        notification = Notification(
            user_id=feedback.student.user.id,
            title="Feedback Response",
            message=f"Your feedback '{feedback.subject}' has been responded to",
            notification_type=NotificationType.GENERAL,
            data={
                "feedback_id": feedback.id,
                "response_status": response.status
            }
        )
        session.add(notification)
        session.commit()
    
    return feedback

@router.put("/{feedback_id}/status", response_model=FeedbackRead)
def update_feedback_status(
    feedback_id: int,
    status: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("admin", "superadmin", "management"))
):
    feedback = session.get(FeedbackForm, feedback_id)
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    # Validate status
    valid_statuses = ["pending", "reviewing", "resolved"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    feedback.status = status
    if status == "resolved" and not feedback.resolved_at:
        feedback.resolved_at = datetime.utcnow()
        feedback.resolved_by = current_user.id
    
    session.commit()
    session.refresh(feedback)
    
    return feedback

@router.put("/{feedback_id}/priority", response_model=FeedbackRead)
def update_feedback_priority(
    feedback_id: int,
    priority: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("admin", "superadmin", "management"))
):
    feedback = session.get(FeedbackForm, feedback_id)
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    # Validate priority
    valid_priorities = ["low", "medium", "high"]
    if priority not in valid_priorities:
        raise HTTPException(status_code=400, detail=f"Invalid priority. Must be one of: {valid_priorities}")
    
    feedback.priority = priority
    session.commit()
    session.refresh(feedback)
    
    return feedback

@router.delete("/{feedback_id}", response_model=dict)
def delete_feedback(
    feedback_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("admin", "superadmin"))
):
    feedback = session.get(FeedbackForm, feedback_id)
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    session.delete(feedback)
    session.commit()
    
    return {"message": "Feedback deleted successfully"}

# Bulk operations for admin
@router.put("/bulk/status", response_model=dict)
def bulk_update_status(
    feedback_ids: List[int],
    status: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("admin", "superadmin", "management"))
):
    # Validate status
    valid_statuses = ["pending", "reviewing", "resolved"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    updated_count = 0
    for feedback_id in feedback_ids:
        feedback = session.get(FeedbackForm, feedback_id)
        if feedback:
            feedback.status = status
            if status == "resolved" and not feedback.resolved_at:
                feedback.resolved_at = datetime.utcnow()
                feedback.resolved_by = current_user.id
            updated_count += 1
    
    session.commit()
    return {"message": f"Updated status for {updated_count} feedback items"}

@router.put("/bulk/priority", response_model=dict)
def bulk_update_priority(
    feedback_ids: List[int],
    priority: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("admin", "superadmin", "management"))
):
    # Validate priority
    valid_priorities = ["low", "medium", "high"]
    if priority not in valid_priorities:
        raise HTTPException(status_code=400, detail=f"Invalid priority. Must be one of: {valid_priorities}")
    
    updated_count = 0
    for feedback_id in feedback_ids:
        feedback = session.get(FeedbackForm, feedback_id)
        if feedback:
            feedback.priority = priority
            updated_count += 1
    
    session.commit()
    return {"message": f"Updated priority for {updated_count} feedback items"}
