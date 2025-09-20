from typing import Optional, List, Dict, Any
from sqlmodel import SQLModel, Field, Relationship, JSON, Column
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    SUPERADMIN = "superadmin"
    ADMIN = "admin"
    MANAGEMENT = "management"
    TEACHER = "teacher"
    STUDENT = "student"
    ACADEMICS = "academics"

class NotificationType(str, Enum):
    CLASS_REMINDER = "class_reminder"
    EXAM_REMINDER = "exam_reminder"
    TASK_ASSIGNED = "task_assigned"
    REPORT_DUE = "report_due"
    STUDENT_ISSUE = "student_issue"
    GENERAL = "general"

class MessageType(str, Enum):
    TEXT = "text"
    FILE = "file"
    IMAGE = "image"

class FeedbackType(str, Enum):
    ISSUE = "issue"
    SUGGESTION = "suggestion"
    COMPLAINT = "complaint"
    PRAISE = "praise"

class BehaviorType(str, Enum):
    STRENGTH = "strength"
    WEAKNESS = "weakness"
    BEHAVIOR = "behavior"

class UserBase(SQLModel):
    email: str
    username: str
    full_name: Optional[str] = None
    role: UserRole = UserRole.STUDENT
    designation: Optional[str] = None  # For management team specific titles
    is_active: bool = True
    phone: Optional[str] = None
    department: Optional[str] = None
    profile_image: Optional[str] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str
    teacher: Optional['Teacher'] = Relationship(back_populates='user')
    student: Optional['Student'] = Relationship(back_populates='user')
    created_by: Optional[int] = Field(default=None, foreign_key='user.id')
    last_login: Optional[datetime] = None
    
    # Relationships
    sent_messages: List['Message'] = Relationship(
        back_populates='sender',
        sa_relationship_kwargs={"foreign_keys": "[Message.sender_id]"}
    )
    received_messages: List['Message'] = Relationship(
        back_populates='receiver',
        sa_relationship_kwargs={"foreign_keys": "[Message.receiver_id]"}
    )
    notifications: List['Notification'] = Relationship(back_populates='user')
    created_tasks: List['Task'] = Relationship(
        back_populates='created_by_user',
        sa_relationship_kwargs={"foreign_keys": "[Task.created_by]"}
    )
    assigned_tasks: List['Task'] = Relationship(
        back_populates='assigned_to_user',
        sa_relationship_kwargs={"foreign_keys": "[Task.assigned_to]"}
    )

# Permission System Models
class Permission(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True)
    description: Optional[str] = None
    resource: str  # e.g., 'users', 'students', 'reports'
    action: str    # e.g., 'create', 'read', 'update', 'delete'
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

