#!/usr/bin/env python3
"""
Direct SQL approach to create 200 students with analytics
"""

import random
from datetime import datetime, timedelta
from sqlmodel import create_engine, text

DATABASE_URL = "postgresql://postgres:1122@localhost:5432/edudemy_db"

def create_students_direct():
    """Create students using direct SQL"""
    
    print("🚀 Creating 200 Students with Direct SQL...")
    
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        
        # First, let's check existing students
        result = conn.execute(text("SELECT COUNT(*) FROM student"))
        existing_count = result.scalar()
        print(f"📊 Existing students: {existing_count}")
        
        if existing_count >= 200:
            print("✅ Already have 200+ students. Skipping student creation.")
        else:
            # Create users and students  
            print("👥 Creating new students...")
            
            # Name pools
            first_names_male = [
                "Rahul", "Amit", "Ravi", "Arjun", "Sanjay", "Vikash", "Sunil", "Rajesh", "Manoj", "Deepak",
                "Abhishek", "Rohit", "Ajay", "Sachin", "Ankit", "Ashish", "Kiran", "Nitin", "Pankaj", "Sandeep",
                "Mohammad", "Ahmed", "Hassan", "Ibrahim", "Omar", "Karim", "Farid", "Rashid", "Nasir", "Salim"
            ]
            
            first_names_female = [
                "Priya", "Sunita", "Meera", "Kavita", "Sita", "Geeta", "Anita", "Rita", "Nita", "Lata",
                "Shanti", "Poonam", "Renu", "Manju", "Asha", "Usha", "Rekha", "Seema", "Neelam", "Kiran",
                "Fatima", "Ayesha", "Nadia", "Rashida", "Salma", "Nasreen", "Sultana", "Ruma", "Shahida", "Rabeya"
            ]
            
            last_names = [
                "Rahman", "Ahmed", "Khan", "Islam", "Hossain", "Ali", "Alam", "Uddin", "Miah", "Sheikh",
                "Roy", "Das", "Sharma", "Ghosh", "Chakraborty", "Mukherjee", "Banerjee", "Dutta", "Sen", "Pal"
            ]
            
            class_levels = ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "HSC 1st Year", "HSC 2nd Year"]
            
            # Get or create basic batch
            batch_result = conn.execute(text("SELECT id FROM batch LIMIT 1"))
            batch_row = batch_result.first()
            if not batch_row:
                # Create a basic batch
                conn.execute(text("""
                    INSERT INTO batch (name, code, class_name, max_students, current_students_count, status, created_at, updated_at)
                    VALUES ('Main Batch', 'B2025001', 'Class 10', 250, 0, 'active', NOW(), NOW())
                """))
                conn.commit()
                batch_result = conn.execute(text("SELECT id FROM batch LIMIT 1"))
                batch_row = batch_result.first()
            
            batch_id = batch_row[0]
            
            students_to_create = min(200 - existing_count, 200)
            
            for i in range(students_to_create):
                # Random student data
                gender = random.choice(["male", "female"])
                if gender == "male":
                    first_name = random.choice(first_names_male)
                else:
                    first_name = random.choice(first_names_female)
                
                last_name = random.choice(last_names)
                full_name = f"{first_name} {last_name}"
                class_level = random.choice(class_levels)
                
                # Create user
                conn.execute(text("""
                    INSERT INTO "user" (email, username, full_name, role, hashed_password, is_active, created_at, updated_at)
                    VALUES (:email, :username, :full_name, 'student', '$2b$12$dummy_hash', true, NOW(), NOW())
                """), {
                    "email": f"student{existing_count + i + 1}@edudemy.com",
                    "username": f"student{existing_count + i + 1}",
                    "full_name": full_name
                })
                
                # Get the user ID
                user_result = conn.execute(text("SELECT id FROM \"user\" ORDER BY id DESC LIMIT 1"))
                user_id = user_result.scalar()
                
                # Create student
                conn.execute(text("""
                    INSERT INTO student (user_id, full_name, father_name, mother_name, gender, class_name, batch_id, 
                                       version, student_reg_number, admission_date)
                    VALUES (:user_id, :full_name, :father_name, :mother_name, :gender, :class_name, :batch_id,
                            'BV', :reg_number, :admission_date)
                """), {
                    "user_id": user_id,
                    "full_name": full_name,
                    "father_name": f"{random.choice(first_names_male)} {last_name}",
                    "mother_name": f"{random.choice(first_names_female)} {last_name}",
                    "gender": gender,
                    "class_name": class_level,
                    "batch_id": batch_id,
                    "reg_number": f"2025-{existing_count + i + 1:04d}",
                    "admission_date": datetime.now() - timedelta(days=random.randint(30, 365))
                })
                
                if (i + 1) % 50 == 0:
                    conn.commit()
                    print(f"   ✅ Created {i + 1} students")
            
            conn.commit()
            print(f"✅ Created {students_to_create} new students")
            
        # Update batch count
        conn.execute(text("""
            UPDATE batch SET current_students_count = (
                SELECT COUNT(*) FROM student WHERE batch_id = batch.id
            )
        """))
        conn.commit()
        
        # Now let's create comprehensive analytics data  
        print("📊 Creating analytics data...")
        
        # Check if we already have analytics data
        existing_attendance = conn.execute(text("SELECT COUNT(*) FROM attendanceextended")).scalar()
        if existing_attendance > 0:
            print(f"✅ Already have {existing_attendance} attendance records. Skipping analytics creation.")
        else:
            # Get all students
            students = conn.execute(text("SELECT id FROM student")).fetchall()
            print(f"📊 Creating analytics for {len(students)} students...")
        
            subjects = ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Bangla", "ICT"]
            cutoff_date = datetime.now() - timedelta(days=90)
            
            for i, (student_id,) in enumerate(students):
            
            # Student performance profile
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
            
            # Create attendance records (weekdays for 3 months)
            for day in range(90):
                current_date = cutoff_date + timedelta(days=day)
                if current_date.weekday() < 5:  # Weekdays only
                    conn.execute(text("""
                        INSERT INTO attendanceextended (student_id, class_date, subject, is_present, is_late, is_excused, marked_at)
                        VALUES (:student_id, :class_date, :subject, :is_present, :is_late, :is_excused, NOW())
                    """), {
                        "student_id": student_id,
                        "class_date": current_date,
                        "subject": random.choice(subjects),
                        "is_present": random.random() < attendance_rate,
                        "is_late": random.random() < 0.1,
                        "is_excused": False
                    })
            
            # Create homework submissions (weekly for 12 weeks)
            for week in range(12):
                assigned_date = cutoff_date + timedelta(weeks=week)
                due_date = assigned_date + timedelta(days=7)
                is_submitted = random.random() < 0.85
                
                conn.execute(text("""
                    INSERT INTO homeworksubmission (student_id, subject, title, assigned_date, due_date, 
                                                   is_submitted, submission_quality, feedback)
                    VALUES (:student_id, :subject, :title, :assigned_date, :due_date, :is_submitted, :quality, :feedback)
                """), {
                    "student_id": student_id,
                    "subject": random.choice(subjects),
                    "title": f"Week {week+1} Assignment",
                    "assigned_date": assigned_date,
                    "due_date": due_date,
                    "is_submitted": is_submitted,
                    "quality": random.uniform(*hw_quality) if is_submitted else 0.0,
                    "feedback": "Good work" if is_submitted else None
                })
            
            # Create classwork submissions (weekly)
            for week in range(12):
                class_date = cutoff_date + timedelta(weeks=week)
                conn.execute(text("""
                    INSERT INTO classworksubmission (student_id, subject, class_date, topic, submission_quality, 
                                                    understanding_level, participation_level)
                    VALUES (:student_id, :subject, :class_date, :topic, :sub_quality, :understand, :participate)
                """), {
                    "student_id": student_id,
                    "subject": random.choice(subjects),
                    "class_date": class_date,
                    "topic": f"Week {week+1} Topic",
                    "sub_quality": random.uniform(*hw_quality),
                    "understand": random.uniform(*hw_quality),
                    "participate": random.uniform(0.6, 1.0)
                })
            
            # Create exam records (monthly for 3 months)
            for month in range(3):
                for subject in random.sample(subjects, 3):
                    marks = random.uniform(*exam_marks)
                    exam_date = cutoff_date + timedelta(days=30*month + 15)
                    
                    conn.execute(text("""
                        INSERT INTO examextended (student_id, subject, exam_date, exam_type, marks_obtained, 
                                                 max_marks, percentage, answer_sensibility, completion_rate, 
                                                 unrelated_answer_rate)
                        VALUES (:student_id, :subject, :exam_date, :exam_type, :marks, :max_marks, :percentage,
                                :sensibility, :completion, :unrelated)
                    """), {
                        "student_id": student_id,
                        "subject": subject,
                        "exam_date": exam_date,
                        "exam_type": "monthly",
                        "marks": marks,
                        "max_marks": 100,
                        "percentage": marks,
                        "sensibility": random.uniform(0.6, 1.0),
                        "completion": random.uniform(0.7, 1.0),
                        "unrelated": random.uniform(0.0, 0.2)
                    })
            
            # Create skills assessments (monthly for 3 months)
            for month in range(3):
                assessment_date = cutoff_date + timedelta(days=30*month + 20)
                conn.execute(text("""
                    INSERT INTO skillsassessment (student_id, assessment_date, communication, critical_thinking,
                                                 discipline, study_management, assessment_method)
                    VALUES (:student_id, :assessment_date, :comm, :critical, :discipline, :study, :method)
                """), {
                    "student_id": student_id,
                    "assessment_date": assessment_date,
                    "comm": random.uniform(*skills_level),
                    "critical": random.uniform(*skills_level),
                    "discipline": random.uniform(*skills_level),
                    "study": random.uniform(*skills_level),
                    "method": "teacher_observation"
                })
            
            # Commit every 50 students
            if (i + 1) % 50 == 0:
                conn.commit()
                print(f"   ✅ Analytics data for {i+1} students")
        
        conn.commit()
        
        # Create analytics settings
        settings_result = conn.execute(text("SELECT COUNT(*) FROM analyticssettings WHERE is_active = true"))
        if settings_result.scalar() == 0:
            conn.execute(text("""
                INSERT INTO analyticssettings (attendance_weight, homework_classwork_weight, exam_weight, 
                                             skills_weight, is_active, created_at, updated_at)
                VALUES (0.30, 0.30, 0.30, 0.10, true, NOW(), NOW())
            """))
            conn.commit()
        
        # Final summary
        student_count = conn.execute(text("SELECT COUNT(*) FROM student")).scalar()
        attendance_count = conn.execute(text("SELECT COUNT(*) FROM attendanceextended")).scalar()
        homework_count = conn.execute(text("SELECT COUNT(*) FROM homeworksubmission")).scalar()
        exam_count = conn.execute(text("SELECT COUNT(*) FROM examextended")).scalar()
        skills_count = conn.execute(text("SELECT COUNT(*) FROM skillsassessment")).scalar()
        
        print("\n🎉 DATASET CREATION COMPLETED!")
        print("=" * 50)
        print(f"📊 Final Summary:")
        print(f"   👥 Total Students: {student_count}")
        print(f"   📅 Attendance Records: {attendance_count}")
        print(f"   📚 Homework Records: {homework_count}")
        print(f"   📝 Exam Records: {exam_count}")
        print(f"   🧠 Skills Assessments: {skills_count}")
        print(f"   🎯 Ready for analytics and ML training!")

if __name__ == "__main__":
    create_students_direct()