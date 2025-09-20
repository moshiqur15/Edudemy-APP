from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from .models import UserRole, NotificationType, MessageType, FeedbackType, BehaviorType, Gender, StudentVersion, AccessRequestStatus

class Token(BaseModel):
    access_token: str
    token_type: str
    user: 'UserRead'

class TokenPayload(BaseModel):
    sub: Optional[str] = None

class UserCreate(BaseModel):
    email: str
    username: str
    full_name: Optional[str] = None
    password: str
    role: UserRole = UserRole.TEACHER
    designation: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    is_active: bool = True

class UserUpdate(BaseModel):
    email: Optional[str] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    designation: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None

class UserRead(BaseModel):
    id: int
    email: str
    username: str
    full_name: Optional[str]
    role: UserRole
    designation: Optional[str]
    is_active: bool
    phone: Optional[str]
    department: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

class LoginRequest(BaseModel):
    username: str
    password: str

class StudentCreate(BaseModel):
    # Basic Information (Required)
    full_name: str
    father_name: str
    mother_name: str
    gender: Gender
    class_name: str
    version: StudentVersion = StudentVersion.BV
    
    # Contact Information
    student_contact: Optional[str] = None
    father_contact: Optional[str] = None
    mother_contact: Optional[str] = None
    
    # Additional Information
    date_of_birth: Optional[datetime] = None
    address: Optional[str] = None
    current_school: Optional[str] = None
    batch_id: Optional[int] = None
    admission_date: Optional[datetime] = None
    
    # Legacy fields (for backward compatibility)
    phone: Optional[str] = None
    email: Optional[str] = None

class StudentUpdate(BaseModel):
    full_name: Optional[str] = None
    father_name: Optional[str] = None
    mother_name: Optional[str] = None
    gender: Optional[Gender] = None
    class_name: Optional[str] = None
    version: Optional[StudentVersion] = None
    student_contact: Optional[str] = None
    father_contact: Optional[str] = None
    mother_contact: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    address: Optional[str] = None
    current_school: Optional[str] = None
    batch_id: Optional[int] = None
    phone: Optional[str] = None
    email: Optional[str] = None

class StudentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    user_id: Optional[int]
    
    # Basic Information
    full_name: str
    father_name: str
    mother_name: str
    gender: Gender
    class_name: str
    version: StudentVersion
    
    # Contact Information
    student_contact: Optional[str]
    father_contact: Optional[str]
    mother_contact: Optional[str]
    
    # Academic Information
    batch_id: Optional[int]
    current_school: Optional[str]
    
    # Generated IDs
    student_reg_number: Optional[str]
    student_roll_number: Optional[str]
    admission_serial: Optional[int]
    
    # Additional Information
    date_of_birth: Optional[datetime]
    address: Optional[str]
    admission_date: Optional[datetime]
    
    # Legacy fields
    phone: Optional[str]
    email: Optional[str]
    student_id: Optional[str]
    parent_name: Optional[str]
    parent_phone: Optional[str]

class StudentIDPreview(BaseModel):
    student_reg_number: str
    student_roll_number: str
    class_code: str
    gender_code: str
    serial: int
    format_explanation: Dict[str, Any]

# Permission Schemas
class PermissionCreate(BaseModel):
    name: str
    description: Optional[str] = None
    resource: str
    action: str

class PermissionRead(BaseModel):
    id: int
    name: str
    description: Optional[str]
    resource: str
    action: str
    created_at: Optional[datetime]

# Role Permission Schemas
class RolePermissionCreate(BaseModel):
    role: UserRole
    permission_id: int
    granted: bool = True

class UserPermissionCreate(BaseModel):
    user_id: int
    permission_id: int
    granted: bool = True

# Teacher Schemas
class TeacherCreate(BaseModel):
    user_id: int
    employee_id: Optional[str] = None
    subjects: Optional[str] = None
    specialization: Optional[str] = None
    qualification: Optional[str] = None  # No longer required
    additional_qualifications: Optional[str] = None
    experience_years: Optional[int] = None  # No longer required
    previous_experience: Optional[str] = None
    joining_date: Optional[datetime] = None
    employment_type: Optional[str] = "full_time"
    hourly_rate: Optional[float] = None  # Changed from salary to hourly_rate
    emergency_contact: Optional[str] = None
    emergency_contact_relation: Optional[str] = None
    preferred_classes: Optional[str] = None
    max_classes_per_day: Optional[int] = 6
    preferred_time_slots: Optional[str] = None
    bio: Optional[str] = None
    achievements: Optional[str] = None
    is_active: bool = True

class TeacherUpdate(BaseModel):
    employee_id: Optional[str] = None
    subjects: Optional[str] = None
    specialization: Optional[str] = None
    qualification: Optional[str] = None
    additional_qualifications: Optional[str] = None
    experience_years: Optional[int] = None
    previous_experience: Optional[str] = None
    joining_date: Optional[datetime] = None
    employment_type: Optional[str] = None
    hourly_rate: Optional[float] = None  # Changed from salary to hourly_rate
    emergency_contact: Optional[str] = None
    emergency_contact_relation: Optional[str] = None
    preferred_classes: Optional[str] = None
    max_classes_per_day: Optional[int] = None
    preferred_time_slots: Optional[str] = None
    bio: Optional[str] = None
    achievements: Optional[str] = None
    is_active: Optional[bool] = None

