#!/usr/bin/env python3
"""
Database schema migration script to fix student table columns
"""
import sys
import os
sys.path.append('backend/app')

try:
    from backend.app.database import engine
    from sqlalchemy import text
    
    print("🔧 Starting database schema migration...")
    
    # Check current student table schema
    with engine.connect() as connection:
        print("📋 Checking current student table schema...")
        result = connection.execute(text("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'student' 
            ORDER BY ordinal_position;
        """))
        
        current_columns = []
        for row in result.fetchall():
            current_columns.append(row[0])
            print(f"  - {row[0]} ({row[1]}, nullable: {row[2]})")
        
        # Check if we need to add missing columns
        needed_columns = {
            'father_name': 'VARCHAR',
            'mother_name': 'VARCHAR',
            'gender': 'VARCHAR DEFAULT \'male\'',
            'class_name': 'VARCHAR DEFAULT \'Class 10\'',
            'version': 'VARCHAR DEFAULT \'BV\'',
            'current_school': 'VARCHAR',
            'student_contact': 'VARCHAR',
            'father_contact': 'VARCHAR', 
            'mother_contact': 'VARCHAR',
            'student_reg_number': 'VARCHAR',
            'student_roll_number': 'VARCHAR',
            'admission_serial': 'INTEGER'
        }
        
    # Add missing columns
    with engine.connect() as conn:
        print("\n🔄 Adding missing columns...")
        for column_name, column_type in needed_columns.items():
            if column_name not in current_columns:
                print(f"➕ Adding missing column: {column_name}")
                conn.execute(text(f"ALTER TABLE student ADD COLUMN {column_name} {column_type}"))
                conn.commit()
            else:
                print(f"✅ Column {column_name} already exists")
        
        print("✅ Schema migration completed successfully!")
    
    # Now test if we can query students
    print("\n🧪 Testing student query after migration...")
    from sqlmodel import Session, select
    from backend.app.models import Student
    
    with Session(engine) as session:
        students = session.exec(select(Student)).all()
        print(f"✅ Successfully queried students table: {len(students)} students found")
    
    # Test creating a sample student
    print("\n👨‍🎓 Testing student creation...")
    from backend.app.models import Student, Gender, StudentVersion
    from datetime import datetime
    
    with Session(engine) as session:
        # Check if test student already exists
        existing = session.exec(select(Student).where(Student.full_name == "Test Student")).first()
        if existing:
            print("✅ Test student already exists")
        else:
            test_student = Student(
                full_name="Test Student",
                father_name="Test Father",
                mother_name="Test Mother", 
                gender=Gender.MALE,
                class_name="Class 10",
                version=StudentVersion.BV,
                admission_date=datetime.utcnow()
            )
            session.add(test_student)
            session.commit()
            session.refresh(test_student)
            print(f"✅ Test student created successfully with ID: {test_student.id}")
    
    print("\n🎉 Database is now ready!")
    print("You can now access the students API without errors.")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()