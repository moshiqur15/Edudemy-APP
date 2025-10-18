#!/usr/bin/env python3
"""
Simplified Analytics Data Seeding
Creates minimal test data for analytics system with existing database structure
"""

import sys
import os
import random
from datetime import datetime, timedelta

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from sqlmodel import create_engine, Session, SQLModel
from backend.app.models import Student, Teacher, Batch, User, UserRole, Gender, StudentVersion
from analytics_models import (
    HomeworkSubmission, ClassworkSubmission, AttendanceExtended,
    SkillsAssessment, ExamExtended, StudentAnalytics, AnalyticsSettings
)

# Database connection
DATABASE_URL = "postgresql://postgres:1122@localhost:5432/edudemy_db"

def create_minimal_data(session: Session):
    """Create minimal test data that works with existing schema"""
    
    print("📊 Creating minimal analytics test data...")
    
    # Get existing students from the database
    existing_students = session.query(Student).limit(5).all()
    
    if not existing_students:
        print("⚠️ No existing students found. Creating sample students...")
        
        # Create simple students using only required fields
        sample_students = []
        for i in range(3):
            student = Student(
                full_name=f"Test Student {i+1}",
                father_name=f"Father {i+1}",
                mother_name=f"Mother {i+1}",
                gender=random.choice([Gender.MALE, Gender.FEMALE]),
                class_name=random.choice(["Class 9", "Class 10", "HSC 1st Year"]),
                version=StudentVersion.BV,
                admission_date=datetime.now() - timedelta(days=random.randint(30, 365))
            )
            session.add(student)
            sample_students.append(student)
        
        session.commit()
        print(f"✅ Created {len(sample_students)} test students")
        students = sample_students
    else:
        students = existing_students
        print(f"✅ Using {len(students)} existing students")
    
    # Create analytics data for each student
    cutoff_date = datetime.now() - timedelta(days=90)
    
    for student in students:
        student_id = student.id
        
        # Create attendance records
        for day_offset in range(0, 60, 3):  # Every 3 days for 60 days
            class_date = cutoff_date + timedelta(days=day_offset)
            
            # Skip weekends
            if class_date.weekday() >= 5:
                continue
                
            attendance = AttendanceExtended(
                student_id=student_id,
                class_date=class_date,
                subject=random.choice(["Mathematics", "Physics", "English"]),
                is_present=random.choices([True, False], weights=[0.85, 0.15])[0],
                is_late=random.choices([True, False], weights=[0.1, 0.9])[0],
                absence_type=random.choice(["regular", "sick", "holiday_before", "holiday_after"]) if random.random() < 0.15 else None
            )
            session.add(attendance)
        
        # Create homework submissions
        for week in range(12):  # 12 weeks of homework
            hw_date = cutoff_date + timedelta(weeks=week)
            
            homework = HomeworkSubmission(
                student_id=student_id,
                subject=random.choice(["Mathematics", "Physics", "English"]),
                title=f"Week {week+1} Assignment",
                assigned_date=hw_date,
                due_date=hw_date + timedelta(days=7),
                is_submitted=random.choices([True, False], weights=[0.8, 0.2])[0],
                submission_quality=random.uniform(0.5, 1.0),
                feedback=f"Week {week+1} feedback"
            )
            session.add(homework)
        
        # Create classwork submissions
        for day_offset in range(0, 60, 7):  # Weekly classwork
            cw_date = cutoff_date + timedelta(days=day_offset)
            
            classwork = ClassworkSubmission(
                student_id=student_id,
                subject=random.choice(["Mathematics", "Physics", "English"]),
                class_date=cw_date,
                topic=f"Topic {day_offset//7 + 1}",
                submission_quality=random.uniform(0.5, 1.0),
                understanding_level=random.uniform(0.5, 1.0),
                participation_level=random.uniform(0.5, 1.0)
            )
            session.add(classwork)
        
        # Create exam records
        for month_offset in range(3):  # 3 months of exams
            exam_date = cutoff_date + timedelta(days=30*month_offset + 15)
            
            for subject in ["Mathematics", "Physics", "English"]:
                exam = ExamExtended(
                    student_id=student_id,
                    subject=subject,
                    exam_date=exam_date,
                    exam_type="monthly",
                    marks_obtained=random.uniform(40, 95),
                    max_marks=100,
                    percentage=None,  # Will be calculated
                    answer_sensibility=random.uniform(0.6, 1.0),
                    completion_rate=random.uniform(0.7, 1.0),
                    unrelated_answer_rate=random.uniform(0.0, 0.2)
                )
                # Calculate percentage
                exam.percentage = (exam.marks_obtained / exam.max_marks) * 100
                session.add(exam)
        
        # Create skills assessments
        for month_offset in range(3):
            assessment_date = cutoff_date + timedelta(days=30*month_offset + 20)
            
            skills = SkillsAssessment(
                student_id=student_id,
                assessment_date=assessment_date,
                communication=random.uniform(0.5, 1.0),
                critical_thinking=random.uniform(0.5, 1.0),
                discipline=random.uniform(0.6, 1.0),
                study_management=random.uniform(0.5, 1.0),
                assessment_method="teacher_observation",
                notes=f"Month {month_offset+1} assessment"
            )
            session.add(skills)
    
    # Create analytics settings if not exists
    existing_settings = session.query(AnalyticsSettings).filter(AnalyticsSettings.is_active == True).first()
    if not existing_settings:
        settings = AnalyticsSettings(
            attendance_weight=0.30,
            homework_classwork_weight=0.30,
            exam_weight=0.30,
            skills_weight=0.10,
            is_active=True
        )
        session.add(settings)
    
    session.commit()
    print("✅ Analytics data created successfully!")
    
    return len(students)

def main():
    """Main seeding function"""
    print("🚀 Starting Simplified Analytics Data Seeding...")
    
    try:
        engine = create_engine(DATABASE_URL)
        
        # Create tables if they don't exist
        SQLModel.metadata.create_all(engine)
        
        with Session(engine) as session:
            student_count = create_minimal_data(session)
            
            print(f"\n🎉 Seeding completed successfully!")
            print(f"   👥 Students processed: {student_count}")
            print(f"   📊 Analytics data created for {student_count} students")
            print(f"   ⏰ Data covers last 90 days")
            print(f"\n✅ Ready to run analytics engine!")
            
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    if not success:
        sys.exit(1)