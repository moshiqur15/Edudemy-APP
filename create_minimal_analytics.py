#!/usr/bin/env python3
"""
Create minimal analytics data for 200 students for testing
"""

import random
from datetime import datetime, timedelta
from sqlmodel import create_engine, text

DATABASE_URL = "postgresql://postgres:1122@localhost:5432/edudemy_db"

def create_minimal_analytics():
    """Create minimal analytics for testing"""
    
    print("📊 Creating Minimal Analytics Data...")
    
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        
        # Get student count
        student_count = conn.execute(text("SELECT COUNT(*) FROM student")).scalar()
        print(f"👥 Found {student_count} students")
        
        # Check existing analytics
        attendance_count = conn.execute(text("SELECT COUNT(*) FROM attendanceextended")).scalar()
        if attendance_count > 0:
            print(f"✅ Already have {attendance_count} attendance records")
        else:
            print("📅 Creating basic attendance data...")
            # Just create a few attendance records per student
            students = conn.execute(text("SELECT id FROM student LIMIT 50")).fetchall()  # First 50 students
            for i, (student_id,) in enumerate(students):
                # Create 10 attendance records per student
                for day in range(10):
                    current_date = datetime.now() - timedelta(days=day*2)
                    conn.execute(text("""
                        INSERT INTO attendanceextended (student_id, class_date, subject, is_present, is_late, is_excused, marked_at)
                        VALUES (:student_id, :class_date, :subject, :is_present, :is_late, false, NOW())
                    """), {
                        "student_id": student_id,
                        "class_date": current_date,
                        "subject": "Mathematics",
                        "is_present": random.random() < 0.85,
                        "is_late": random.random() < 0.1
                    })
                
                if (i + 1) % 10 == 0:
                    conn.commit()
                    print(f"   ✅ Created attendance for {i + 1} students")
            
            conn.commit()
            print("✅ Basic attendance data created")
        
        # Create analytics settings
        settings_count = conn.execute(text("SELECT COUNT(*) FROM analyticssettings WHERE is_active = true")).scalar()
        if settings_count == 0:
            conn.execute(text("""
                INSERT INTO analyticssettings (attendance_weight, homework_classwork_weight, exam_weight, 
                                             skills_weight, calculation_period_days, minimum_data_points,
                                             auto_calculate, calculation_frequency_hours, 
                                             excellent_threshold, good_threshold, satisfactory_threshold,
                                             needs_improvement_threshold, generate_recommendations,
                                             max_recommendations_per_student, recommendation_refresh_days,
                                             model_retrain_frequency_days, prediction_enabled,
                                             minimum_training_data, is_active, created_at, updated_at)
                VALUES (0.30, 0.30, 0.30, 0.10, 30, 10, true, 24, 85.0, 75.0, 65.0, 50.0, true, 5, 30, 7, true, 50, true, NOW(), NOW())
            """))
            conn.commit()
            print("✅ Analytics settings created")
        
        # Final summary
        final_student_count = conn.execute(text("SELECT COUNT(*) FROM student")).scalar()
        final_attendance_count = conn.execute(text("SELECT COUNT(*) FROM attendanceextended")).scalar()
        batch_count = conn.execute(text("SELECT COUNT(*) FROM batch")).scalar()
        
        print("\n🎉 MINIMAL DATASET READY!")
        print("=" * 40)
        print(f"📊 Summary:")
        print(f"   👥 Students: {final_student_count}")
        print(f"   📚 Batches: {batch_count}")
        print(f"   📅 Attendance Records: {final_attendance_count}")
        print(f"   ⚙️ Analytics Settings: Ready")
        print(f"   🎯 Ready for analytics testing!")

if __name__ == "__main__":
    create_minimal_analytics()