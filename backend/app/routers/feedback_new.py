from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlmodel import Session, select, func
from typing import List, Optional
from datetime import datetime
import os
import uuid
import shutil

from ..database import get_session
from ..models import (
    User, Feedback, FeedbackResponse, FeedbackCreate, FeedbackResponse_Create,
    FeedbackRead, FeedbackResponseRead, FeedbackList, Notification, NotificationType
)
from ..core.deps import get_current_user, require_role

router = APIRouter(prefix="/feedback", tags=["feedback"])

# Directory to store feedback attachments
UPLOAD_DIR = "uploads/feedback"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/", response_model=dict)
def create_feedback(
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
            notification = Notification(
                user_id=admin.id,
                title="New Feedback Received",
                message=f"New feedback: '{subject}' from {current_user.full_name if not is_anonymous else 'Anonymous'}",
                notification_type=NotificationType.GENERAL,
                data={
                    "feedback_id": feedback.id,
                    "sender_id": current_user.id,
                    "is_anonymous": is_anonymous
                }
            )
            session.add(notification)
        
        return {"message": "Feedback submitted successfully", "feedback_id": feedback.id}
        
    except Exception as e:
        session.rollback()
        if attachment_path and os.path.exists(attachment_path):
            os.remove(attachment_path)
        raise HTTPException(status_code=500, detail=f"Failed to submit feedback: {str(e)}")

@router.get("/", response_model=List[FeedbackList])
def get_feedback_list(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get list of feedback (admin/superadmin only)"""
    if current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        # Get feedback with response count
        query = select(
            Feedback.id,
            Feedback.subject,
            Feedback.is_anonymous,
            Feedback.sender_name,
            Feedback.status,
            Feedback.created_at,
            func.count(FeedbackResponse.id).label("responses_count")
        ).outerjoin(FeedbackResponse).group_by(Feedback.id).order_by(Feedback.created_at.desc())
        
        results = session.exec(query).all()
        
        feedback_list = []
        for result in results:
            feedback_list.append(FeedbackList(
                id=result.id,
                subject=result.subject,
                is_anonymous=result.is_anonymous,
                sender_name=result.sender_name,
                status=result.status,
                created_at=result.created_at,
                responses_count=result.responses_count or 0
            ))
        
        return feedback_list
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get feedback list: {str(e)}")

@router.get("/{feedback_id}", response_model=FeedbackRead)
def get_feedback_details(
    feedback_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get detailed feedback with responses (admin/superadmin only)"""
    if current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        feedback = session.get(Feedback, feedback_id)
        if not feedback:
            raise HTTPException(status_code=404, detail="Feedback not found")
        
        # Get responses with responder names
        responses = session.exec(
            select(FeedbackResponse, User.full_name)
            .join(User, FeedbackResponse.responder_id == User.id)
            .where(FeedbackResponse.feedback_id == feedback_id)
            .order_by(FeedbackResponse.created_at)
        ).all()
        
        response_list = []
        for response, responder_name in responses:
            response_list.append(FeedbackResponseRead(
                id=response.id,
                responder_id=response.responder_id,
                responder_name=responder_name,
                response_content=response.response_content,
                created_at=response.created_at
            ))
        
        return FeedbackRead(
            id=feedback.id,
            subject=feedback.subject,
            content=feedback.content,
            is_anonymous=feedback.is_anonymous,
            sender_name=feedback.sender_name,
            sender_position=feedback.sender_position,
            attachment_filename=feedback.attachment_filename,
            status=feedback.status,
            created_at=feedback.created_at,
            responses=response_list
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get feedback details: {str(e)}")

@router.post("/{feedback_id}/respond", response_model=dict)
def respond_to_feedback(
    feedback_id: int,
    response_data: FeedbackResponse_Create,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Respond to feedback (admin/superadmin only)"""
    if current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        feedback = session.get(Feedback, feedback_id)
        if not feedback:
            raise HTTPException(status_code=404, detail="Feedback not found")
        
        # Create response
        response = FeedbackResponse(
            feedback_id=feedback_id,
            responder_id=current_user.id,
            response_content=response_data.response_content
        )
        
        session.add(response)
        
        # Update feedback status
        feedback.status = "responded"
        feedback.updated_at = datetime.utcnow()
        
        session.commit()
        
        # Send notification to original feedback sender (if not anonymous)
        if feedback.sender_id and not feedback.is_anonymous:
            notification = Notification(
                user_id=feedback.sender_id,
                title="Feedback Response Received",
                message=f"Your feedback '{feedback.subject}' has received a response from {current_user.full_name}",
                notification_type=NotificationType.GENERAL,
                data={
                    "feedback_id": feedback.id,
                    "responder_id": current_user.id,
                    "response_id": response.id
                }
            )
            session.add(notification)
        
        return {"message": "Response added successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to respond to feedback: {str(e)}")

@router.get("/{feedback_id}/attachment")
def download_attachment(
    feedback_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Download feedback attachment (admin/superadmin only)"""
    if current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        feedback = session.get(Feedback, feedback_id)
        if not feedback:
            raise HTTPException(status_code=404, detail="Feedback not found")
        
        if not feedback.attachment_path or not os.path.exists(feedback.attachment_path):
            raise HTTPException(status_code=404, detail="Attachment not found")
        
        return FileResponse(
            path=feedback.attachment_path,
            filename=feedback.attachment_filename,
            media_type='application/octet-stream'
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to download attachment: {str(e)}")

@router.put("/{feedback_id}/status")
def update_feedback_status(
    feedback_id: int,
    status: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Update feedback status (admin/superadmin only)"""
    if current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if status not in ["pending", "responded", "closed"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    try:
        feedback = session.get(Feedback, feedback_id)
        if not feedback:
            raise HTTPException(status_code=404, detail="Feedback not found")
        
        feedback.status = status
        feedback.updated_at = datetime.utcnow()
        
        session.commit()
        
        return {"message": "Status updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update status: {str(e)}")

@router.get("/my/submissions", response_model=List[FeedbackList])
def get_my_feedback(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get current user's feedback submissions"""
    try:
        query = select(
            Feedback.id,
            Feedback.subject,
            Feedback.is_anonymous,
            Feedback.sender_name,
            Feedback.status,
            Feedback.created_at,
            func.count(FeedbackResponse.id).label("responses_count")
        ).where(
            Feedback.sender_id == current_user.id
        ).outerjoin(FeedbackResponse).group_by(Feedback.id).order_by(Feedback.created_at.desc())
        
        results = session.exec(query).all()
        
        feedback_list = []
        for result in results:
            feedback_list.append(FeedbackList(
                id=result.id,
                subject=result.subject,
                is_anonymous=result.is_anonymous,
                sender_name=result.sender_name,
                status=result.status,
                created_at=result.created_at,
                responses_count=result.responses_count or 0
            ))
        
        return feedback_list
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get feedback: {str(e)}")