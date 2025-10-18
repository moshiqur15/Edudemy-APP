#!/usr/bin/env python3
"""
Comprehensive Dataset Creation for Edudemy Analytics
Creates 200 realistic students with complete educational data
"""

import sys
import os
import random
import json
from datetime import datetime, timedelta
from typing import List

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from sqlmodel import create_engine, Session, SQLModel, select
from backend.app.models import Student, Teacher, Batch, User, UserRole, Gender, StudentVersion
from analytics_models import (
    HomeworkSubmission, ClassworkSubmission, AttendanceExtended,
    SkillsAssessment, ExamExtended, StudentAnalytics, AnalyticsSettings
)

# Database connection
DATABASE_URL = "postgresql://postgres:1122@localhost:5432/edudemy_db"

class ComprehensiveDataCreator:
    def __init__(self, session: Session):
        self.session = session
        self.created_users = []
        self.created_teachers = []
        self.created_batches = []
        self.created_students = []
        
        # Realistic data pools
        self.first_names_male = [
            "Rahul", "Amit", "Ravi", "Arjun", "Sanjay", "Vikash", "Sunil", "Rajesh", "Manoj", "Deepak",
            "Abhishek", "Rohit", "Ajay", "Sachin", "Ankit", "Ashish", "Kiran", "Nitin", "Pankaj", "Sandeep",
            "Mohammad", "Ahmed", "Hassan", "Ibrahim", "Omar", "Karim", "Farid", "Rashid", "Nasir", "Salim",
            "Tanvir", "Shakib", "Masud", "Riaz", "Alam", "Hasan", "Khan", "Rahman", "Islam", "Uddin"
        ]
        
        self.first_names_female = [
            "Priya", "Sunita", "Meera", "Kavita", "Sita", "Geeta", "Anita", "Rita", "Nita", "Lata",
            "Shanti", "Poonam", "Renu", "Manju", "Asha", "Usha", "Rekha", "Seema", "Neelam", "Kiran",
            "Fatima", "Ayesha", "Nadia", "Rashida", "Salma", "Nasreen", "Sultana", "Ruma", "Shahida", "Rabeya",
            "Shireen", "Nasir", "Rashida", "Sabina", "Farida", "Halima", "Mariam", "Khadija", "Aisha", "Zainab"
        ]
        
        self.last_names = [
            "Rahman", "Ahmed", "Khan", "Islam", "Hossain", "Ali", "Alam", "Uddin", "Miah", "Sheikh",
            "Roy", "Das", "Sharma", "Ghosh", "Chakraborty", "Mukherjee", "Banerjee", "Dutta", "Sen", "Pal",
            "Singh", "Kumar", "Prasad", "Jha", "Mishra", "Pandey", "Tiwari", "Gupta", "Agarwal", "Verma"
        ]
        
        self.class_levels = ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "HSC 1st Year", "HSC 2nd Year"]
        self.subjects = ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Bangla", "ICT"]
        
    def create_teachers_and_users(self, count: int = 15) -> List[Teacher]:
        """Create realistic teachers with user accounts"""
        print(f"👨‍🏫 Creating {count} teachers...")
        
        teacher_specializations = [
            ("Mathematics", ["Mathematics", "Higher Mathematics"]),
            ("Physics", ["Physics", "Mathematics"]),
            ("Chemistry", ["Chemistry", "Science"]),
            ("Biology", ["Biology", "Science"]),
            ("English", ["English"]),
            ("Bangla", ["Bangla"]),
            ("ICT", ["ICT", "Computer Science"])
        ]
        
        created_teachers = []
        
        for i in range(count):
            # Create user first
            gender = random.choice([Gender.MALE, Gender.FEMALE])
            if gender == Gender.MALE:
                first_name = random.choice(self.first_names_male)
            else:
                first_name = random.choice(self.first_names_female)
            
            last_name = random.choice(self.last_names)
            full_name = f"{first_name} {last_name}"
            
            user = User(
                email=f"teacher{i+1}@edudemy.com",
                username=f"teacher{i+1}",
                full_name=full_name,
                role=UserRole.TEACHER,
                phone=f"01{''.join([str(random.randint(0, 9)) for _ in range(9)])}",
                hashed_password="$2b$12$dummy_hash_for_testing",
                is_active=True
            )
            self.session.add(user)
            self.session.commit()
            self.session.refresh(user)
            self.created_users.append(user)
            
            # Create teacher with only available fields
            specialization = random.choice(teacher_specializations)
            teacher = Teacher(
                user_id=user.id,
                employee_id=f"T2025{str(i+1).zfill(3)}",
                subjects=",".join(specialization[1]),
                is_active=True
            )
            self.session.add(teacher)
            self.session.commit()
            self.session.refresh(teacher)
            created_teachers.append(teacher)
            
        print(f"✅ Created {len(created_teachers)} teachers")
        self.created_teachers = created_teachers
        return created_teachers
    
    def create_batches(self, teachers: List[Teacher], count: int = 20) -> List[Batch]:
        """Create realistic batches"""
        print(f"📚 Creating {count} batches...")
        
        batch_times = [
            "08:00-10:00", "10:00-12:00", "12:00-14:00", 
            "14:00-16:00", "16:00-18:00", "18:00-20:00"
        ]
        
        created_batches = []
        
        for i in range(count):
            class_level = random.choice(self.class_levels)
            version = random.choice([StudentVersion.BV, StudentVersion.EV])
            version_name = "Bangla" if version == StudentVersion.BV else "English"
            
            batch = Batch(
                name=f"{class_level} - {version_name} Batch {chr(65 + (i % 26))}",
                code=f"B{str(datetime.now().year)}{str(i+1).zfill(3)}",
                course=f"{class_level} Complete Course",
                class_name=class_level,
                version=version,
                start_date=datetime.now() - timedelta(days=random.randint(30, 180)),
                end_date=datetime.now() + timedelta(days=random.randint(180, 365)),
                max_students=random.randint(15, 25),
                min_students=8,
                current_students_count=0,
                time_slot=random.choice(batch_times),
                fee_amount=random.randint(3000, 8000),
                fee_period="monthly",
                status="active",
                created_by=random.choice(self.created_users).id if self.created_users else None
            )
            self.session.add(batch)
            self.session.commit()
            self.session.refresh(batch)
            created_batches.append(batch)
            
        print(f"✅ Created {len(created_batches)} batches")
        self.created_batches = created_batches
        return created_batches
    
    def create_students_and_users(self, batches: List[Batch], count: int = 200) -> List[Student]:
        """Create 200 realistic students"""
        print(f"👥 Creating {count} students...")
        
        created_students = []
        
        for i in range(count):
            # Distribute students across batches
            batch = batches[i % len(batches)]
            
            # Create user for student
            gender = random.choice([Gender.MALE, Gender.FEMALE])
            if gender == Gender.MALE:
                first_name = random.choice(self.first_names_male)
            else:
                first_name = random.choice(self.first_names_female)
            
            last_name = random.choice(self.last_names)
            full_name = f"{first_name} {last_name}"
            
            user = User(
                email=f"student{i+1}@edudemy.com",
                username=f"student{i+1}",
                full_name=full_name,
                role=UserRole.STUDENT,
                phone=f"01{''.join([str(random.randint(0, 9)) for _ in range(9)])}",
                hashed_password="$2b$12$dummy_hash_for_testing",
                is_active=True
            )
            self.session.add(user)
            self.session.commit()
            self.session.refresh(user)
            
            # Create student
            father_name = f"{random.choice(self.first_names_male)} {last_name}"
            mother_name = f"{random.choice(self.first_names_female)} {last_name}"
            
            student = Student(
                user_id=user.id,
                full_name=full_name,
                father_name=father_name,
                mother_name=mother_name,
                gender=gender,
                date_of_birth=datetime.now() - timedelta(days=random.randint(5475, 7300)), # 15-20 years
                address=f"House {random.randint(1, 999)}, Road {random.randint(1, 50)}, {random.choice(['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna'])}",
                class_name=batch.class_name,
                batch_id=batch.id,
                version=batch.version,
                current_school=f"{random.choice(['Dhaka', 'Model', 'Ideal', 'Government'])} {random.choice(['High School', 'College', 'Academy'])}",
                student_reg_number=f"{datetime.now().year}-{str(i+1).zfill(4)}",
                student_roll_number=f"R{str(i+1).zfill(4)}",
                student_contact=f"01{''.join([str(random.randint(0, 9)) for _ in range(9)])}",
                father_contact=f"01{''.join([str(random.randint(0, 9)) for _ in range(9)])}",
                mother_contact=f"01{''.join([str(random.randint(0, 9)) for _ in range(9)])}",
                admission_date=datetime.now() - timedelta(days=random.randint(30, 365)),
                admission_serial=i+1
            )
            self.session.add(student)
            self.session.commit()
            self.session.refresh(student)
            created_students.append(student)
            
            # Update batch student count
            batch.current_students_count += 1
            
        # Commit batch updates
        self.session.commit()
        
        print(f"✅ Created {len(created_students)} students")
        self.created_students = created_students
        return created_students
    
    def create_comprehensive_analytics_data(self, students: List[Student], teachers: List[Teacher]):
        """Create comprehensive analytics data for all students"""
        print("📊 Creating comprehensive analytics data...")
        
        cutoff_date = datetime.now() - timedelta(days=120)  # 4 months of data
        
        for i, student in enumerate(students):
            print(f"   Processing student {i+1}/{len(students)}: {student.full_name}")
            
            # Student performance profile (realistic distribution)
            performance_type = random.choices([
                "excellent", "good", "average", "struggling", "inconsistent"
            ], weights=[10, 25, 35, 20, 10])[0]
            
            # Set base probabilities based on performance type
            if performance_type == "excellent":
                attendance_prob = 0.95
                hw_quality_range = (0.85, 1.0)
                exam_range = (85, 98)
                skills_range = (0.8, 1.0)
            elif performance_type == "good":
                attendance_prob = 0.88
                hw_quality_range = (0.75, 0.9)
                exam_range = (75, 88)
                skills_range = (0.7, 0.85)
            elif performance_type == "average":
                attendance_prob = 0.82
                hw_quality_range = (0.65, 0.8)
                exam_range = (65, 78)
                skills_range = (0.6, 0.75)
            elif performance_type == "struggling":
                attendance_prob = 0.75
                hw_quality_range = (0.45, 0.65)
                exam_range = (45, 65)
                skills_range = (0.4, 0.6)
            else:  # inconsistent
                attendance_prob = 0.80
                hw_quality_range = (0.3, 0.9)  # Wide range
                exam_range = (40, 85)  # Wide range
                skills_range = (0.35, 0.8)
            
            # Create attendance records (every weekday for 4 months)
            current_date = cutoff_date
            while current_date <= datetime.now():
                if current_date.weekday() < 5:  # Weekdays only
                    subject = random.choice(self.subjects)
                    
                    # Attendance decision with some patterns
                    is_present = random.random() < attendance_prob
                    
                    # Holiday patterns (lower attendance before/after holidays)
                    if current_date.day in [1, 15, 16] or current_date.month in [4, 10]:  # Eid/Holidays
                        if random.random() < 0.3:
                            absence_type = random.choice(["holiday_before", "holiday_after"])
                            is_present = False
                        else:
                            absence_type = None
                    else:
                        absence_type = random.choice([None, "regular", "sick"]) if not is_present else None
                    
                    attendance = AttendanceExtended(
                        student_id=student.id,
                        teacher_id=random.choice(teachers).id if teachers else None,
                        class_date=current_date,
                        subject=subject,
                        is_present=is_present,
                        is_late=random.random() < 0.1 if is_present else False,
                        minutes_late=random.randint(5, 20) if random.random() < 0.1 and is_present else None,
                        absence_type=absence_type,
                        is_excused=random.random() < 0.7 if absence_type == "sick" else False,
                        participation_score=random.uniform(0.6, 1.0) if is_present else None,
                        behavior_score=random.uniform(0.7, 1.0) if is_present else None
                    )
                    self.session.add(attendance)
                
                current_date += timedelta(days=1)
            
            # Create homework submissions (2-3 per week)
            hw_count = random.randint(24, 36)  # 4 months worth
            for hw_num in range(hw_count):
                assigned_date = cutoff_date + timedelta(days=random.randint(0, 120))
                due_date = assigned_date + timedelta(days=random.randint(3, 10))
                
                is_submitted = random.random() < (attendance_prob * 0.9)  # Correlated with attendance
                quality = random.uniform(*hw_quality_range) if is_submitted else 0
                
                homework = HomeworkSubmission(
                    student_id=student.id,
                    teacher_id=random.choice(teachers).id if teachers else None,
                    subject=random.choice(self.subjects),
                    title=f"Assignment {hw_num + 1}",
                    assigned_date=assigned_date,
                    due_date=due_date,
                    is_submitted=is_submitted,
                    submission_date=due_date - timedelta(days=random.randint(0, 3)) if is_submitted else None,
                    submission_quality=quality,
                    feedback=f"Good effort" if quality > 0.7 else "Needs improvement" if is_submitted else None,
                    late_submission=random.random() < 0.15 if is_submitted else False
                )
                self.session.add(homework)
            
            # Create classwork submissions (2-3 per week)
            cw_count = random.randint(20, 32)
            for cw_num in range(cw_count):
                class_date = cutoff_date + timedelta(days=random.randint(0, 120))
                
                classwork = ClassworkSubmission(
                    student_id=student.id,
                    teacher_id=random.choice(teachers).id if teachers else None,
                    subject=random.choice(self.subjects),
                    class_date=class_date,
                    topic=f"Topic {cw_num + 1}",
                    submission_quality=random.uniform(*hw_quality_range),
                    understanding_level=random.uniform(*hw_quality_range),
                    participation_level=random.uniform(0.5, 1.0)
                )
                self.session.add(classwork)
            
            # Create exam records (monthly exams for each subject)
            exam_months = 4
            for month in range(exam_months):
                exam_date = cutoff_date + timedelta(days=30*month + 15)
                
                for subject in random.sample(self.subjects, k=random.randint(3, 5)):
                    marks = random.uniform(*exam_range)
                    max_marks = 100
                    
                    exam = ExamExtended(
                        student_id=student.id,
                        teacher_id=random.choice(teachers).id if teachers else None,
                        subject=subject,
                        exam_date=exam_date,
                        exam_type="monthly",
                        marks_obtained=marks,
                        max_marks=max_marks,
                        percentage=(marks / max_marks) * 100,
                        answer_sensibility=random.uniform(0.6, 1.0),
                        completion_rate=random.uniform(0.7, 1.0),
                        unrelated_answer_rate=random.uniform(0.0, 0.2),
                        time_management=random.uniform(0.6, 1.0),
                        handwriting_quality=random.uniform(0.5, 1.0)
                    )
                    self.session.add(exam)
            
            # Create skills assessments (monthly)
            for month in range(exam_months):
                assessment_date = cutoff_date + timedelta(days=30*month + 20)
                
                skills = SkillsAssessment(
                    student_id=student.id,
                    teacher_id=random.choice(teachers).id if teachers else None,
                    assessment_date=assessment_date,
                    communication=random.uniform(*skills_range),
                    critical_thinking=random.uniform(*skills_range),
                    discipline=random.uniform(*skills_range),
                    study_management=random.uniform(*skills_range),
                    leadership=random.uniform(0.4, 0.8),
                    teamwork=random.uniform(*skills_range),
                    assessment_method="teacher_observation",
                    notes=f"Month {month+1} skills assessment"
                )
                self.session.add(skills)
            
            # Commit every 10 students to avoid memory issues
            if (i + 1) % 10 == 0:
                self.session.commit()
                print(f"   ✅ Committed data for {i+1} students")
        
        # Final commit
        self.session.commit()
        print("✅ Comprehensive analytics data created!")

