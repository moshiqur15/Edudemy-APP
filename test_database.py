#!/usr/bin/env python3
"""
Direct Database Test Script
Test tables and data directly through SQLModel
"""
import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from sqlmodel import Session, select
from app.database import engine
from app.models import User, Teacher, Student, Batch

def test_database_tables():
    """Test if we can query basic tables"""
    print("🔍 Testing Database Tables")
    print("=" * 40)
    
    with Session(engine) as session:
        try:
            # Test Users table
            users = session.exec(select(User)).all()
            print(f"✅ Users table: {len(users)} records")
            for user in users:
                print(f"   - {user.username} (role: {user.role})")
        except Exception as e:
            print(f"❌ Users table error: {e}")
        
        try:
            # Test Teachers table
            teachers = session.exec(select(Teacher)).all()
            print(f"✅ Teachers table: {len(teachers)} records")
            for teacher in teachers:
                print(f"   - ID: {teacher.id}, User ID: {teacher.user_id}, Employee ID: {teacher.employee_id}")
        except Exception as e:
            print(f"❌ Teachers table error: {e}")
        
        try:
            # Test Students table
            students = session.exec(select(Student)).all()
            print(f"✅ Students table: {len(students)} records")
        except Exception as e:
            print(f"❌ Students table error: {e}")
        
        try:
            # Test Batches table
            batches = session.exec(select(Batch)).all()
            print(f"✅ Batches table: {len(batches)} records")
        except Exception as e:
            print(f"❌ Batches table error: {e}")

def test_teacher_user_join():
    """Test if we can join Teachers with Users"""
    print("\n🔍 Testing Teacher-User Join")
    print("=" * 40)
    
    with Session(engine) as session:
        try:
            # Try basic teacher query without join
            teachers = session.exec(select(Teacher)).all()
            print(f"✅ Basic teacher query: {len(teachers)} records")
            
            # Try to access user data for each teacher
            for teacher in teachers:
                print(f"   Teacher ID {teacher.id}:")
                print(f"     - Employee ID: {teacher.employee_id}")
                print(f"     - User ID: {teacher.user_id}")
                print(f"     - Subjects: {teacher.subjects}")
                
                if teacher.user_id:
                    try:
                        user = session.get(User, teacher.user_id)
                        if user:
                            print(f"     - User found: {user.username} ({user.full_name})")
                        else:
                            print(f"     - No user found with ID {teacher.user_id}")
                    except Exception as e:
                        print(f"     - Error getting user: {e}")
                
        except Exception as e:
            print(f"❌ Teacher-User join error: {e}")

if __name__ == "__main__":
    test_database_tables()
    test_teacher_user_join()