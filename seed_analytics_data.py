#!/usr/bin/env python3
"""
Comprehensive Test Data Seeder for Student Analytics System
This script creates realistic student data for the FIFA-style analytics system
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from sqlmodel import create_engine, SQLModel, Session, select
from datetime import datetime, timedelta
import random
import numpy as np
from typing import List, Dict, Any
import hashlib

# Database connection
DATABASE_URL = "postgresql://postgres:1122@localhost:5432/edudemy_db"
engine = create_engine(DATABASE_URL)

# Import models
from backend.app.models import (
    User, UserRole, Student, Teacher, Batch, StudentVersion, Gender
)
from analytics_models import (
    HomeworkSubmission, ClassworkSubmission, AttendanceExtended,
    SkillsAssessment, ExamExtended, StudentAnalytics, 
    StudentRatingHistory, StudentRecommendation, BatchAnalytics,
    AnalyticsSettings
)

def create_test_users_and_teachers(session: Session) -> List[Teacher]:
    """Create test teachers for the analytics system"""
    teachers = []
    
    teacher_data = [
        {"name": "Rashida Khan", "email": "rashida.khan@edudemy.com", "subjects": "Mathematics,Physics", "specialization": "Mathematics"},
        {"name": "Abdul Rahman", "email": "abdul.rahman@edudemy.com", "subjects": "English,Bangla", "specialization": "English Literature"},
        {"name": "Fatima Ahmed", "email": "fatima.ahmed@edudemy.com", "subjects": "Chemistry,Biology", "specialization": "Chemistry"},
        {"name": "Mohammad Hasan", "email": "mohammad.hasan@edudemy.com", "subjects": "Physics,Higher Mathematics", "specialization": "Physics"},
        {"name": "Nasreen Sultana", "email": "nasreen.sultana@edudemy.com", "subjects": "Biology,Science", "specialization": "Biology"},
    ]
    
    for i, teacher_info in enumerate(teacher_data):
        # Check if user already exists
        existing_user = session.exec(select(User).where(User.email == teacher_info["email"])).first()
        if existing_user:
            # Get existing teacher
            teacher = session.exec(select(Teacher).where(Teacher.user_id == existing_user.id)).first()
            if teacher:
                teachers.append(teacher)
            continue
            
        # Create user
        user = User(
            email=teacher_info["email"],
            username=f"teacher{i+1}",
            full_name=teacher_info["name"],
            role=UserRole.TEACHER,
            hashed_password=hashlib.sha256("password123".encode()).hexdigest(),
            is_active=True,
            phone=f"01{random.randint(500000000, 999999999)}",
            department="Academic"
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        
        # Create teacher
        teacher = Teacher(
            user_id=user.id,
            employee_id=f"T{2025}{i+1:03d}",
            subjects=teacher_info["subjects"],
            specialization=teacher_info["specialization"],
            qualification="M.Sc, B.Ed",
            experience_years=random.randint(3, 15),
            joining_date=datetime.now() - timedelta(days=random.randint(365, 1825)),
            employment_type="full_time",
            max_classes_per_day=6,
            is_active=True
        )
        session.add(teacher)
        session.commit()
        session.refresh(teacher)
        teachers.append(teacher)
    
    return teachers

def create_test_batches(session: Session) -> List[Batch]:
    """Create test batches for different classes"""
    batches = []
    
    batch_data = [
        {"name": "SSC Science Batch A", "class_name": "SSC", "version": "BV", "max_students": 30},
        {"name": "SSC Science Batch B", "class_name": "SSC", "version": "BV", "max_students": 30},
        {"name": "HSC 1st Year Physics", "class_name": "HSC 1st Year", "version": "BV", "max_students": 25},
        {"name": "HSC 2nd Year Chemistry", "class_name": "HSC 2nd Year", "version": "BV", "max_students": 25},
        {"name": "Class 10 Mathematics", "class_name": "Class 10", "version": "BV", "max_students": 35},
    ]
    
    for i, batch_info in enumerate(batch_data):
        # Check if batch already exists
        existing_batch = session.exec(select(Batch).where(Batch.name == batch_info["name"])).first()
        if existing_batch:
            batches.append(existing_batch)
            continue
            
        batch = Batch(
            name=batch_info["name"],
            code=f"B{2025}{i+1:03d}",
            course=f"{batch_info['class_name']} Course",
            class_name=batch_info["class_name"],
            version=StudentVersion(batch_info["version"]),
            start_date=datetime(2024, 1, 1),
            end_date=datetime(2024, 12, 31),
            max_students=batch_info["max_students"],
            min_students=10,
            current_students_count=0,
            schedule_days='["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]',
            time_slot="08:00-12:00",
            fee_amount=5000.0,
            fee_period="monthly",
            status="active",
            created_by=1  # Assuming superadmin user ID is 1
        )
        session.add(batch)
        session.commit()
        session.refresh(batch)
        batches.append(batch)
    
    return batches

def create_test_students(session: Session, batches: List[Batch]) -> List[Student]:
    """Create comprehensive test students with realistic data"""
    students = []
    
    # Bangladeshi student names for authenticity
    male_names = [
        "Rahman Ahmed", "Karim Hassan", "Rashid Khan", "Abir Rahman", "Fahim Ahmed",
        "Nasir Uddin", "Tanvir Islam", "Shakib Al Hasan", "Rifat Ahmed", "Mahbub Alam",
        "Saiful Islam", "Mizanur Rahman", "Aminul Haque", "Jahangir Khan", "Raihanul Islam",
        "Ashraful Alam", "Billal Ahmed", "Delwar Hossain", "Enamul Haque", "Ferdous Rahman"
    ]
    
    female_names = [
        "Fatima Khatun", "Rashida Begum", "Nasreen Ahmed", "Salma Khatun", "Rehana Begum",
        "Shahida Rahman", "Taslima Khatun", "Umme Salma", "Wahida Begum", "Yasmin Akter",
        "Zakia Sultana", "Ayesha Siddika", "Bristy Rahman", "Chameli Begum", "Dilruba Khatun",
        "Eshita Ahmed", "Fahmida Rahman", "Gulshan Ara", "Habiba Khatun", "Israt Jahan"
    ]
    
    father_names = [
        "Abdul Rahman", "Mohammad Hassan", "Shah Alam", "Nurul Islam", "Abdur Rashid",
        "Mizanur Rahman", "Shahjahan Ali", "Rafiqul Islam", "Mahabubul Haque", "Nazrul Islam",
        "Aminul Haque", "Jahangir Ahmed", "Saiful Islam", "Delwar Hossain", "Billal Ahmed"
    ]
    
    mother_names = [
        "Rashida Begum", "Fatima Khatun", "Salma Begum", "Nasreen Ahmed", "Rehana Khatun",
        "Shahida Rahman", "Taslima Begum", "Umme Kulsum", "Wahida Khatun", "Yasmin Begum",
        "Zakia Rahman", "Ayesha Khatun", "Bristy Begum", "Chameli Rahman", "Dilruba Ahmed"
    ]
    
    # Create 100 students across different batches
    for i in range(100):
        # Distribute students across batches
        batch = batches[i % len(batches)]
        
        # Randomly assign gender
        gender = random.choice([Gender.MALE, Gender.FEMALE])
        
        if gender == Gender.MALE:
            student_name = male_names[i % len(male_names)]
        else:
            student_name = female_names[i % len(female_names)]
            
        father_name = father_names[i % len(father_names)]
        mother_name = mother_names[i % len(mother_names)]
        
        # Check if student already exists
        existing_student = session.exec(select(Student).where(Student.full_name == student_name)).first()
        if existing_student:
            students.append(existing_student)
            continue
        
        # Create user for student
        email = f"student{i+1}@edudemy.com"
        username = f"student{i+1}"
        
        existing_user = session.exec(select(User).where(User.email == email)).first()
        if existing_user:
            user_id = existing_user.id
        else:
            user = User(
                email=email,
                username=username,
                full_name=student_name,
                role=UserRole.STUDENT,
                hashed_password=hashlib.sha256("password123".encode()).hexdigest(),
                is_active=True,
                phone=f"01{random.randint(300000000, 999999999)}"
            )
            session.add(user)
            session.commit()
            session.refresh(user)
            user_id = user.id
        
        # Generate realistic birth date (15-19 years old)
        birth_year = datetime.now().year - random.randint(15, 19)
        birth_month = random.randint(1, 12)
        birth_day = random.randint(1, 28)
        date_of_birth = datetime(birth_year, birth_month, birth_day)
        
        # Create student
        student = Student(
            user_id=user_id,
            full_name=student_name,
            father_name=father_name,
            mother_name=mother_name,
            gender=gender,
            date_of_birth=date_of_birth,
            address=f"Road {random.randint(1, 50)}, Block {random.choice(['A', 'B', 'C', 'D'])}, Dhaka-{random.randint(1200, 1230)}",
            class_name=batch.class_name,
            batch_id=batch.id,
            version=batch.version,
            current_school=random.choice([
                "Dhaka High School", "Model College", "Ideal School", 
                "Government School", "Private Academy"
            ]),
            student_reg_number=f"2024-{batch.class_name.replace(' ', '')}-{batch.version}-{i+1:04d}",
            student_roll_number=f"{i+1:03d}",
            student_contact=f"01{random.randint(300000000, 999999999)}",
            father_contact=f"01{random.randint(700000000, 999999999)}",
            mother_contact=f"01{random.randint(700000000, 999999999)}",
            admission_date=datetime.now() - timedelta(days=random.randint(30, 365)),
            admission_serial=i + 1
        )
        
        session.add(student)
        session.commit()
        session.refresh(student)
        students.append(student)
        
        # Update batch student count
        batch.current_students_count = len([s for s in students if s.batch_id == batch.id])
        session.add(batch)
    
    session.commit()
    return students

def create_attendance_data(session: Session, students: List[Student], teachers: List[Teacher], batches: List[Batch]):
    """Create realistic attendance data for the last 3 months"""
    subjects = ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Bangla"]
    
    # Generate data for the last 90 days
    start_date = datetime.now() - timedelta(days=90)
    
    for student in students:
        batch = next((b for b in batches if b.id == student.batch_id), batches[0])
        
        # Student attendance pattern (some students are more regular than others)
        base_attendance_rate = random.uniform(0.75, 0.98)  # 75% to 98% attendance
        lateness_tendency = random.uniform(0.02, 0.15)     # 2% to 15% late rate
        
        for day in range(90):
            current_date = start_date + timedelta(days=day)
            
            # Skip weekends (assuming Friday is off)
            if current_date.weekday() == 4:  # Friday
                continue
            
            # Simulate classes for each subject (not every subject every day)
            daily_subjects = random.sample(subjects, random.randint(2, 4))
            
            for subject in daily_subjects:
                teacher = random.choice(teachers)  # Random teacher for now
                
                # Determine attendance
                is_present = random.random() < base_attendance_rate
                is_late = False
                minutes_late = None
                absence_type = None
                
                if is_present and random.random() < lateness_tendency:
                    is_late = True
                    minutes_late = random.randint(5, 30)
                
                if not is_present:
                    # Categorize absence
                    absence_types = ["regular", "sick", "emergency"]
                    weights = [0.6, 0.3, 0.1]
                    absence_type = np.random.choice(absence_types, p=weights)
                    
                    # Holiday absences (more likely around holidays)
                    if current_date.month in [12, 1] and random.random() < 0.3:
                        absence_type = random.choice(["holiday_before", "holiday_after"])
                
                # Participation and behavior scores
                if is_present:
                    participation_score = random.uniform(0.6, 1.0)
                    behavior_score = random.uniform(0.7, 1.0)
                    
                    # Late students might have slightly lower participation
                    if is_late:
                        participation_score *= 0.9
                else:
                    participation_score = 0.0
                    behavior_score = 0.0
                
                attendance = AttendanceExtended(
                    student_id=student.id,
                    teacher_id=teacher.id,
                    batch_id=student.batch_id,
                    class_date=current_date,
                    subject=subject,
                    is_present=is_present,
                    is_late=is_late,
                    minutes_late=minutes_late,
                    absence_type=absence_type,
                    is_excused=absence_type in ["sick", "emergency"] and random.random() < 0.8,
                    participation_score=participation_score,
                    behavior_score=behavior_score,
                )
                session.add(attendance)
    
    session.commit()
    print(f"✅ Created attendance records for {len(students)} students")

def create_homework_data(session: Session, students: List[Student], teachers: List[Teacher]):
    """Create realistic homework submission data"""
    subjects = ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Bangla"]
    
    # Generate homework assignments for the last 60 days
    start_date = datetime.now() - timedelta(days=60)
    
    homework_titles = {
        "Mathematics": ["Algebra Problems", "Geometry Exercise", "Calculus Practice", "Statistics Assignment"],
        "Physics": ["Motion Problems", "Electricity Numericals", "Optics Questions", "Thermodynamics"],
        "Chemistry": ["Organic Reactions", "Chemical Bonding", "Acid-Base Problems", "Periodic Table"],
        "Biology": ["Cell Division", "Genetics Problems", "Ecology Assignment", "Plant Biology"],
        "English": ["Essay Writing", "Grammar Exercise", "Literature Analysis", "Vocabulary Test"],
        "Bangla": ["Composition", "Grammar Practice", "Poetry Analysis", "Story Writing"]
    }
    
    for student in students:
        # Student homework performance pattern
        submission_rate = random.uniform(0.7, 0.98)  # 70% to 98% submission rate
        quality_tendency = random.uniform(0.6, 0.95)  # Base quality tendency
        punctuality_rate = random.uniform(0.75, 0.95)  # On-time submission rate
        
        # Generate 3-4 homework assignments per week per subject
        for week in range(8):  # 8 weeks of data
            week_start = start_date + timedelta(weeks=week)
            
            for subject in random.sample(subjects, 4):  # 4 subjects per week
                for hw_num in range(random.randint(2, 4)):  # 2-4 homework per subject per week
                    teacher = random.choice(teachers)
                    assigned_date = week_start + timedelta(days=random.randint(0, 6))
                    due_date = assigned_date + timedelta(days=random.randint(2, 7))
                    
                    title = random.choice(homework_titles[subject])
                    
                    # Determine if submitted
                    is_submitted = random.random() < submission_rate
                    submitted_date = None
                    is_on_time = False
                    submission_quality = None
                    max_marks = random.choice([10, 15, 20, 25])
                    marks_obtained = None
                    
                    if is_submitted:
                        # Determine submission timing
                        is_on_time = random.random() < punctuality_rate
                        
                        if is_on_time:
                            submitted_date = due_date - timedelta(days=random.randint(0, 2))
                        else:
                            submitted_date = due_date + timedelta(days=random.randint(1, 5))
                        
                        # Quality assessment
                        base_quality = quality_tendency
                        if not is_on_time:
                            base_quality *= 0.85  # Late submissions might have lower quality
                        
                        submission_quality = min(1.0, max(0.3, random.gauss(base_quality, 0.15)))
                        
                        # Marks based on quality
                        marks_obtained = max_marks * submission_quality * random.uniform(0.8, 1.1)
                        marks_obtained = min(max_marks, max(0, marks_obtained))
                        
                        # Grade assignment
                        percentage = (marks_obtained / max_marks) * 100
                        if percentage >= 90:
                            grade = "A+"
                        elif percentage >= 80:
                            grade = "A"
                        elif percentage >= 70:
                            grade = "B"
                        elif percentage >= 60:
                            grade = "C"
                        else:
                            grade = "D"
                    
                    homework = HomeworkSubmission(
                        student_id=student.id,
                        teacher_id=teacher.id,
                        subject=subject,
                        title=title,
                        assigned_date=assigned_date,
                        due_date=due_date,
                        submitted_date=submitted_date,
                        is_submitted=is_submitted,
                        submission_quality=submission_quality,
                        is_on_time=is_on_time,
                        max_marks=max_marks,
                        marks_obtained=marks_obtained,
                        grade=grade if is_submitted else None
                    )
                    session.add(homework)
    
    session.commit()
    print(f"✅ Created homework submissions for {len(students)} students")

def create_classwork_data(session: Session, students: List[Student], teachers: List[Teacher]):
    """Create realistic classwork participation data"""
    subjects = ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Bangla"]
    
    topics = {
        "Mathematics": ["Quadratic Equations", "Trigonometry", "Coordinate Geometry", "Probability"],
        "Physics": ["Kinematics", "Electric Current", "Wave Motion", "Modern Physics"],
        "Chemistry": ["Chemical Equilibrium", "Electrochemistry", "Organic Chemistry", "Solutions"],
        "Biology": ["Photosynthesis", "Respiration", "Genetics", "Evolution"],
        "English": ["Grammar Rules", "Comprehension", "Essay Writing", "Literature"],
        "Bangla": ["Grammar", "Composition", "Poetry", "Prose"]
    }
    
    start_date = datetime.now() - timedelta(days=60)
    
    for student in students:
        # Student classwork performance patterns
        participation_tendency = random.uniform(0.6, 0.95)
        understanding_tendency = random.uniform(0.55, 0.92)
        quality_tendency = random.uniform(0.6, 0.90)
        
        # Generate classwork data for 60 days
        for day in range(60):
            current_date = start_date + timedelta(days=day)
            
            # Skip weekends
            if current_date.weekday() in [4, 5]:  # Friday, Saturday
                continue
            
            # 2-4 subjects per day
            daily_subjects = random.sample(subjects, random.randint(2, 4))
            
            for subject in daily_subjects:
                teacher = random.choice(teachers)
                topic = random.choice(topics[subject])
                
                # Performance metrics with some correlation
                participation = min(1.0, max(0.2, random.gauss(participation_tendency, 0.2)))
                
                # Understanding often correlates with participation
                understanding_base = understanding_tendency
                if participation < 0.5:
                    understanding_base *= 0.7
                understanding = min(1.0, max(0.1, random.gauss(understanding_base, 0.2)))
                
                # Quality correlates with both participation and understanding
                quality_base = quality_tendency * 0.7 + (participation * 0.15) + (understanding * 0.15)
                quality = min(1.0, max(0.2, random.gauss(quality_base, 0.15)))
                
                classwork = ClassworkSubmission(
                    student_id=student.id,
                    teacher_id=teacher.id,
                    subject=subject,
                    class_date=current_date,
                    topic=topic,
                    participation_level=participation,
                    understanding_level=understanding,
                    submission_quality=quality,
                    teacher_notes=f"Covered {topic} - {'Good' if quality > 0.7 else 'Needs improvement'} performance"
                )
                session.add(classwork)
    
    session.commit()
    print(f"✅ Created classwork records for {len(students)} students")

def create_exam_data(session: Session, students: List[Student], teachers: List[Teacher]):
    """Create realistic exam data with answer quality metrics"""
    subjects = ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Bangla"]
    
    start_date = datetime.now() - timedelta(days=90)
    
    for student in students:
        # Student exam performance patterns
        base_performance = random.uniform(0.6, 0.95)  # Base academic ability
        consistency = random.uniform(0.7, 0.95)  # How consistent their performance is
        time_management = random.uniform(0.6, 0.90)  # Time management skills
        
        # Generate exams for the last 3 months
        for week in range(12):  # 12 weeks
            week_start = start_date + timedelta(weeks=week)
            
            # 1-2 exams per week (mix of daily, weekly, monthly)
            for exam_num in range(random.randint(1, 3)):
                subject = random.choice(subjects)
                teacher = random.choice(teachers)
                exam_date = week_start + timedelta(days=random.randint(0, 6))
                
                # Exam type distribution
                exam_types = ["daily", "weekly", "monthly", "midterm"]
                weights = [0.5, 0.3, 0.15, 0.05]
                exam_type = np.random.choice(exam_types, p=weights)
                
                # Max marks based on exam type
                max_marks_map = {"daily": 10, "weekly": 25, "monthly": 100, "midterm": 100}
                max_marks = max_marks_map[exam_type]
                
                # Performance calculation with some randomness
                performance_factor = min(1.0, max(0.2, 
                    random.gauss(base_performance, (1 - consistency) * 0.3)))
                
                marks_obtained = max_marks * performance_factor * random.uniform(0.7, 1.15)
                marks_obtained = min(max_marks, max(0, marks_obtained))
                
                percentage = (marks_obtained / max_marks) * 100
                
                # Grade assignment
                if percentage >= 90:
                    grade = "A+"
                elif percentage >= 80:
                    grade = "A"
                elif percentage >= 70:
                    grade = "B+"
                elif percentage >= 60:
                    grade = "B"
                elif percentage >= 50:
                    grade = "C"
                elif percentage >= 40:
                    grade = "D"
                else:
                    grade = "F"
                
                # Answer quality metrics
                answer_sensibility = min(1.0, max(0.3, 
                    random.gauss(base_performance * 0.85, 0.15)))
                
                completion_rate = min(1.0, max(0.4, 
                    random.gauss(time_management, 0.2)))
                
                unrelated_answer_rate = max(0.0, min(0.4, 
                    random.gauss((1 - base_performance) * 0.3, 0.1)))
                
                handwriting_quality = random.uniform(0.6, 1.0)
                time_management_score = time_management * random.uniform(0.8, 1.1)
                
                # Questions attempted/total
                total_questions = random.randint(5, 15)
                questions_attempted = max(1, int(total_questions * completion_rate))
                
                # Time taken (in minutes)
                exam_duration_map = {"daily": 30, "weekly": 60, "monthly": 120, "midterm": 180}
                max_time = exam_duration_map[exam_type]
                time_taken = max_time * random.uniform(0.6, 1.0)
                
                exam = ExamExtended(
                    student_id=student.id,
                    teacher_id=teacher.id,
                    subject=subject,
                    exam_date=exam_date,
                    exam_type=exam_type,
                    max_marks=max_marks,
                    marks_obtained=round(marks_obtained, 1),
                    percentage=round(percentage, 1),
                    grade=grade,
                    answer_sensibility=round(answer_sensibility, 2),
                    completion_rate=round(completion_rate, 2),
                    unrelated_answer_rate=round(unrelated_answer_rate, 2),
                    handwriting_quality=round(handwriting_quality, 2),
                    time_management=round(time_management_score, 2),
                    time_taken_minutes=int(time_taken),
                    questions_attempted=questions_attempted,
                    questions_total=total_questions,
                    remarks=f"Performance: {'Excellent' if percentage >= 90 else 'Good' if percentage >= 80 else 'Satisfactory' if percentage >= 60 else 'Needs improvement'}"
                )
                session.add(exam)
    
    session.commit()
    print(f"✅ Created exam records for {len(students)} students")

def create_skills_assessments(session: Session, students: List[Student], teachers: List[Teacher]):
    """Create skills assessment data"""
    assessment_types = ["general", "project", "presentation", "group_work"]
    subjects = ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Bangla"]
    
    for student in students:
        # Student skill tendencies (some students are naturally better at certain skills)
        communication_tendency = random.uniform(0.5, 0.95)
        critical_thinking_tendency = random.uniform(0.55, 0.90)
        discipline_tendency = random.uniform(0.6, 0.95)
        study_management_tendency = random.uniform(0.5, 0.90)
        teamwork_tendency = random.uniform(0.6, 0.92)
        leadership_tendency = random.uniform(0.4, 0.85)
        problem_solving_tendency = random.uniform(0.5, 0.92)
        creativity_tendency = random.uniform(0.5, 0.88)
        
        # Generate 5-8 assessments per student over 3 months
        for assessment_num in range(random.randint(5, 8)):
            teacher = random.choice(teachers)
            assessment_type = random.choice(assessment_types)
            subject = random.choice(subjects) if random.random() > 0.3 else None
            
            assessment_date = datetime.now() - timedelta(days=random.randint(1, 90))
            
            # Skills with some variance
            communication = min(1.0, max(0.2, 
                random.gauss(communication_tendency, 0.2)))
            critical_thinking = min(1.0, max(0.2, 
                random.gauss(critical_thinking_tendency, 0.15)))
            discipline = min(1.0, max(0.3, 
                random.gauss(discipline_tendency, 0.15)))
            study_management = min(1.0, max(0.2, 
                random.gauss(study_management_tendency, 0.2)))
            teamwork = min(1.0, max(0.3, 
                random.gauss(teamwork_tendency, 0.2)))
            leadership = min(1.0, max(0.2, 
                random.gauss(leadership_tendency, 0.25)))
            problem_solving = min(1.0, max(0.2, 
                random.gauss(problem_solving_tendency, 0.2)))
            creativity = min(1.0, max(0.3, 
                random.gauss(creativity_tendency, 0.2)))
            
            # Assessment type affects certain skills
            if assessment_type == "presentation":
                communication *= 1.2  # Presentation boosts communication visibility
                leadership *= 1.1
            elif assessment_type == "group_work":
                teamwork *= 1.3
                leadership *= 1.2
            elif assessment_type == "project":
                problem_solving *= 1.2
                creativity *= 1.15
                study_management *= 1.1
            
            # Ensure values stay within bounds
            communication = min(1.0, communication)
            leadership = min(1.0, leadership)
            teamwork = min(1.0, teamwork)
            problem_solving = min(1.0, problem_solving)
            creativity = min(1.0, creativity)
            study_management = min(1.0, study_management)
            
            skills = SkillsAssessment(
                student_id=student.id,
                teacher_id=teacher.id,
                assessment_date=assessment_date,
                communication=round(communication, 2),
                critical_thinking=round(critical_thinking, 2),
                discipline=round(discipline, 2),
                study_management=round(study_management, 2),
                teamwork=round(teamwork, 2),
                leadership=round(leadership, 2),
                problem_solving=round(problem_solving, 2),
                creativity=round(creativity, 2),
                assessment_type=assessment_type,
                subject=subject,
                notes=f"Assessment during {assessment_type} activity" + (f" in {subject}" if subject else "")
            )
            session.add(skills)
    
    session.commit()
    print(f"✅ Created skills assessments for {len(students)} students")

def create_analytics_settings(session: Session):
    """Create default analytics settings"""
    # Check if settings already exist
    existing_settings = session.exec(select(AnalyticsSettings).where(AnalyticsSettings.is_active == True)).first()
    if existing_settings:
        print("✅ Analytics settings already exist")
        return existing_settings
    
    settings = AnalyticsSettings(
        attendance_weight=0.30,
        homework_classwork_weight=0.30,
        exam_weight=0.30,
        skills_weight=0.10,
        calculation_period_days=30,
        minimum_data_points=5,
        auto_calculate=True,
        calculation_frequency_hours=24,
        excellent_threshold=90.0,
        good_threshold=80.0,
        satisfactory_threshold=70.0,
        needs_improvement_threshold=60.0,
        generate_recommendations=True,
        max_recommendations_per_student=5,
        recommendation_refresh_days=7,
        model_retrain_frequency_days=30,
        prediction_enabled=True,
        minimum_training_data=50,
        is_active=True,
        created_by=1  # Assuming superadmin
    )
    
    session.add(settings)
    session.commit()
    session.refresh(settings)
    print("✅ Created analytics settings")
    return settings

def main():
    """Main seeder function"""
    print("🚀 Starting Analytics Data Seeding...")
    
    # Create all tables
    SQLModel.metadata.create_all(engine)
    print("✅ Database tables created/verified")
    
    with Session(engine) as session:
        try:
            # Create test data
            print("\n📝 Creating teachers...")
            teachers = create_test_users_and_teachers(session)
            
            print("\n📚 Creating batches...")
            batches = create_test_batches(session)
            
            print("\n👥 Creating students...")
            students = create_test_students(session, batches)
            
            print("\n📊 Creating attendance data...")
            create_attendance_data(session, students, teachers, batches)
            
            print("\n📝 Creating homework data...")
            create_homework_data(session, students, teachers)
            
            print("\n🏫 Creating classwork data...")
            create_classwork_data(session, students, teachers)
            
            print("\n📋 Creating exam data...")
            create_exam_data(session, students, teachers)
            
            print("\n🎯 Creating skills assessments...")
            create_skills_assessments(session, students, teachers)
            
            print("\n⚙️ Creating analytics settings...")
            create_analytics_settings(session)
            
            print(f"\n🎉 SUCCESS! Created comprehensive test data:")
            print(f"   👨‍🏫 Teachers: {len(teachers)}")
            print(f"   📚 Batches: {len(batches)}")
            print(f"   👥 Students: {len(students)}")
            print(f"   📊 Data spans the last 90 days with realistic patterns")
            print(f"   🎯 Ready for FIFA-style analytics calculation!")
            
        except Exception as e:
            session.rollback()
            print(f"❌ Error during seeding: {e}")
            raise
        
        finally:
            session.close()

if __name__ == "__main__":
    main()