def main():
    """Main function to create comprehensive dataset"""
    print("🚀 Creating Comprehensive Edudemy Dataset...")
    print("=" * 50)
    
    try:
        # Setup database
        engine = create_engine(DATABASE_URL)
        SQLModel.metadata.create_all(engine)
        
        with Session(engine) as session:
            creator = ComprehensiveDataCreator(session)
            
            # Step 1: Create teachers
            print("\n📋 Step 1: Creating Teachers")
            teachers = creator.create_teachers_and_users(15)
            
            # Step 2: Create batches  
            print("\n📋 Step 2: Creating Batches")
            batches = creator.create_batches(teachers, 20)
            
            # Step 3: Create students
            print("\n📋 Step 3: Creating Students")
            students = creator.create_students_and_users(batches, 200)
            
            # Step 4: Create comprehensive analytics data
            print("\n📋 Step 4: Creating Analytics Data")
            creator.create_comprehensive_analytics_data(students, teachers)
            
            # Create analytics settings
            print("\n📋 Step 5: Creating Analytics Settings")
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
            print(f"   📈 Analytics Data: Complete 4-month history")
            print(f"   🎯 Ready for ML training and analytics!")
            
    except Exception as e:
        print(f"❌ Error creating dataset: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    if not success:
        sys.exit(1)