class TeacherRead(BaseModel):
    id: int
    user_id: int
    employee_id: Optional[str]
    subjects: Optional[str]
    specialization: Optional[str]
    qualification: Optional[str]
    additional_qualifications: Optional[str]
    experience_years: Optional[int]
    previous_experience: Optional[str]
    joining_date: Optional[datetime]
    employment_type: Optional[str]
    hourly_rate: Optional[float]  # Changed from salary to hourly_rate
    emergency_contact: Optional[str]
    emergency_contact_relation: Optional[str]
    preferred_classes: Optional[str]
    max_classes_per_day: Optional[int]
    preferred_time_slots: Optional[str]
    bio: Optional[str]
    achievements: Optional[str]
    is_active: bool
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

class TeacherWithUser(BaseModel):
    """Teacher profile with user information"""
    teacher: TeacherRead
    user: UserRead

# Batch Schemas
class BatchCreate(BaseModel):
    name: str
    code: Optional[str] = None
    course: Optional[str] = None
    class_name: Optional[str] = None
    version: Optional[StudentVersion] = StudentVersion.BV
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    max_students: Optional[int] = 30
    min_students: Optional[int] = 5
    schedule_days: Optional[str] = None  # JSON string
    time_slot: Optional[str] = None
    fee_amount: Optional[float] = None
    fee_period: Optional[str] = "monthly"
    discount_percentage: Optional[float] = 0.0
    status: Optional[str] = "active"
    notes: Optional[str] = None

class BatchUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    course: Optional[str] = None
    class_name: Optional[str] = None
    version: Optional[StudentVersion] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    max_students: Optional[int] = None
    min_students: Optional[int] = None
    schedule_days: Optional[str] = None
    time_slot: Optional[str] = None
    fee_amount: Optional[float] = None
    fee_period: Optional[str] = None
    discount_percentage: Optional[float] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class BatchRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    code: Optional[str]
    course: Optional[str]
    class_name: Optional[str]
    version: Optional[StudentVersion]
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    max_students: Optional[int]
    min_students: Optional[int]
    current_students_count: Optional[int]
    schedule_days: Optional[str]
    time_slot: Optional[str]
    fee_amount: Optional[float]
    fee_period: Optional[str]
    discount_percentage: Optional[float]
    status: Optional[str]
    notes: Optional[str]
    created_by: Optional[int]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

class BatchWithStats(BaseModel):
    """Batch with additional statistics"""
    batch: BatchRead
    stats: Dict[str, Any]  # Can include enrollment stats, attendance rates, etc.

# Class Assignment Schemas
class ClassAssignmentCreate(BaseModel):
    batch_id: int
    teacher_id: int
    subject: str
    scheduled_at: datetime
    duration_minutes: Optional[int] = 60
    classroom: Optional[str] = None
    is_recurring: bool = False
    recurring_days: Optional[str] = None

class ClassAssignmentRead(BaseModel):
    id: int
    batch_id: int
    teacher_id: int
    subject: str
    scheduled_at: datetime
    duration_minutes: Optional[int]
    classroom: Optional[str]
    is_recurring: bool
    recurring_days: Optional[str]

# Messaging Schemas
class ChatGroupCreate(BaseModel):
    name: str
    description: Optional[str] = None

class ChatGroupRead(BaseModel):
    id: int
    name: str
    description: Optional[str]
    created_by: int
    is_active: bool
    created_at: Optional[datetime]

class ChatGroupMemberAdd(BaseModel):
    user_ids: List[int]
    is_admin: bool = False

class MessageCreate(BaseModel):
    receiver_id: int
    content: str
    message_type: MessageType = MessageType.TEXT
    file_url: Optional[str] = None

