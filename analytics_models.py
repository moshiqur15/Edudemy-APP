from typing import Optional, List, Dict, Any
from sqlmodel import SQLModel, Field, Relationship, JSON, Column
from datetime import datetime
from enum import Enum

# Import existing models
from backend.app.models import Student, Teacher, Batch

class AnalyticsRatingType(str, Enum):
    ATTENDANCE = "attendance"
    HOMEWORK_CLASSWORK = "homework_classwork"  
    EXAM = "exam"
    SKILLS = "skills"
    OVERALL = "overall"

class RecommendationStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    DISMISSED = "dismissed"
    EXPIRED = "expired"

class HomeworkSubmission(SQLModel, table=True):
    """Detailed homework tracking"""
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key="student.id")
    teacher_id: Optional[int] = Field(default=None, foreign_key="teacher.id")
    subject: str
    title: str
    assigned_date: datetime
    due_date: datetime
    submitted_date: Optional[datetime] = None
    
    # Quality metrics
    is_submitted: bool = False
    submission_quality: Optional[float] = Field(default=None, ge=0.0, le=1.0)  # 0-1 scale
    is_on_time: bool = False
    quality_notes: Optional[str] = None
    
    # Grading
    max_marks: Optional[float] = None
    marks_obtained: Optional[float] = None
    grade: Optional[str] = None
    
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    # Relationships
    student: Optional[Student] = Relationship()
    teacher: Optional[Teacher] = Relationship()

class ClassworkSubmission(SQLModel, table=True):
    """Detailed classwork tracking"""
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key="student.id")
    teacher_id: Optional[int] = Field(default=None, foreign_key="teacher.id")
    subject: str
    class_date: datetime
    topic: str
    
    # Quality metrics
    participation_level: Optional[float] = Field(default=None, ge=0.0, le=1.0)  # 0-1 scale
    understanding_level: Optional[float] = Field(default=None, ge=0.0, le=1.0)  # 0-1 scale
    submission_quality: Optional[float] = Field(default=None, ge=0.0, le=1.0)  # 0-1 scale
    
    # Notes
    teacher_notes: Optional[str] = None
    
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    # Relationships
    student: Optional[Student] = Relationship()
    teacher: Optional[Teacher] = Relationship()

class AttendanceExtended(SQLModel, table=True):
    """Extended attendance tracking with detailed metrics"""
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key="student.id")
    teacher_id: Optional[int] = Field(default=None, foreign_key="teacher.id")
    batch_id: Optional[int] = Field(default=None, foreign_key="batch.id")
    
    # Basic attendance
    class_date: datetime
    subject: str
    is_present: bool
    is_late: bool = False
    minutes_late: Optional[int] = None
    
    # Absence categorization
    absence_type: Optional[str] = None  # regular, sick, holiday_before, holiday_after, emergency
    is_excused: bool = False
    excuse_reason: Optional[str] = None
    
    # Additional metrics
    participation_score: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    behavior_score: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    
    marked_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    remarks: Optional[str] = None
    
    # Relationships
    student: Optional[Student] = Relationship()
    teacher: Optional[Teacher] = Relationship()
    batch: Optional[Batch] = Relationship()

class SkillsAssessment(SQLModel, table=True):
    """Student skills assessment tracking"""
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key="student.id")
    teacher_id: Optional[int] = Field(default=None, foreign_key="teacher.id")
    assessment_date: datetime
    
    # Skill ratings (0-1 scale)
    communication: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    critical_thinking: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    discipline: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    study_management: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    teamwork: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    leadership: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    problem_solving: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    creativity: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    
    # Assessment context
    assessment_type: str = "general"  # general, project, presentation, group_work
    subject: Optional[str] = None
    notes: Optional[str] = None
    
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    # Relationships
    student: Optional[Student] = Relationship()
    teacher: Optional[Teacher] = Relationship()

class ExamExtended(SQLModel, table=True):
    """Extended exam tracking with quality metrics"""
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key="student.id")
    teacher_id: Optional[int] = Field(default=None, foreign_key="teacher.id")
    subject: str
    exam_date: datetime
    exam_type: str  # daily, weekly, monthly, midterm, final
    
    # Basic scoring
    max_marks: float
    marks_obtained: float
    percentage: Optional[float] = None
    grade: Optional[str] = None
    
    # Answer quality metrics (0-1 scale)
    answer_sensibility: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    completion_rate: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    unrelated_answer_rate: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    handwriting_quality: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    time_management: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    
    # Additional metrics
    time_taken_minutes: Optional[int] = None
    questions_attempted: Optional[int] = None
    questions_total: Optional[int] = None
    
    remarks: Optional[str] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    # Relationships
    student: Optional[Student] = Relationship()
    teacher: Optional[Teacher] = Relationship()

class StudentAnalytics(SQLModel, table=True):
    """Store calculated FIFA-style analytics ratings"""
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key='student.id', unique=True)
    
    # Main FIFA-style ratings (0-100 scale)
    fifa_rating: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    attendance_rating: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    homework_classwork_rating: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    exam_rating: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    skill_rating: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    
    # Detailed breakdown (stored as JSON for flexibility)
    rating_breakdown: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Performance metrics
    improvement_trend: Optional[float] = None  # positive/negative trend
    consistency_score: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    risk_level: Optional[str] = "low"  # low, medium, high
    
    # ML predictions
    predicted_rating: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    prediction_confidence: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    
    # Last calculation details
    last_calculated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    data_points_count: Optional[int] = None
    calculation_period_days: Optional[int] = 30
    
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    # Relationships
    student: Optional[Student] = Relationship()
    rating_history: List['StudentRatingHistory'] = Relationship(back_populates='analytics')
    recommendations: List['StudentRecommendation'] = Relationship(back_populates='analytics')

