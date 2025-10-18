#!/usr/bin/env python3
"""
Create 200 Students for Edudemy Analytics
Works with existing database structure
"""

import sys
import os
import random
from datetime import datetime, timedelta

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from sqlmodel import create_engine, Session, select
from backend.app.models import Student, Teacher, Batch, User, UserRole, Gender, StudentVersion
from analytics_models import (
    HomeworkSubmission, ClassworkSubmission, AttendanceExtended,
    SkillsAssessment, ExamExtended, AnalyticsSettings
)

DATABASE_URL = "postgresql://postgres:1122@localhost:5432/edudemy_db"

def create_200_students():
    """Create 200 students with comprehensive analytics data"""
    
    print("🚀 Creating 200 Students Dataset...")
    
    # Name pools
    first_names_male = [
        "Rahul", "Amit", "Ravi", "Arjun", "Sanjay", "Vikash", "Sunil", "Rajesh", "Manoj", "Deepak",
        "Abhishek", "Rohit", "Ajay", "Sachin", "Ankit", "Ashish", "Kiran", "Nitin", "Pankaj", "Sandeep",
        "Mohammad", "Ahmed", "Hassan", "Ibrahim", "Omar", "Karim", "Farid", "Rashid", "Nasir", "Salim",
        "Tanvir", "Shakib", "Masud", "Riaz", "Alam", "Hasan", "Khan", "Rahman", "Islam", "Uddin"
    ]
    
    first_names_female = [
        "Priya", "Sunita", "Meera", "Kavita", "Sita", "Geeta", "Anita", "Rita", "Nita", "Lata",
        "Shanti", "Poonam", "Renu", "Manju", "Asha", "Usha", "Rekha", "Seema", "Neelam", "Kiran",
        "Fatima", "Ayesha", "Nadia", "Rashida", "Salma", "Nasreen", "Sultana", "Ruma", "Shahida", "Rabeya",
        "Shireen", "Nasir", "Rashida", "Sabina", "Farida", "Halima", "Mariam", "Khadija", "Aisha", "Zainab"
    ]
    
    last_names = [
        "Rahman", "Ahmed", "Khan", "Islam", "Hossain", "Ali", "Alam", "Uddin", "Miah", "Sheikh",
        "Roy", "Das", "Sharma", "Ghosh", "Chakraborty", "Mukherjee", "Banerjee", "Dutta", "Sen", "Pal",
        "Singh", "Kumar", "Prasad", "Jha", "Mishra", "Pandey", "Tiwari", "Gupta", "Agarwal", "Verma"
    ]
    
    class_levels = ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "HSC 1st Year", "HSC 2nd Year"]
    subjects = ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Bangla", "ICT"]
    
    engine = create_engine(DATABASE_URL)
    
    with Session(engine) as session:
        
        # Step 1: Get or create teachers
        existing_teachers = session.exec(select(Teacher)).all()
        if not existing_teachers:
            print("📚 Creating basic teachers...")
            teacher_user = User(
                email="teacher@edudemy.com",
                username="teacher1",
                full_name="Main Teacher",
                role=UserRole.TEACHER,
                hashed_password="$2b$12$dummy_hash",
                is_active=True
            )
            session.add(teacher_user)
            session.commit()
            session.refresh(teacher_user)
            
            teacher = Teacher(
                user_id=teacher_user.id,
                employee_id="T001",
                subjects="Mathematics,Physics,Chemistry"
            )
            session.add(teacher)
            session.commit()
            session.refresh(teacher)
            teachers = [teacher]
        else:
            teachers = existing_teachers
        
        print(f"✅ Using {len(teachers)} teachers")
        
        # Step 2: Get or create batches
        existing_batches = session.exec(select(Batch)).all()
        if not existing_batches:
            print("📚 Creating basic batches...")
            batches = []
            for i, class_level in enumerate(class_levels):
                batch = Batch(
                    name=f"{class_level} - Main Batch",
                    code=f"B2025{str(i+1).zfill(3)}",
                    class_name=class_level,
                    version=StudentVersion.BV,
                    max_students=30,
                    current_students_count=0,
                    status="active"
                )
                session.add(batch)
                batches.append(batch)
            session.commit()
        else:
            batches = existing_batches
            
        print(f"✅ Using {len(batches)} batches")
        
        # Step 3: Create 200 students
        print("👥 Creating 200 students...")
        students = []
        
        for i in range(200):
            # Random student data
            gender = random.choice([Gender.MALE, Gender.FEMALE])
            if gender == Gender.MALE:
                first_name = random.choice(first_names_male)
            else:
                first_name = random.choice(first_names_female)
            
            last_name = random.choice(last_names)
            full_name = f"{first_name} {last_name}"
            batch = random.choice(batches)
            
            # Create user
            user = User(
                email=f"student{i+1}@edudemy.com",
                username=f"student{i+1}",
                full_name=full_name,
                role=UserRole.STUDENT,
                hashed_password="$2b$12$dummy_hash",
                is_active=True
            )
            session.add(user)
            session.commit()
            session.refresh(user)
            
            # Create student
            student = Student(
                user_id=user.id,
                full_name=full_name,
                father_name=f"{random.choice(first_names_male)} {last_name}",
                mother_name=f"{random.choice(first_names_female)} {last_name}",
                gender=gender,
                class_name=batch.class_name,
                batch_id=batch.id,
                version=batch.version or StudentVersion.BV,
                student_reg_number=f"2025-{str(i+1).zfill(4)}",
                admission_date=datetime.now() - timedelta(days=random.randint(30, 365))
            )
            session.add(student)
            students.append(student)
            
            # Update batch count
            batch.current_students_count += 1
            
            # Commit in batches
            if (i + 1) % 20 == 0:
                session.commit()
                print(f"   ✅ Created {i+1} students")
        
        session.commit()
        print(f"✅ Created {len(students)} total students")
        
        # Step 4: Create analytics data
        print("📊 Creating analytics data...")
        cutoff_date = datetime.now() - timedelta(days=90)
        
        for i, student in enumerate(students):
            # Performance profile
            performance_type = random.choices([
                "excellent", "good", "average", "struggling"
            ], weights=[15, 30, 40, 15])[0]
            
            if performance_type == "excellent":
                attendance_rate = 0.95
                hw_quality = (0.85, 1.0)
                exam_marks = (85, 98)
                skills_level = (0.8, 1.0)
            elif performance_type == "good":
                attendance_rate = 0.88
                hw_quality = (0.75, 0.9)
                exam_marks = (75, 88)
                skills_level = (0.7, 0.85)
            elif performance_type == "average":
                attendance_rate = 0.82
                hw_quality = (0.65, 0.8)
                exam_marks = (65, 78)
                skills_level = (0.6, 0.75)
            else:  # struggling
                attendance_rate = 0.70
                hw_quality = (0.45, 0.65)
                exam_marks = (45, 65)
                skills_level = (0.4, 0.6)
            
            # Create attendance (3 months, weekdays only)
            for day in range(90):
                current_date = cutoff_date + timedelta(days=day)
                if current_date.weekday() < 5:  # Weekdays
                    attendance = AttendanceExtended(
                        student_id=student.id,
                        teacher_id=teachers[0].id,
                        class_date=current_date,
                        subject=random.choice(subjects),
                        is_present=random.random() < attendance_rate,
                        is_late=random.random() < 0.1
                    )
                    session.add(attendance)
            
            # Create homework (weekly)
            for week in range(12):
                homework = HomeworkSubmission(
                    student_id=student.id,
                    teacher_id=teachers[0].id,
                    subject=random.choice(subjects),
                    title=f"Week {week+1} Assignment",
                    assigned_date=cutoff_date + timedelta(weeks=week),
                    due_date=cutoff_date + timedelta(weeks=week, days=7),
                    is_submitted=random.random() < 0.85,
                    submission_quality=random.uniform(*hw_quality)
                )
                session.add(homework)
            
            # Create classwork (weekly)
            for week in range(12):
                classwork = ClassworkSubmission(
                    student_id=student.id,
                    teacher_id=teachers[0].id,
                    subject=random.choice(subjects),
                    class_date=cutoff_date + timedelta(weeks=week),
                    topic=f"Week {week+1} Topic",
                    submission_quality=random.uniform(*hw_quality),
                    understanding_level=random.uniform(*hw_quality),
                    participation_level=random.uniform(0.6, 1.0)
                )
                session.add(classwork)
            
            # Create exams (monthly)
            for month in range(3):
                for subject in random.sample(subjects, 3):
                    marks = random.uniform(*exam_marks)
                    exam = ExamExtended(
                        student_id=student.id,
                        teacher_id=teachers[0].id,
                        subject=subject,
                        exam_date=cutoff_date + timedelta(days=30*month + 15),
                        exam_type="monthly",
                        marks_obtained=marks,
                        max_marks=100,
                        percentage=(marks/100)*100,
                        answer_sensibility=random.uniform(0.6, 1.0),
                        completion_rate=random.uniform(0.7, 1.0),
                        unrelated_answer_rate=random.uniform(0.0, 0.2)
                    )
                    session.add(exam)
            
            # Create skills (monthly)
            for month in range(3):
                skills = SkillsAssessment(
                    student_id=student.id,
                    teacher_id=teachers[0].id,
                    assessment_date=cutoff_date + timedelta(days=30*month + 20),
                    communication=random.uniform(*skills_level),
                    critical_thinking=random.uniform(*skills_level),
                    discipline=random.uniform(*skills_level),
                    study_management=random.uniform(*skills_level),
                    assessment_method="teacher_observation"
                )
                session.add(skills)
            
            # Commit every 25 students
            if (i + 1) % 25 == 0:
                session.commit()
                print(f"   ✅ Analytics data for {i+1} students")
        
        session.commit()
        
        # Create settings
        settings = session.exec(select(AnalyticsSettings).where(AnalyticsSettings.is_active == True)).first()
        if not settings:
            settings = AnalyticsSettings(
                attendance_weight=0.30,
                homework_classwork_weight=0.30,
                exam_weight=0.30,
                skills_weight=0.10,
                is_active=True
            )
            session.add(settings)
            session.commit()
        
        print("\n🎉 DATASET CREATION COMPLETED!")
        print("=" * 50)
        print(f"📊 Summary:")
        print(f"   👨‍🏫 Teachers: {len(teachers)}")
        print(f"   📚 Batches: {len(batches)}")
        print(f"   👥 Students: {len(students)}")
        print(f"   📈 Analytics Data: 3 months of comprehensive data")
        print(f"   🎯 Ready for analytics and ML training!")

if __name__ == "__main__":
    create_200_students()