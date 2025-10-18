#!/usr/bin/env python3
"""
Student Analytics Engine - Database Integrated Version
FIFA-style student performance analytics with machine learning predictions
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

import numpy as np
import pandas as pd
from sqlmodel import create_engine, Session, select, and_, func
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import json
import warnings
import random
warnings.filterwarnings('ignore')

# Database connection
DATABASE_URL = "postgresql://postgres:1122@localhost:5432/edudemy_db"
engine = create_engine(DATABASE_URL)

# Import models
from backend.app.models import Student, Teacher, Batch
from analytics_models import (
    HomeworkSubmission, ClassworkSubmission, AttendanceExtended,
    SkillsAssessment, ExamExtended, StudentAnalytics, 
    StudentRatingHistory, StudentRecommendation, BatchAnalytics,
    AnalyticsSettings, RecommendationStatus
)

class StudentAnalyticsEngine:
    def __init__(self, session: Session):
        self.session = session
        self.settings = self._load_settings()
        
        # Load ML model if sklearn is available
        try:
            from sklearn.ensemble import RandomForestRegressor
            from sklearn.model_selection import train_test_split
            from sklearn.metrics import mean_squared_error, r2_score
            self.sklearn_available = True
            self.RandomForestRegressor = RandomForestRegressor
            self.train_test_split = train_test_split
            self.mean_squared_error = mean_squared_error
            self.r2_score = r2_score
        except ImportError:
            self.sklearn_available = False
            print("⚠️ scikit-learn not available. ML predictions disabled.")
        
        self.model = None
        self.feature_names = [
            'presence_ratio', 'hw_submission', 'hw_quality',
            'cw_submission', 'cw_quality',
            'marks_math', 'marks_english', 'marks_science',
            'communication', 'critical_thinking',
            'discipline', 'study_mgmt'
        ]
    
    def _load_settings(self) -> AnalyticsSettings:
        """Load analytics settings from database"""
        settings = self.session.exec(
            select(AnalyticsSettings).where(AnalyticsSettings.is_active == True)
        ).first()
        
        if not settings:
            # Create default settings if none exist
            settings = AnalyticsSettings(
                attendance_weight=0.30,
                homework_classwork_weight=0.30,
                exam_weight=0.30,
                skills_weight=0.10,
                is_active=True
            )
            self.session.add(settings)
            self.session.commit()
            self.session.refresh(settings)
        
        return settings
    
    def normalize(self, val: float, vmin: float, vmax: float) -> float:
        """Normalize to 1–100 range"""
        return np.clip(1 + 99 * (val - vmin) / (vmax - vmin + 1e-6), 1, 100)
    
    def get_student_data(self, student_id: int, days: int = 30) -> Dict[str, Any]:
        """Fetch comprehensive student data from database"""
        cutoff_date = datetime.now() - timedelta(days=days)
        
        # Basic student info
        student = self.session.exec(select(Student).where(Student.id == student_id)).first()
        if not student:
            raise ValueError(f"Student with ID {student_id} not found")
        
        data = {
            'student_id': student.id,
            'student_name': student.full_name,
            'class_name': student.class_name,
            'batch_id': student.batch_id
        }
        
        # Attendance data
        attendance_records = self.session.exec(
            select(AttendanceExtended)
            .where(
                and_(
                    AttendanceExtended.student_id == student_id,
                    AttendanceExtended.class_date >= cutoff_date
                )
            )
        ).all()
        
        if attendance_records:
            total_classes = len(attendance_records)
            present_count = sum(1 for a in attendance_records if a.is_present)
            late_count = sum(1 for a in attendance_records if a.is_late)
            
            # Categorize absences
            regular_absences = sum(1 for a in attendance_records 
                                 if not a.is_present and a.absence_type == 'regular')
            sick_absences = sum(1 for a in attendance_records 
                              if not a.is_present and a.absence_type == 'sick')
            holiday_before = sum(1 for a in attendance_records 
                               if not a.is_present and a.absence_type == 'holiday_before')
            holiday_after = sum(1 for a in attendance_records 
                              if not a.is_present and a.absence_type == 'holiday_after')
            
            data.update({
                'total_classes': total_classes,
                'present_count': present_count,
                'absence_regular': regular_absences,
                'absence_before_holiday': holiday_before,
                'absence_after_holiday': holiday_after,
                'absence_sick': sick_absences,
                'late_count': late_count,
                'presence_ratio': present_count / total_classes if total_classes > 0 else 0,
                'late_ratio': late_count / total_classes if total_classes > 0 else 0,
            })
        else:
            # Default values if no attendance data
            data.update({
                'total_classes': 0, 'present_count': 0, 'absence_regular': 0,
                'absence_before_holiday': 0, 'absence_after_holiday': 0,
                'absence_sick': 0, 'late_count': 0,
                'presence_ratio': 0.8, 'late_ratio': 0.1
            })
        
        # Homework data
        homework_records = self.session.exec(
            select(HomeworkSubmission)
            .where(
                and_(
                    HomeworkSubmission.student_id == student_id,
                    HomeworkSubmission.assigned_date >= cutoff_date
                )
            )
        ).all()
        
        if homework_records:
            total_hw = len(homework_records)
            submitted_hw = sum(1 for hw in homework_records if hw.is_submitted)
            avg_quality = np.mean([hw.submission_quality or 0 for hw in homework_records])
            
            data.update({
                'hw_submission': submitted_hw / total_hw if total_hw > 0 else 0.8,
                'hw_quality': avg_quality
            })
        else:
            data.update({'hw_submission': 0.8, 'hw_quality': 0.7})
        
        # Classwork data
        classwork_records = self.session.exec(
            select(ClassworkSubmission)
            .where(
                and_(
                    ClassworkSubmission.student_id == student_id,
                    ClassworkSubmission.class_date >= cutoff_date
                )
            )
        ).all()
        
        if classwork_records:
            avg_cw_submission = np.mean([cw.submission_quality or 0 for cw in classwork_records])
            avg_cw_quality = np.mean([cw.understanding_level or 0 for cw in classwork_records])
            
            data.update({
                'cw_submission': avg_cw_submission,
                'cw_quality': avg_cw_quality
            })
        else:
            data.update({'cw_submission': 0.8, 'cw_quality': 0.7})
        
        # Exam data
        exam_records = self.session.exec(
            select(ExamExtended)
            .where(
                and_(
                    ExamExtended.student_id == student_id,
                    ExamExtended.exam_date >= cutoff_date
                )
            )
        ).all()
        
        if exam_records:
            # Group by subject to get average marks
            subject_marks = {}
            for exam in exam_records:
                if exam.subject not in subject_marks:
                    subject_marks[exam.subject] = []
                percentage = exam.percentage or ((exam.marks_obtained / exam.max_marks) * 100)
                subject_marks[exam.subject].append(percentage)
            
            # Calculate average marks per subject
            marks_math = np.mean(subject_marks.get('Mathematics', [75]))
            marks_english = np.mean(subject_marks.get('English', [70]))
            marks_science = np.mean(subject_marks.get('Physics', [75]) + 
                                   subject_marks.get('Chemistry', [75]) +
                                   subject_marks.get('Biology', [75]))
            
            # Answer quality metrics
            avg_sensibility = np.mean([e.answer_sensibility or 0.8 for e in exam_records])
            avg_completion = np.mean([e.completion_rate or 0.8 for e in exam_records])
            avg_unrelated = np.mean([e.unrelated_answer_rate or 0.1 for e in exam_records])
            
            data.update({
                'marks_math': marks_math,
                'marks_english': marks_english,
                'marks_science': marks_science,
                'answer_sensibility': avg_sensibility,
                'completion_rate': avg_completion,
                'unrelated_answer': avg_unrelated
            })
        else:
            data.update({
                'marks_math': 75, 'marks_english': 70, 'marks_science': 75,
                'answer_sensibility': 0.8, 'completion_rate': 0.8, 'unrelated_answer': 0.1
            })
        
        # Skills data
        skills_records = self.session.exec(
            select(SkillsAssessment)
            .where(
                and_(
                    SkillsAssessment.student_id == student_id,
                    SkillsAssessment.assessment_date >= cutoff_date
                )
            )
        ).all()
        
        if skills_records:
            avg_communication = np.mean([s.communication or 0.7 for s in skills_records])
            avg_critical_thinking = np.mean([s.critical_thinking or 0.7 for s in skills_records])
            avg_discipline = np.mean([s.discipline or 0.8 for s in skills_records])
            avg_study_mgmt = np.mean([s.study_management or 0.7 for s in skills_records])
            
            data.update({
                'communication': avg_communication,
                'critical_thinking': avg_critical_thinking,
                'discipline': avg_discipline,
                'study_mgmt': avg_study_mgmt
            })
        else:
            data.update({
                'communication': 0.7, 'critical_thinking': 0.7,
                'discipline': 0.8, 'study_mgmt': 0.7
            })
        
        return data
    
    def calculate_ratings(self, student_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate FIFA-style ratings for a student"""
        # Attendance Sub-sectors
        r_att_regular = self.normalize(10 - student_data.get('absence_regular', 0), 0, 10)
        r_att_holiday = self.normalize(5 - (student_data.get('absence_before_holiday', 0) + 
                                           student_data.get('absence_after_holiday', 0)), 0, 5)
        r_att_sick = self.normalize(4 - student_data.get('absence_sick', 0), 0, 4)
        r_presence_ratio = self.normalize(student_data.get('presence_ratio', 0.8), 0.7, 1.0)
        r_late = self.normalize(1 - student_data.get('late_ratio', 0.1), 0, 1)
        
        attendance_rating = np.mean([r_att_regular, r_att_holiday, r_att_sick, r_presence_ratio, r_late])

        # Homework/Classwork Sub-sectors
        r_hw_sub = self.normalize(student_data.get('hw_submission', 0.8), 0.5, 1.0)
        r_hw_qual = self.normalize(student_data.get('hw_quality', 0.7), 0.5, 1.0)
        r_cw_sub = self.normalize(student_data.get('cw_submission', 0.8), 0.5, 1.0)
        r_cw_qual = self.normalize(student_data.get('cw_quality', 0.7), 0.5, 1.0)
        hw_cw_rating = np.mean([r_hw_sub, r_hw_qual, r_cw_sub, r_cw_qual])

        # Exam Sub-sectors
        avg_marks = np.mean([
            student_data.get('marks_math', 70),
            student_data.get('marks_english', 70),
            student_data.get('marks_science', 70)
        ])
        r_marks = self.normalize(avg_marks, 40, 100)
        r_sensibility = self.normalize(student_data.get('answer_sensibility', 0.8), 0.5, 1.0)
        r_completion = self.normalize(student_data.get('completion_rate', 0.8), 0.6, 1.0)
        r_unrelated = self.normalize(1 - student_data.get('unrelated_answer', 0.1), 0, 1)
        exam_rating = np.mean([r_marks, r_sensibility, r_completion, r_unrelated])

        # Skill Sub-sectors
        r_comm = self.normalize(student_data.get('communication', 0.7), 0.5, 1.0)
        r_ct = self.normalize(student_data.get('critical_thinking', 0.7), 0.5, 1.0)
        r_discipline = self.normalize(student_data.get('discipline', 0.8), 0.5, 1.0)
        r_study = self.normalize(student_data.get('study_mgmt', 0.7), 0.5, 1.0)
        skill_rating = np.mean([r_comm, r_ct, r_discipline, r_study])

        # Final FIFA-like Rating (weighted average)
        final_rating = (
            self.settings.attendance_weight * attendance_rating +
            self.settings.homework_classwork_weight * hw_cw_rating +
            self.settings.exam_weight * exam_rating +
            self.settings.skills_weight * skill_rating
        )

        # Detailed breakdown
        breakdown = {
            'attendance': {
                'regular_attendance': round(r_att_regular, 2),
                'holiday_attendance': round(r_att_holiday, 2),
                'sick_days': round(r_att_sick, 2),
                'presence_ratio': round(r_presence_ratio, 2),
                'punctuality': round(r_late, 2)
            },
            'homework_classwork': {
                'hw_submission': round(r_hw_sub, 2),
                'hw_quality': round(r_hw_qual, 2),
                'cw_submission': round(r_cw_sub, 2),
                'cw_quality': round(r_cw_qual, 2)
            },
            'exams': {
                'average_marks': round(r_marks, 2),
                'answer_quality': round(r_sensibility, 2),
                'completion': round(r_completion, 2),
                'relevance': round(r_unrelated, 2)
            },
            'skills': {
                'communication': round(r_comm, 2),
                'critical_thinking': round(r_ct, 2),
                'discipline': round(r_discipline, 2),
                'study_management': round(r_study, 2)
            }
        }

        return {
            'attendance_rating': round(attendance_rating, 2),
            'homework_classwork_rating': round(hw_cw_rating, 2),
            'exam_rating': round(exam_rating, 2),
            'skill_rating': round(skill_rating, 2),
            'fifa_rating': round(final_rating, 2),
            'breakdown': breakdown
        }
    
    def generate_recommendations(self, student_id: int, ratings: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate personalized recommendations based on ratings"""
        recommendations = []
        
        # Clear existing active recommendations
        self.session.exec(
            select(StudentRecommendation)
            .where(
                and_(
                    StudentRecommendation.student_id == student_id,
                    StudentRecommendation.status == RecommendationStatus.ACTIVE
                )
            )
        )
        
        # Generate new recommendations
        if ratings['attendance_rating'] < self.settings.needs_improvement_threshold:
            recommendations.append({
                'title': 'Improve Attendance Habits',
                'description': '🎯 Focus on improving attendance habits and punctuality',
                'category': 'attendance',
                'priority': 'high',
                'timeline_days': 14,
                'expected_improvement': 5.0,
                'action_items': [
                    'Set multiple alarms for morning classes',
                    'Plan to arrive 10 minutes early',
                    'Track attendance daily',
                    'Discuss any issues with teachers'
                ]
            })
        
        if ratings['homework_classwork_rating'] < self.settings.needs_improvement_threshold:
            recommendations.append({
                'title': 'Strengthen Academic Participation',
                'description': '📚 Strengthen homework completion and class participation',
                'category': 'homework',
                'priority': 'high',
                'timeline_days': 21,
                'expected_improvement': 7.0,
                'action_items': [
                    'Create daily homework tracking sheet',
                    'Set study reminders',
                    'Form study groups',
                    'Ask questions actively in class'
                ]
            })
        
        if ratings['exam_rating'] < self.settings.needs_improvement_threshold:
            recommendations.append({
                'title': 'Enhance Exam Performance',
                'description': '📝 Practice more exam techniques and time management',
                'category': 'exam',
                'priority': 'high',
                'timeline_days': 30,
                'expected_improvement': 6.0,
                'action_items': [
                    'Practice timed mock exams',
                    'Work on answer quality',
                    'Improve handwriting speed',
                    'Focus on completing all questions'
                ]
            })
        
        if ratings['skill_rating'] < self.settings.needs_improvement_threshold:
            recommendations.append({
                'title': 'Develop Soft Skills',
                'description': '🧠 Work on communication and study management skills',
                'category': 'skills',
                'priority': 'medium',
                'timeline_days': 45,
                'expected_improvement': 4.0,
                'action_items': [
                    'Join debate or discussion groups',
                    'Practice public speaking',
                    'Develop time management skills',
                    'Work on critical thinking exercises'
                ]
            })
        
        # Specific recommendations based on breakdown
        breakdown = ratings['breakdown']
        
        if breakdown['attendance']['punctuality'] < 50:
            recommendations.append({
                'title': 'Improve Punctuality',
                'description': '⏰ Set multiple alarms and plan to arrive 10 minutes early',
                'category': 'attendance',
                'priority': 'medium',
                'timeline_days': 7,
                'expected_improvement': 3.0,
                'action_items': [
                    'Set 3 alarms 15 minutes apart',
                    'Prepare clothes and bag night before',
                    'Leave home 15 minutes earlier'
                ]
            })
        
        if breakdown['homework_classwork']['hw_submission'] < 50:
            recommendations.append({
                'title': 'Homework Management System',
                'description': '📅 Create a homework tracking system and set daily reminders',
                'category': 'homework',
                'priority': 'high',
                'timeline_days': 10,
                'expected_improvement': 8.0,
                'action_items': [
                    'Use a homework planner',
                    'Set daily study schedule',
                    'Break large assignments into smaller tasks',
                    'Reward yourself for completion'
                ]
            })
        
        return recommendations[:self.settings.max_recommendations_per_student]
    
    def calculate_student_analytics(self, student_id: int) -> Dict[str, Any]:
        """Calculate comprehensive analytics for a student"""
        # Get student data
        student_data = self.get_student_data(student_id, self.settings.calculation_period_days)
        
        # Calculate ratings
        ratings = self.calculate_ratings(student_data)
        
        # Determine risk level
        fifa_rating = ratings['fifa_rating']
        if fifa_rating >= self.settings.excellent_threshold:
            risk_level = 'low'
        elif fifa_rating >= self.settings.good_threshold:
            risk_level = 'low'
        elif fifa_rating >= self.settings.satisfactory_threshold:
            risk_level = 'medium'
        else:
            risk_level = 'high'
        
        # Calculate improvement trend (simplified)
        improvement_trend = random.uniform(-2.0, 3.0)  # Placeholder for now
        
        # Generate recommendations
        recommendations = self.generate_recommendations(student_id, ratings)
        
        # ML Prediction (if available)
        predicted_rating = None
        prediction_confidence = None
        
        if self.sklearn_available and self.model is not None:
            try:
                # Prepare features for prediction
                features = [
                    student_data.get('presence_ratio', 0.8),
                    student_data.get('hw_submission', 0.8),
                    student_data.get('hw_quality', 0.7),
                    student_data.get('cw_submission', 0.8),
                    student_data.get('cw_quality', 0.7),
                    student_data.get('marks_math', 70),
                    student_data.get('marks_english', 70),
                    student_data.get('marks_science', 70),
                    student_data.get('communication', 0.7),
                    student_data.get('critical_thinking', 0.7),
                    student_data.get('discipline', 0.8),
                    student_data.get('study_mgmt', 0.7)
                ]
                
                predicted_rating = self.model.predict([features])[0]
                prediction_confidence = 0.85  # Placeholder confidence score
                
            except Exception as e:
                print(f"⚠️ Prediction failed: {e}")
        
        return {
            'student_id': student_id,
            'student_name': student_data['student_name'],
            'class_name': student_data['class_name'],
            'ratings': ratings,
            'predicted_rating': predicted_rating,
            'prediction_confidence': prediction_confidence,
            'risk_level': risk_level,
            'improvement_trend': improvement_trend,
            'recommendations': recommendations,
            'subject_marks': {
                'math': student_data.get('marks_math', 70),
                'english': student_data.get('marks_english', 70),
                'science': student_data.get('marks_science', 70)
            },
            'attendance_stats': {
                'presence_ratio': student_data.get('presence_ratio', 0.8),
                'total_absences': student_data.get('absence_regular', 0) + 
                               student_data.get('absence_sick', 0),
                'late_count': student_data.get('late_count', 0)
            }
        }
    
    def save_analytics_to_database(self, analytics_result: Dict[str, Any]):
        """Save calculated analytics to database"""
        student_id = analytics_result['student_id']
        
        # Check if analytics record exists
        existing = self.session.exec(
            select(StudentAnalytics).where(StudentAnalytics.student_id == student_id)
        ).first()
        
        ratings = analytics_result['ratings']
        
        if existing:
            # Update existing record
            existing.fifa_rating = float(ratings['fifa_rating'])
            existing.attendance_rating = float(ratings['attendance_rating'])
            existing.homework_classwork_rating = float(ratings['homework_classwork_rating'])
            existing.exam_rating = float(ratings['exam_rating'])
            existing.skill_rating = float(ratings['skill_rating'])
            existing.rating_breakdown = ratings['breakdown']
            existing.improvement_trend = float(analytics_result.get('improvement_trend', 0.0))
            existing.risk_level = analytics_result['risk_level']
            existing.predicted_rating = float(analytics_result.get('predicted_rating')) if analytics_result.get('predicted_rating') else None
            existing.prediction_confidence = float(analytics_result.get('prediction_confidence')) if analytics_result.get('prediction_confidence') else None
            existing.last_calculated_at = datetime.now()
            existing.updated_at = datetime.now()
            
        else:
            # Create new record
            existing = StudentAnalytics(
                student_id=student_id,
                fifa_rating=float(ratings['fifa_rating']),
                attendance_rating=float(ratings['attendance_rating']),
                homework_classwork_rating=float(ratings['homework_classwork_rating']),
                exam_rating=float(ratings['exam_rating']),
                skill_rating=float(ratings['skill_rating']),
                rating_breakdown=ratings['breakdown'],
                improvement_trend=float(analytics_result.get('improvement_trend', 0.0)),
                risk_level=analytics_result['risk_level'],
                predicted_rating=float(analytics_result.get('predicted_rating')) if analytics_result.get('predicted_rating') else None,
                prediction_confidence=float(analytics_result.get('prediction_confidence')) if analytics_result.get('prediction_confidence') else None,
                last_calculated_at=datetime.now()
            )
            self.session.add(existing)
        
        # Save recommendations
        for rec in analytics_result.get('recommendations', []):
            recommendation = StudentRecommendation(
                analytics_id=existing.id if existing.id else None,
                student_id=student_id,
                title=rec['title'],
                description=rec['description'],
                category=rec['category'],
                priority=rec['priority'],
                timeline_days=rec.get('timeline_days'),
                expected_improvement=rec.get('expected_improvement'),
                action_items=rec.get('action_items'),
                status=RecommendationStatus.ACTIVE,
                due_date=datetime.now() + timedelta(days=rec.get('timeline_days', 30))
            )
            self.session.add(recommendation)
        
        self.session.commit()
        if not existing.id:
            self.session.refresh(existing)
        
        return existing
    
    def train_ml_model(self):
        """Train ML model with current student data"""
        if not self.sklearn_available:
            print("⚠️ Cannot train ML model: scikit-learn not available")
            return None
            
        print("🤖 Training ML model...")
        
        # Get all students with analytics data
        students = self.session.exec(select(Student)).all()
        
        if len(students) < self.settings.minimum_training_data:
            print(f"⚠️ Not enough data for training. Need {self.settings.minimum_training_data}, have {len(students)}")
            return None
        
        # Prepare training data
        X_data = []
        y_data = []
        
        for student in students:
            try:
                student_data = self.get_student_data(student.id)
                ratings = self.calculate_ratings(student_data)
                
                features = [
                    student_data.get('presence_ratio', 0.8),
                    student_data.get('hw_submission', 0.8),
                    student_data.get('hw_quality', 0.7),
                    student_data.get('cw_submission', 0.8),
                    student_data.get('cw_quality', 0.7),
                    student_data.get('marks_math', 70),
                    student_data.get('marks_english', 70),
                    student_data.get('marks_science', 70),
                    student_data.get('communication', 0.7),
                    student_data.get('critical_thinking', 0.7),
                    student_data.get('discipline', 0.8),
                    student_data.get('study_mgmt', 0.7)
                ]
                
                X_data.append(features)
                y_data.append(ratings['fifa_rating'])
                
            except Exception as e:
                print(f"⚠️ Error processing student {student.id}: {e}")
                continue
        
        if len(X_data) < self.settings.minimum_training_data:
            print(f"⚠️ Insufficient valid training data: {len(X_data)}")
            return None
        
        # Train model
        X = np.array(X_data)
        y = np.array(y_data)
        
        X_train, X_test, y_train, y_test = self.train_test_split(X, y, test_size=0.2, random_state=42)
        
        self.model = self.RandomForestRegressor(
            n_estimators=200,
            random_state=42,
            max_depth=8,
            min_samples_split=4
        )
        
        self.model.fit(X_train, y_train)
        
        # Evaluate model
        y_pred = self.model.predict(X_test)
        mse = self.mean_squared_error(y_test, y_pred)
        r2 = self.r2_score(y_test, y_pred)
        
        print(f"✅ Model trained successfully!")
        print(f"   📊 Training samples: {len(X_train)}")
        print(f"   📊 Test samples: {len(X_test)}")
        print(f"   🎯 R² Score: {r2:.3f}")
        print(f"   📉 MSE: {mse:.3f}")
        
        return {
            'r2_score': r2,
            'mse': mse,
            'feature_importance': dict(zip(self.feature_names, self.model.feature_importances_)),
            'training_samples': len(X_train)
        }
    
    def calculate_batch_analytics(self, batch_id: int) -> Dict[str, Any]:
        """Calculate analytics for an entire batch"""
        students = self.session.exec(
            select(Student).where(Student.batch_id == batch_id)
        ).all()
        
        if not students:
            raise ValueError(f"No students found in batch {batch_id}")
        
        batch = self.session.exec(select(Batch).where(Batch.id == batch_id)).first()
        
        # Calculate individual analytics for all students
        all_ratings = []
        top_performers = []
        at_risk_students = []
        
        for student in students:
            try:
                analytics = self.calculate_student_analytics(student.id)
                ratings = analytics['ratings']
                
                all_ratings.append({
                    'student_id': student.id,
                    'student_name': student.full_name,
                    'fifa_rating': ratings['fifa_rating'],
                    'attendance_rating': ratings['attendance_rating'],
                    'homework_rating': ratings['homework_classwork_rating'],
                    'exam_rating': ratings['exam_rating'],
                    'skill_rating': ratings['skill_rating']
                })
                
                # Categorize students
                if ratings['fifa_rating'] >= self.settings.excellent_threshold:
                    top_performers.append({
                        'id': student.id,
                        'name': student.full_name,
                        'rating': ratings['fifa_rating']
                    })
                elif ratings['fifa_rating'] < self.settings.needs_improvement_threshold:
                    at_risk_students.append({
                        'id': student.id,
                        'name': student.full_name,
                        'rating': ratings['fifa_rating']
                    })
                    
            except Exception as e:
                print(f"⚠️ Error calculating analytics for student {student.id}: {e}")
                continue
        
        if not all_ratings:
            raise ValueError("No valid analytics calculated for batch")
        
        # Calculate batch averages
        df = pd.DataFrame(all_ratings)
        
        batch_analytics = {
            'batch_id': batch_id,
            'batch_name': batch.name if batch else f"Batch {batch_id}",
            'total_students': len(all_ratings),
            'average_fifa_rating': round(df['fifa_rating'].mean(), 2),
            'average_attendance_rating': round(df['attendance_rating'].mean(), 2),
            'average_homework_rating': round(df['homework_rating'].mean(), 2),
            'average_exam_rating': round(df['exam_rating'].mean(), 2),
            'average_skills_rating': round(df['skill_rating'].mean(), 2),
            'top_performers': sorted(top_performers, key=lambda x: x['rating'], reverse=True)[:5],
            'at_risk_students': sorted(at_risk_students, key=lambda x: x['rating'])[:5],
            'category_averages': {
                'attendance': round(df['attendance_rating'].mean(), 2),
                'homework_classwork': round(df['homework_rating'].mean(), 2),
                'exams': round(df['exam_rating'].mean(), 2),
                'skills': round(df['skill_rating'].mean(), 2)
            },
            'improvement_trends': {
                'improving': len([r for r in all_ratings if r['fifa_rating'] > 80]),
                'stable': len([r for r in all_ratings if 70 <= r['fifa_rating'] <= 80]),
                'declining': len([r for r in all_ratings if r['fifa_rating'] < 60])
            }
        }
        
        # Determine strongest and weakest areas
        averages = batch_analytics['category_averages']
        strongest_area = max(averages, key=averages.get)
        weakest_area = min(averages, key=averages.get)
        
        batch_analytics['strongest_area'] = strongest_area
        batch_analytics['weakest_area'] = weakest_area
        
        return batch_analytics

def main():
    """Test the analytics engine"""
    print("🚀 Testing Student Analytics Engine...")
    
    with Session(engine) as session:
        engine_instance = StudentAnalyticsEngine(session)
        
        # Train ML model
        model_stats = engine_instance.train_ml_model()
        
        # Get first few students for testing
        students = session.exec(select(Student).limit(3)).all()
        
        for student in students:
            print(f"\n📊 Analyzing student: {student.full_name}")
            try:
                analytics = engine_instance.calculate_student_analytics(student.id)
                print(f"   🏆 FIFA Rating: {analytics['ratings']['fifa_rating']:.1f}")
                print(f"   📅 Attendance: {analytics['ratings']['attendance_rating']:.1f}")
                print(f"   📚 Homework: {analytics['ratings']['homework_classwork_rating']:.1f}")
                print(f"   📝 Exams: {analytics['ratings']['exam_rating']:.1f}")
                print(f"   🧠 Skills: {analytics['ratings']['skill_rating']:.1f}")
                print(f"   ⚠️ Risk Level: {analytics['risk_level']}")
                print(f"   💡 Recommendations: {len(analytics['recommendations'])}")
                
                # Save to database
                engine_instance.save_analytics_to_database(analytics)
                print(f"   ✅ Analytics saved to database")
                
            except Exception as e:
                print(f"   ❌ Error: {e}")
        
        # Test batch analytics
        batches = session.exec(select(Batch).limit(1)).all()
        if batches:
            batch = batches[0]
            print(f"\n📊 Batch Analytics: {batch.name}")
            try:
                batch_analytics = engine_instance.calculate_batch_analytics(batch.id)
                print(f"   👥 Total Students: {batch_analytics['total_students']}")
                print(f"   🏆 Average Rating: {batch_analytics['average_fifa_rating']}")
                print(f"   🌟 Top Performers: {len(batch_analytics['top_performers'])}")
                print(f"   ⚠️ At Risk: {len(batch_analytics['at_risk_students'])}")
                print(f"   💪 Strongest Area: {batch_analytics['strongest_area']}")
                print(f"   📈 Weakest Area: {batch_analytics['weakest_area']}")
                
            except Exception as e:
                print(f"   ❌ Error: {e}")
        
        print(f"\n🎉 Analytics engine testing completed!")

if __name__ == "__main__":
    main()