class MessageRead(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    content: str
    message_type: MessageType
    file_url: Optional[str]
    is_read: bool
    sent_at: Optional[datetime]

class GroupMessageCreate(BaseModel):
    group_id: int
    content: str
    message_type: MessageType = MessageType.TEXT
    file_url: Optional[str] = None

class GroupMessageRead(BaseModel):
    id: int
    group_id: int
    sender_id: int
    content: str
    message_type: MessageType
    file_url: Optional[str]
    sent_at: Optional[datetime]

# Notification Schemas
class NotificationCreate(BaseModel):
    user_id: int
    title: str
    message: str
    notification_type: NotificationType
    data: Optional[Dict[str, Any]] = None

class NotificationRead(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    notification_type: NotificationType
    is_read: bool
    data: Optional[Dict[str, Any]]
    created_at: Optional[datetime]

# Task Management Schemas
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    assigned_to: int
    due_date: Optional[datetime] = None
    priority: str = "medium"

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[str] = None
    status: Optional[str] = None

class TaskRead(BaseModel):
    id: int
    title: str
    description: Optional[str]
    created_by: int
    assigned_to: int
    due_date: Optional[datetime]
    priority: str
    status: str
    created_at: Optional[datetime]
    completed_at: Optional[datetime]

# Academic Schemas
class ExamCreate(BaseModel):
    title: str
    subject: str
    batch_id: int
    exam_date: datetime
    max_marks: float
    duration_minutes: int

class ExamRead(BaseModel):
    id: int
    title: str
    subject: str
    batch_id: int
    exam_date: datetime
    max_marks: float
    duration_minutes: int
    created_at: Optional[datetime]

class ExamResultCreate(BaseModel):
    exam_id: int
    student_id: int
    marks_obtained: float
    grade: Optional[str] = None
    remarks: Optional[str] = None

class ExamResultRead(BaseModel):
    id: int
    exam_id: int
    student_id: int
    teacher_id: int
    marks_obtained: float
    grade: Optional[str]
    remarks: Optional[str]
    entered_at: Optional[datetime]

# Access Request Schemas
class AccessRequestCreate(BaseModel):
    full_name: str
    email: str
    password: str
    requested_role: UserRole
    reason: Optional[str] = None

class AccessRequestVerify(BaseModel):
    registration_token: str
    verification_code: str

class AccessRequestResendCode(BaseModel):
    registration_token: str

class AccessRequestApprove(BaseModel):
    reason: Optional[str] = "Access request approved by administrator."

class AccessRequestReject(BaseModel):
    reason: str

class AccessRequestRead(BaseModel):
    id: int
    full_name: str
    email: str
    requested_role: UserRole
    status: AccessRequestStatus
    reason: Optional[str]
    admin_reason: Optional[str]
    email_verified: bool
    reviewed_by: Optional[int]
    reviewed_at: Optional[datetime]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    
    # Additional fields for display
    reviewed_by_name: Optional[str] = None

class AttendanceCreate(BaseModel):
    student_id: int
    class_date: datetime
    subject: str
    is_present: bool
    remarks: Optional[str] = None

class AttendanceRead(BaseModel):
    id: int
    student_id: int
    teacher_id: int
    class_date: datetime
    subject: str
    is_present: bool
    marked_at: Optional[datetime]
    remarks: Optional[str]

class BehaviorRecordCreate(BaseModel):
    student_id: int
    behavior_type: BehaviorType
    title: str
    description: str
    severity: Optional[str] = "medium"

class BehaviorRecordRead(BaseModel):
    id: int
    student_id: int
    teacher_id: int
    behavior_type: BehaviorType
    title: str
    description: str
    severity: Optional[str]
    date_recorded: Optional[datetime]

# Payment Schemas
class PaymentCreate(BaseModel):
    student_id: int
    amount: float
    payment_type: str = "fee"
    payment_method: str = "cash"
    due_date: Optional[datetime] = None
    remarks: Optional[str] = None

class PaymentRead(BaseModel):
    id: int
    student_id: int
    amount: float
    payment_type: str
    payment_method: str
    payment_date: Optional[datetime]
    due_date: Optional[datetime]
    status: str
    remarks: Optional[str]
    collected_by: Optional[int]

# Feedback Schemas
class FeedbackCreate(BaseModel):
    feedback_type: FeedbackType
    subject: str
    message: str
    is_anonymous: bool = False

class FeedbackRead(BaseModel):
    id: int
    student_id: int
    feedback_type: FeedbackType
    subject: str
    message: str
    is_anonymous: bool
    status: str
    priority: str
    submitted_at: Optional[datetime]
    resolved_at: Optional[datetime]
    resolved_by: Optional[int]
    admin_response: Optional[str]

class FeedbackResponse(BaseModel):
    admin_response: str
    status: str = "resolved"

# Report Card Schemas
class ReportCardCreate(BaseModel):
    student_id: int
    term: str
    academic_year: str
    overall_grade: Optional[str] = None
    overall_percentage: Optional[float] = None
    attendance_percentage: Optional[float] = None
    teacher_remarks: Optional[str] = None
    subject_grades: Optional[Dict[str, Any]] = None
    behavior_summary: Optional[Dict[str, Any]] = None

class ReportCardRead(BaseModel):
    id: int
    student_id: int
    term: str
    academic_year: str
    overall_grade: Optional[str]
    overall_percentage: Optional[float]
    attendance_percentage: Optional[float]
    teacher_remarks: Optional[str]
    generated_by: int
    generated_at: Optional[datetime]
    subject_grades: Optional[Dict[str, Any]]
    behavior_summary: Optional[Dict[str, Any]]

# Dashboard Schemas
class DashboardStats(BaseModel):
    total_students: int
    total_teachers: int
    total_batches: int
    pending_tasks: int
    unread_messages: int
    pending_feedback: int

class StudentDashboard(BaseModel):
    upcoming_classes: List[ClassAssignmentRead]
    recent_results: List[ExamResultRead]
    attendance_summary: Dict[str, Any]
    unread_messages: int
    notifications: List[NotificationRead]
