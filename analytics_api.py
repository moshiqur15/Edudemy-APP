#!/usr/bin/env python3
"""
Analytics API Endpoints
FastAPI endpoints to serve student analytics data to frontend/mobile app
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from typing import List, Optional, Dict, Any
from datetime import datetime
import json

# Database
from sqlmodel import create_engine
from backend.app.models import Student, Teacher, Batch, User
from analytics_models import StudentAnalytics, StudentRecommendation, AnalyticsSettings
from student_analytics_engine import StudentAnalyticsEngine

# Database connection
DATABASE_URL = "postgresql://postgres:1122@localhost:5432/edudemy_db"
engine = create_engine(DATABASE_URL)

# FastAPI app
app = FastAPI(
    title="Edudemy Analytics API",
    description="Student performance analytics and ML-powered insights",
    version="1.0.0"
)

# CORS middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get database session
def get_session():
    with Session(engine) as session:
        yield session

@app.get("/")
async def root():
    """API health check"""
    return {
        "message": "Edudemy Analytics API",
        "version": "1.0.0",
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/students", response_model=List[Dict[str, Any]])
async def get_students(
    skip: int = Query(0, description="Number of records to skip"),
    limit: int = Query(100, description="Maximum number of records to return"),
    class_name: Optional[str] = Query(None, description="Filter by class"),
    batch_id: Optional[int] = Query(None, description="Filter by batch ID"),
    session: Session = Depends(get_session)
):
    """Get list of students with basic information"""
    
    query = select(Student)
    
    if class_name:
        query = query.where(Student.class_name == class_name)
    if batch_id:
        query = query.where(Student.batch_id == batch_id)
    
    query = query.offset(skip).limit(limit)
    students = session.exec(query).all()
    
    # Convert to response format
    result = []
    for student in students:
        result.append({
            "id": student.id,
            "full_name": student.full_name,
            "student_reg_number": student.student_reg_number,
            "class_name": student.class_name,
            "batch_id": student.batch_id,
            "gender": student.gender,
            "admission_date": student.admission_date.isoformat() if student.admission_date else None
        })
    
    return result
        "name": "Alex Johnson",
        "class": "10th Grade",
        "timestamp": "2024-01-15T10:30:00",
        "ratings": {
            "attendance_rating": 85.2,
            "homework_classwork_rating": 78.5,
            "exam_rating": 82.3,
            "skill_rating": 75.8,
            "fifa_rating": 80.4,
            "breakdown": {
                "attendance": {
                    "regular_attendance": 88.0,
                    "holiday_attendance": 82.0,
                    "sick_days": 85.0,
                    "presence_ratio": 87.0,
                    "punctuality": 85.0
                },
                "homework_classwork": {
                    "hw_submission": 85.0,
                    "hw_quality": 72.0,
                    "cw_submission": 78.0,
                    "cw_quality": 79.0
                },
                "exams": {
                    "average_marks": 82.0,
                    "answer_quality": 85.0,
                    "completion": 80.0,
                    "relevance": 82.0
                },
                "skills": {
                    "communication": 78.0,
                    "critical_thinking": 75.0,
                    "discipline": 76.0,
                    "study_management": 75.0
                }
            }
        },
        "predicted_rating": 81.2,
        "recommendations": [
            "📚 Strengthen homework completion and class participation",
            "🧠 Work on communication and study management skills",
            "💭 Engage in more analytical discussions and problem-solving exercises"
        ],
        "subject_marks": {
            "math": 85,
            "english": 78,
            "science": 88
        },
        "attendance_stats": {
            "presence_ratio": 0.92,
            "total_absences": 4,
            "late_count": 3
        },
        "progress_history": [
            {"month": "Sep", "rating": 75.2},
            {"month": "Oct", "rating": 77.8},
            {"month": "Nov", "rating": 79.1},
            {"month": "Dec", "rating": 80.4}
        ]
    },
    "S002": {
        "student_id": "S002",
        "name": "Emma Smith",
        "class": "10th Grade",
        "timestamp": "2024-01-15T10:30:00",
        "ratings": {
            "attendance_rating": 92.5,
            "homework_classwork_rating": 88.2,
            "exam_rating": 90.1,
            "skill_rating": 85.3,
            "fifa_rating": 89.8,
            "breakdown": {
                "attendance": {
                    "regular_attendance": 95.0,
                    "holiday_attendance": 90.0,
                    "sick_days": 92.0,
                    "presence_ratio": 93.0,
                    "punctuality": 92.5
                },
                "homework_classwork": {
                    "hw_submission": 92.0,
                    "hw_quality": 85.0,
                    "cw_submission": 88.0,
                    "cw_quality": 88.0
                },
                "exams": {
                    "average_marks": 90.0,
                    "answer_quality": 92.0,
                    "completion": 89.0,
                    "relevance": 90.0
                },
                "skills": {
                    "communication": 88.0,
                    "critical_thinking": 85.0,
                    "discipline": 86.0,
                    "study_management": 82.0
                }
            }
        },
        "predicted_rating": 90.5,
        "recommendations": [
            "🎯 Continue excellent performance across all areas",
            "📈 Consider taking on leadership roles in group projects"
        ],
        "subject_marks": {
            "math": 92,
            "english": 88,
            "science": 90
        },
        "attendance_stats": {
            "presence_ratio": 0.98,
            "total_absences": 1,
            "late_count": 0
        },
        "progress_history": [
            {"month": "Sep", "rating": 85.2},
            {"month": "Oct", "rating": 87.1},
            {"month": "Nov", "rating": 88.9},
            {"month": "Dec", "rating": 89.8}
        ]
    }
}

@app.route('/api/analytics/student/<student_id>', methods=['GET'])
def get_student_analytics(student_id):
    """Get comprehensive analytics for a specific student"""
    try:
        if student_id in SAMPLE_ANALYTICS_DATA:
            return jsonify({
                "success": True,
                "data": SAMPLE_ANALYTICS_DATA[student_id]
            })
        else:
            return jsonify({
                "success": False,
                "error": "Student not found"
            }), 404
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/analytics/class/<class_id>/overview', methods=['GET'])
def get_class_overview(class_id):
    """Get class-wide analytics overview"""
    try:
        # Generate mock class data
        class_stats = {
            "class_id": class_id,
            "total_students": 25,
            "average_rating": 78.5,
            "top_performers": [
                {"id": "S002", "name": "Emma Smith", "rating": 89.8},
                {"id": "S003", "name": "Michael Chen", "rating": 87.2},
                {"id": "S001", "name": "Alex Johnson", "rating": 80.4}
            ],
            "needs_attention": [
                {"id": "S015", "name": "Sarah Wilson", "rating": 65.2},
                {"id": "S022", "name": "David Brown", "rating": 68.1}
            ],
            "category_averages": {
                "attendance": 82.3,
                "homework_classwork": 76.8,
                "exams": 79.2,
                "skills": 74.5
            },
            "improvement_trends": {
                "improving": 15,
                "stable": 7,
                "declining": 3
            }
        }
        
        return jsonify({
            "success": True,
            "data": class_stats
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/analytics/predict', methods=['POST'])
def predict_student_performance():
    """Predict student performance based on current data"""
    try:
        data = request.get_json()
        student_id = data.get('student_id')
        
        # Mock prediction logic
        predicted_rating = random.uniform(70, 95)
        confidence = random.uniform(0.75, 0.95)
        
        return jsonify({
            "success": True,
            "data": {
                "student_id": student_id,
                "predicted_rating": round(predicted_rating, 2),
                "confidence": round(confidence, 3),
                "factors": [
                    {"factor": "Recent improvement in attendance", "impact": "+3.5"},
                    {"factor": "Consistent homework submission", "impact": "+2.1"},
                    {"factor": "Need to improve exam completion time", "impact": "-1.2"}
                ]
            }
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/analytics/recommendations/<student_id>', methods=['GET'])
def get_student_recommendations(student_id):
    """Get personalized recommendations for a student"""
    try:
        if student_id in SAMPLE_ANALYTICS_DATA:
            student_data = SAMPLE_ANALYTICS_DATA[student_id]
            return jsonify({
                "success": True,
                "data": {
                    "student_id": student_id,
                    "recommendations": student_data["recommendations"],
                    "action_plan": [
                        {
                            "priority": "High",
                            "action": "Set up daily homework schedule",
                            "timeline": "1 week",
                            "expected_impact": "+5 points in homework rating"
                        },
                        {
                            "priority": "Medium",
                            "action": "Join study group for critical thinking",
                            "timeline": "2 weeks",
                            "expected_impact": "+3 points in skills rating"
                        }
                    ]
                }
            })
        else:
            return jsonify({
                "success": False,
                "error": "Student not found"
            }), 404
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/analytics/dashboard', methods=['GET'])
def get_dashboard_data():
    """Get overall dashboard statistics"""
    try:
        dashboard_data = {
            "total_students": 150,
            "average_class_rating": 78.5,
            "students_improving": 92,
            "students_at_risk": 12,
            "recent_insights": [
                "📈 Overall class performance improved by 3.2% this month",
                "🎯 85% of students are meeting homework submission targets",
                "⚠️ 12 students need additional support in exam preparation",
                "🌟 Top 3 classes are showing consistent improvement trends"
            ],
            "category_trends": {
                "attendance": {"current": 82.3, "change": "+2.1%"},
                "homework": {"current": 76.8, "change": "+1.8%"},
                "exams": {"current": 79.2, "change": "+0.5%"},
                "skills": {"current": 74.5, "change": "+3.2%"}
            }
        }
        
        return jsonify({
            "success": True,
            "data": dashboard_data
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)