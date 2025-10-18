#!/usr/bin/env python3
"""
Analytics API Endpoints - FastAPI Implementation
Serves student analytics data to frontend/mobile app
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from typing import List, Optional, Dict, Any
from datetime import datetime

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

# CORS middleware
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

# API Endpoints

@app.get("/")
async def root():
    """API health check"""
    return {
        "message": "Edudemy Analytics API",
        "version": "1.0.0",
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/students")
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

@app.get("/students/{student_id}/analytics")
async def get_student_analytics(
    student_id: int,
    recalculate: bool = Query(False, description="Force recalculation of analytics"),
    session: Session = Depends(get_session)
):
    """Get detailed analytics for a specific student"""
    
    # Verify student exists
    student = session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Check if we have existing analytics
    existing_analytics = session.exec(
        select(StudentAnalytics).where(StudentAnalytics.student_id == student_id)
    ).first()
    
    if not existing_analytics or recalculate:
        # Calculate new analytics
        analytics_engine = StudentAnalyticsEngine(session)
        analytics_result = analytics_engine.calculate_student_analytics(student_id)
        analytics_engine.save_analytics_to_database(analytics_result)
        
        # Get the fresh analytics
        existing_analytics = session.exec(
            select(StudentAnalytics).where(StudentAnalytics.student_id == student_id)
        ).first()
    
    if not existing_analytics:
        raise HTTPException(status_code=500, detail="Failed to generate analytics")
    
    # Get recommendations
    recommendations = session.exec(
        select(StudentRecommendation).where(StudentRecommendation.student_id == student_id)
    ).all()
    
    return {
        "student_id": student_id,
        "student_name": student.full_name,
        "class_name": student.class_name,
        "fifa_rating": existing_analytics.fifa_rating,
        "attendance_rating": existing_analytics.attendance_rating,
        "homework_classwork_rating": existing_analytics.homework_classwork_rating,
        "exam_rating": existing_analytics.exam_rating,
        "skill_rating": existing_analytics.skill_rating,
        "risk_level": existing_analytics.risk_level,
        "improvement_trend": existing_analytics.improvement_trend,
        "predicted_rating": existing_analytics.predicted_rating,
        "prediction_confidence": existing_analytics.prediction_confidence,
        "rating_breakdown": existing_analytics.rating_breakdown,
        "last_calculated_at": existing_analytics.last_calculated_at.isoformat() if existing_analytics.last_calculated_at else None,
        "recommendations": [
            {
                "id": rec.id,
                "title": rec.title,
                "description": rec.description,
                "category": rec.category,
                "priority": rec.priority,
                "timeline_days": rec.timeline_days,
                "expected_improvement": rec.expected_improvement,
                "action_items": rec.action_items,
                "status": rec.status,
                "due_date": rec.due_date.isoformat() if rec.due_date else None
            }
            for rec in recommendations
        ]
    }

@app.get("/batches")
async def get_batches(session: Session = Depends(get_session)):
    """Get list of all batches"""
    
    batches = session.exec(select(Batch)).all()
    
    result = []
    for batch in batches:
        result.append({
            "id": batch.id,
            "name": batch.name,
            "code": batch.code,
            "class_name": batch.class_name,
            "current_students_count": batch.current_students_count,
            "max_students": batch.max_students,
            "status": batch.status
        })
    
    return result

@app.get("/batches/{batch_id}/analytics")
async def get_batch_analytics(
    batch_id: int,
    session: Session = Depends(get_session)
):
    """Get analytics for an entire batch"""
    
    # Verify batch exists
    batch = session.get(Batch, batch_id)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    # Calculate batch analytics
    analytics_engine = StudentAnalyticsEngine(session)
    
    try:
        batch_analytics = analytics_engine.calculate_batch_analytics(batch_id)
        return batch_analytics
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating batch analytics: {str(e)}")

@app.get("/analytics/dashboard")
async def get_dashboard_data(session: Session = Depends(get_session)):
    """Get dashboard overview data"""
    
    # Get basic counts
    total_students = session.exec(select(Student)).all()
    total_batches = session.exec(select(Batch)).all()
    
    # Get analytics overview
    analytics_records = session.exec(select(StudentAnalytics)).all()
    
    # Calculate summary statistics
    if analytics_records:
        ratings = [a.fifa_rating for a in analytics_records if a.fifa_rating]
        avg_rating = sum(ratings) / len(ratings) if ratings else 0
        
        risk_levels = [a.risk_level for a in analytics_records if a.risk_level]
        risk_distribution = {
            "low": len([r for r in risk_levels if r == "low"]),
            "medium": len([r for r in risk_levels if r == "medium"]),
            "high": len([r for r in risk_levels if r == "high"])
        }
    else:
        avg_rating = 0
        risk_distribution = {"low": 0, "medium": 0, "high": 0}
    
    return {
        "overview": {
            "total_students": len(total_students),
            "total_batches": len(total_batches),
            "analytics_calculated": len(analytics_records),
            "average_fifa_rating": round(avg_rating, 1)
        },
        "risk_distribution": risk_distribution,
        "recent_students": [
            {
                "id": s.id,
                "name": s.full_name,
                "class_name": s.class_name,
                "admission_date": s.admission_date.isoformat() if s.admission_date else None
            }
            for s in total_students[:10]  # Last 10 students
        ]
    }

@app.post("/students/{student_id}/analytics/recalculate")
async def recalculate_student_analytics(
    student_id: int,
    session: Session = Depends(get_session)
):
    """Force recalculation of student analytics"""
    
    student = session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    try:
        analytics_engine = StudentAnalyticsEngine(session)
        analytics_result = analytics_engine.calculate_student_analytics(student_id)
        analytics_engine.save_analytics_to_database(analytics_result)
        
        return {
            "message": "Analytics recalculated successfully",
            "student_id": student_id,
            "fifa_rating": analytics_result["ratings"]["fifa_rating"],
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error recalculating analytics: {str(e)}")

@app.get("/analytics/settings")
async def get_analytics_settings(session: Session = Depends(get_session)):
    """Get current analytics settings"""
    
    settings = session.exec(
        select(AnalyticsSettings).where(AnalyticsSettings.is_active == True)
    ).first()
    
    if not settings:
        raise HTTPException(status_code=404, detail="No active analytics settings found")
    
    return {
        "id": settings.id,
        "attendance_weight": settings.attendance_weight,
        "homework_classwork_weight": settings.homework_classwork_weight,
        "exam_weight": settings.exam_weight,
        "skills_weight": settings.skills_weight,
        "calculation_period_days": settings.calculation_period_days,
        "excellent_threshold": settings.excellent_threshold,
        "good_threshold": settings.good_threshold,
        "satisfactory_threshold": settings.satisfactory_threshold,
        "needs_improvement_threshold": settings.needs_improvement_threshold,
        "generate_recommendations": settings.generate_recommendations,
        "max_recommendations_per_student": settings.max_recommendations_per_student,
        "prediction_enabled": settings.prediction_enabled,
        "minimum_training_data": settings.minimum_training_data
    }

@app.get("/analytics/train-model")
async def train_ml_model(session: Session = Depends(get_session)):
    """Train the ML model with current data"""
    
    try:
        analytics_engine = StudentAnalyticsEngine(session)
        model_stats = analytics_engine.train_ml_model()
        
        if model_stats:
            return {
                "message": "Model trained successfully",
                "r2_score": model_stats["r2_score"],
                "mse": model_stats["mse"],
                "training_samples": model_stats["training_samples"],
                "feature_importance": model_stats["feature_importance"]
            }
        else:
            return {
                "message": "Model training skipped - insufficient data",
                "minimum_required": 50
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error training model: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Edudemy Analytics API Server...")
    print("📊 API Documentation: http://localhost:8001/docs")
    print("🔍 API Health Check: http://localhost:8001/")
    try:
        uvicorn.run("analytics_fastapi:app", host="0.0.0.0", port=8001, reload=True)
    except KeyboardInterrupt:
        print("\n✅ Server stopped gracefully")