class StudentRatingHistory(SQLModel, table=True):
    """Track rating changes over time"""
    id: Optional[int] = Field(default=None, primary_key=True)
    analytics_id: int = Field(foreign_key='studentanalytics.id')
    student_id: int = Field(foreign_key='student.id')
    
    # Ratings snapshot
    fifa_rating: float = Field(ge=0.0, le=100.0)
    attendance_rating: float = Field(ge=0.0, le=100.0)
    homework_classwork_rating: float = Field(ge=0.0, le=100.0)
    exam_rating: float = Field(ge=0.0, le=100.0)
    skill_rating: float = Field(ge=0.0, le=100.0)
    
    # Context
    period_start: datetime
    period_end: datetime
    month: int
    year: int
    
    # Changes from previous period
    fifa_rating_change: Optional[float] = None
    attendance_change: Optional[float] = None
    homework_change: Optional[float] = None
    exam_change: Optional[float] = None
    skills_change: Optional[float] = None
    
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    # Relationships
    analytics: Optional[StudentAnalytics] = Relationship(back_populates='rating_history')
    student: Optional[Student] = Relationship()

class StudentRecommendation(SQLModel, table=True):
    """AI-generated recommendations for students"""
    id: Optional[int] = Field(default=None, primary_key=True)
    analytics_id: Optional[int] = Field(default=None, foreign_key="studentanalytics.id")
    student_id: int = Field(foreign_key='student.id')
    
    # Recommendation details
    title: str
    description: str
    category: str  # attendance, homework, exam, skills, general
    priority: str = "medium"  # low, medium, high, urgent
    
    # Implementation details
    timeline_days: Optional[int] = None
    expected_improvement: Optional[float] = None  # expected rating improvement
    action_items: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    
    # Status tracking
    status: RecommendationStatus = RecommendationStatus.ACTIVE
    assigned_date: Optional[datetime] = Field(default_factory=datetime.utcnow)
    due_date: Optional[datetime] = None
    completed_date: Optional[datetime] = None
    
    # Effectiveness tracking
    was_effective: Optional[bool] = None
    actual_improvement: Optional[float] = None
    teacher_feedback: Optional[str] = None
    student_feedback: Optional[str] = None
    
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    # Relationships
    analytics: Optional[StudentAnalytics] = Relationship(back_populates='recommendations')
    student: Optional[Student] = Relationship()

class BatchAnalytics(SQLModel, table=True):
    """Analytics for entire batches/classes"""
    id: Optional[int] = Field(default=None, primary_key=True)
    batch_id: int = Field(foreign_key='batch.id')
    
    # Batch performance metrics
    average_fifa_rating: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    average_attendance_rating: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    average_homework_rating: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    average_exam_rating: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    average_skills_rating: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    
    # Distribution metrics
    top_performers_count: Optional[int] = 0
    at_risk_students_count: Optional[int] = 0
    improving_students_count: Optional[int] = 0
    declining_students_count: Optional[int] = 0
    
    # Batch insights
    strongest_area: Optional[str] = None
    weakest_area: Optional[str] = None
    improvement_trend: Optional[float] = None
    
    # Calculation details
    calculation_date: Optional[datetime] = Field(default_factory=datetime.utcnow)
    students_included: Optional[int] = None
    
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    # Relationships
    batch: Optional[Batch] = Relationship()

class AnalyticsSettings(SQLModel, table=True):
    """Configuration settings for analytics calculation"""
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Rating weights (should sum to 1.0)
    attendance_weight: float = 0.30
    homework_classwork_weight: float = 0.30
    exam_weight: float = 0.30
    skills_weight: float = 0.10
    
    # Calculation parameters
    calculation_period_days: int = 30
    minimum_data_points: int = 5
    auto_calculate: bool = True
    calculation_frequency_hours: int = 24
    
    # Rating thresholds
    excellent_threshold: float = 90.0
    good_threshold: float = 80.0
    satisfactory_threshold: float = 70.0
    needs_improvement_threshold: float = 60.0
    
    # Recommendation settings
    generate_recommendations: bool = True
    max_recommendations_per_student: int = 5
    recommendation_refresh_days: int = 7
    
    # ML model settings
    model_retrain_frequency_days: int = 30
    prediction_enabled: bool = True
    minimum_training_data: int = 50
    
    # Active settings flag
    is_active: bool = True
    created_by: Optional[int] = Field(default=None, foreign_key='user.id')
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

# Pydantic models for API responses
class StudentAnalyticsResponse(SQLModel):
    """Response model for student analytics"""
    student_id: int
    student_name: str
    fifa_rating: float
    attendance_rating: float
    homework_classwork_rating: float
    exam_rating: float
    skill_rating: float
    rating_breakdown: Dict[str, Any]
    predicted_rating: Optional[float] = None
    prediction_confidence: Optional[float] = None
    risk_level: str
    improvement_trend: Optional[float] = None
    last_calculated_at: datetime

class BatchAnalyticsResponse(SQLModel):
    """Response model for batch analytics"""
    batch_id: int
    batch_name: str
    total_students: int
    average_fifa_rating: float
    top_performers: List[Dict[str, Any]]
    at_risk_students: List[Dict[str, Any]]
    category_averages: Dict[str, float]
    improvement_trends: Dict[str, int]
    strongest_area: str
    weakest_area: str

class RecommendationResponse(SQLModel):
    """Response model for recommendations"""
    id: int
    title: str
    description: str
    category: str
    priority: str
    timeline_days: Optional[int] = None
    expected_improvement: Optional[float] = None
    action_items: Optional[List[str]] = None
    status: str
    assigned_date: datetime
    due_date: Optional[datetime] = None