class RolePermission(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    role: UserRole
    permission_id: int = Field(foreign_key='permission.id')
    granted: bool = True
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

class UserPermission(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key='user.id')
    permission_id: int = Field(foreign_key='permission.id')
    granted: bool = True
    granted_by: Optional[int] = Field(default=None, foreign_key='user.id')
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

class Teacher(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key='user.id')
    
    # Professional Information
    employee_id: Optional[str] = Field(default=None, unique=True)
    subjects: Optional[str] = None  # comma separated for MVP
    specialization: Optional[str] = None  # Main area of expertise
    qualification: Optional[str] = None
    additional_qualifications: Optional[str] = None  # JSON string for multiple qualifications
    experience_years: Optional[int] = None
    previous_experience: Optional[str] = None  # Previous work experience
    
    # Employment Details
    joining_date: Optional[datetime] = None
    employment_type: Optional[str] = "full_time"  # full_time, part_time, contract
    hourly_rate: Optional[float] = None  # Hourly rate for teachers
    emergency_contact: Optional[str] = None
    emergency_contact_relation: Optional[str] = None
    
    # Teaching Preferences
    preferred_classes: Optional[str] = None  # JSON string of preferred class levels
    max_classes_per_day: Optional[int] = 6
    preferred_time_slots: Optional[str] = None  # JSON string of time preferences
    
    # Additional Information
    bio: Optional[str] = None  # Teacher biography/description
    achievements: Optional[str] = None  # Notable achievements
    is_active: bool = True
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    # Relationships
    user: Optional[User] = Relationship(back_populates='teacher')
    class_assignments: List['ClassAssignment'] = Relationship(back_populates='teacher')
    exam_results: List['ExamResult'] = Relationship(back_populates='teacher')
    attendance_records: List['Attendance'] = Relationship(back_populates='teacher')

# Student Version Enum
class StudentVersion(str, Enum):
    BV = "BV"  # Bangla Version
    EV = "EV"  # English Version

# Gender Enum
class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"

class Student(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key='user.id')
    
    # Basic Information
    full_name: str
    father_name: str
    mother_name: str
    gender: Gender
    date_of_birth: Optional[datetime] = None
    address: Optional[str] = None
    
    # Academic Information
    class_name: str  # e.g., "Class 10", "HSC", "SSC"
    batch_id: Optional[int] = Field(default=None, foreign_key='batch.id')
    version: StudentVersion = StudentVersion.BV
    current_school: Optional[str] = None
    
    # Generated IDs
    student_reg_number: Optional[str] = Field(default=None, unique=True)  # Auto-generated: YYYY-GG-VV-RRRR
    student_roll_number: Optional[str] = Field(default=None, unique=True)  # Auto-generated based on admission serial
    
    # Contact Information (JSON structure)
    student_contact: Optional[str] = None  # Student's own contact
    father_contact: Optional[str] = None   # Father's contact
    mother_contact: Optional[str] = None   # Mother's contact
    
    # Legacy fields (keeping for compatibility)
    phone: Optional[str] = None
    email: Optional[str] = None
    student_id: Optional[str] = None  # Deprecated, use student_reg_number
    parent_name: Optional[str] = None  # Deprecated, use father_name/mother_name
    parent_phone: Optional[str] = None  # Deprecated, use father_contact/mother_contact
    
    # Admission Information
    admission_date: Optional[datetime] = Field(default_factory=datetime.utcnow)
    admission_serial: Optional[int] = None  # Used for roll number generation
    
    # Relationships
    user: Optional[User] = Relationship(back_populates='student')
    batch: Optional['Batch'] = Relationship(back_populates='students')
    exam_results: List['ExamResult'] = Relationship(back_populates='student')
    attendance_records: List['Attendance'] = Relationship(back_populates='student')
    behavior_records: List['BehaviorRecord'] = Relationship(back_populates='student')
    feedback_submissions: List['FeedbackForm'] = Relationship(back_populates='student')
    payments: List['Payment'] = Relationship(back_populates='student')

class Batch(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str  # Batch name (e.g., "Morning Batch A")
    code: Optional[str] = None  # Unique batch code (e.g., "MB-2025-01")
    course: Optional[str] = None  # Course name or subject focus
    class_name: Optional[str] = None  # Class level (e.g., "Class 10", "HSC")
    version: Optional[StudentVersion] = StudentVersion.BV  # BV or EV
    
    # Dates
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    
    # Capacity
    max_students: Optional[int] = 30
    min_students: Optional[int] = 5
    current_students_count: Optional[int] = 0  # To be updated on student assignment
    
    # Schedule Info
    schedule_days: Optional[str] = None  # JSON string of weekdays (e.g., ["Mon", "Wed", "Fri"])
    time_slot: Optional[str] = None  # e.g., "08:00-10:00"
    
    # Financial Info
    fee_amount: Optional[float] = None
    fee_period: Optional[str] = "monthly"  # monthly, quarterly, yearly, one-time
    discount_percentage: Optional[float] = 0.0
    
    # Status
    status: Optional[str] = "active"  # active, completed, cancelled, upcoming
    notes: Optional[str] = None  # Additional notes about the batch
    
    # Metadata
    created_by: Optional[int] = Field(default=None, foreign_key='user.id')
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    # Relationships
    students: List[Student] = Relationship(back_populates='batch')
    class_assignments: List['ClassAssignment'] = Relationship(back_populates='batch')

class ClassAssignment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    batch_id: Optional[int] = Field(default=None, foreign_key='batch.id')
    teacher_id: Optional[int] = Field(default=None, foreign_key='teacher.id')
    subject: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    duration_minutes: Optional[int] = 60
    classroom: Optional[str] = None
    is_recurring: bool = False
    recurring_days: Optional[str] = None  # JSON string of days
    created_by: Optional[int] = Field(default=None, foreign_key='user.id')
    
    # Relationships
    batch: Optional[Batch] = Relationship(back_populates='class_assignments')
    teacher: Optional[Teacher] = Relationship(back_populates='class_assignments')

# Messaging System Models
class ChatGroup(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None
    created_by: int = Field(foreign_key='user.id')
    is_active: bool = True
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    # Relationships
    members: List['ChatGroupMember'] = Relationship(back_populates='group')
    messages: List['GroupMessage'] = Relationship(back_populates='group')

class ChatGroupMember(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    group_id: int = Field(foreign_key='chatgroup.id')
    user_id: int = Field(foreign_key='user.id')
    joined_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    is_admin: bool = False
    
    # Relationships
    group: Optional[ChatGroup] = Relationship(back_populates='members')

class Message(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    sender_id: int = Field(foreign_key='user.id')
    receiver_id: int = Field(foreign_key='user.id')
    content: str
    message_type: MessageType = MessageType.TEXT
    file_url: Optional[str] = None
    is_read: bool = False
    sent_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    # Relationships
    sender: Optional[User] = Relationship(
        back_populates='sent_messages',
        sa_relationship_kwargs={"foreign_keys": "[Message.sender_id]"}
    )
    receiver: Optional[User] = Relationship(
        back_populates='received_messages',
        sa_relationship_kwargs={"foreign_keys": "[Message.receiver_id]"}
    )

class GroupMessage(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    group_id: int = Field(foreign_key='chatgroup.id')
    sender_id: int = Field(foreign_key='user.id')
    content: str
    message_type: MessageType = MessageType.TEXT
    file_url: Optional[str] = None
    sent_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    # Relationships
    group: Optional[ChatGroup] = Relationship(back_populates='messages')

# Notification System
class Notification(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key='user.id')
    title: str
    message: str
    notification_type: NotificationType
    is_read: bool = False
    data: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))  # Additional data
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    # Relationships
    user: Optional[User] = Relationship(back_populates='notifications')

# Task Management System
class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: Optional[str] = None
    created_by: int = Field(foreign_key='user.id')
    assigned_to: int = Field(foreign_key='user.id')
    due_date: Optional[datetime] = None
    priority: str = "medium"  # low, medium, high
    status: str = "pending"   # pending, in_progress, completed
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    
    # Relationships
    created_by_user: Optional[User] = Relationship(
        back_populates='created_tasks',
        sa_relationship_kwargs={"foreign_keys": "[Task.created_by]"}
    )
    assigned_to_user: Optional[User] = Relationship(
        back_populates='assigned_tasks',
        sa_relationship_kwargs={"foreign_keys": "[Task.assigned_to]"}
    )

# Academic Management Models
class Exam(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    subject: str
    batch_id: int = Field(foreign_key='batch.id')
    exam_date: datetime
    max_marks: float
    duration_minutes: int
    created_by: int = Field(foreign_key='user.id')
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    # Relationships
    results: List['ExamResult'] = Relationship(back_populates='exam')

class ExamResult(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    exam_id: int = Field(foreign_key='exam.id')
    student_id: int = Field(foreign_key='student.id')
    teacher_id: int = Field(foreign_key='teacher.id')  # Who entered the marks
    marks_obtained: float
    grade: Optional[str] = None
    remarks: Optional[str] = None
    entered_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    # Relationships
    exam: Optional[Exam] = Relationship(back_populates='results')
    student: Optional[Student] = Relationship(back_populates='exam_results')
    teacher: Optional[Teacher] = Relationship(back_populates='exam_results')

class Attendance(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key='student.id')
    teacher_id: int = Field(foreign_key='teacher.id')
    class_date: datetime
    subject: str
    is_present: bool
    marked_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    remarks: Optional[str] = None
    
    # Relationships
    student: Optional[Student] = Relationship(back_populates='attendance_records')
    teacher: Optional[Teacher] = Relationship(back_populates='attendance_records')

class BehaviorRecord(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key='student.id')
    teacher_id: int = Field(foreign_key='teacher.id')
    behavior_type: BehaviorType
    title: str
    description: str
    severity: Optional[str] = "medium"  # low, medium, high
    date_recorded: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    # Relationships
    student: Optional[Student] = Relationship(back_populates='behavior_records')

# Payment System
class Payment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key='student.id')
    amount: float
    payment_type: str = "fee"  # fee, fine, other
    payment_method: str = "cash"  # cash, card, online
    payment_date: Optional[datetime] = Field(default_factory=datetime.utcnow)
    due_date: Optional[datetime] = None
    status: str = "paid"  # pending, paid, overdue
    remarks: Optional[str] = None
    collected_by: Optional[int] = Field(default=None, foreign_key='user.id')
    
    # Relationships
    student: Optional[Student] = Relationship(back_populates='payments')

# Feedback System
class FeedbackForm(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key='student.id')
    feedback_type: FeedbackType
    subject: str
    message: str
    is_anonymous: bool = False
    status: str = "pending"  # pending, reviewing, resolved
    priority: str = "medium"  # low, medium, high
    submitted_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[int] = Field(default=None, foreign_key='user.id')
    admin_response: Optional[str] = None
    
    # Relationships
    student: Optional[Student] = Relationship(back_populates='feedback_submissions')

# Report Card System
class ReportCard(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key='student.id')
    term: str  # e.g., "Semester 1", "Quarter 1"
    academic_year: str  # e.g., "2023-2024"
    overall_grade: Optional[str] = None
    overall_percentage: Optional[float] = None
    attendance_percentage: Optional[float] = None
    teacher_remarks: Optional[str] = None
    generated_by: int = Field(foreign_key='user.id')
    generated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    # Additional data stored as JSON
    subject_grades: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    behavior_summary: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
