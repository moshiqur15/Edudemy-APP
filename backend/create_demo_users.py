#!/usr/bin/env python3
"""
Create demo users for testing with proper credentials and cleanup.
This script creates test users for each role with predefined credentials.
"""

import os
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime
from dotenv import load_dotenv
from passlib.context import CryptContext

# Load environment variables
load_dotenv()

# Password context for hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Database URL from environment
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:1122@localhost:5432/edudemy_db')

# Define User model here directly to avoid import issues
Base = declarative_base()

class User(Base):
    __tablename__ = 'user'
    
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    full_name = Column(String(100))
    hashed_password = Column(String(255))
    is_active = Column(Boolean, default=True)
    role = Column(String(20), nullable=False, default='student')
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

# Demo users to create
DEMO_USERS = [
    {
        "username": "demo_admin",
        "email": "demo.admin@edudemy.local",
        "full_name": "Demo Administrator",
        "password": "admin123",
        "role": "admin"
    },
    {
        "username": "demo_manager",
        "email": "demo.manager@edudemy.local",
        "full_name": "Demo Manager",
        "password": "manager123",
        "role": "management"
    },
    {
        "username": "demo_academic",
        "email": "demo.academic@edudemy.local",
        "full_name": "Demo Academic Coordinator",
        "password": "academic123",
        "role": "academics"
    },
    {
        "username": "demo_teacher",
        "email": "demo.teacher@edudemy.local",
        "full_name": "Demo Teacher",
        "password": "teacher123",
        "role": "teacher"
    },
    {
        "username": "demo_student1",
        "email": "demo.student1@edudemy.local",
        "full_name": "Demo Student One",
        "password": "student123",
        "role": "student"
    },
    {
        "username": "demo_student2",
        "email": "demo.student2@edudemy.local",
        "full_name": "Demo Student Two",
        "password": "student123",
        "role": "student"
    }
]

def cleanup_user_credentials(db, user_id, email, username):
    """Clean up user credentials and sessions when user is deleted."""
    try:
        # Clean up user sessions (if you have a sessions table)
        try:
            db.execute(text("DELETE FROM user_sessions WHERE user_id = :user_id"), {"user_id": user_id})
        except Exception:
            pass  # Table might not exist
            
        # Clean up access tokens (if you have a tokens table)  
        try:
            db.execute(text("DELETE FROM access_tokens WHERE user_id = :user_id"), {"user_id": user_id})
        except Exception:
            pass  # Table might not exist
            
        # Clean up refresh tokens
        try:
            db.execute(text("DELETE FROM refresh_tokens WHERE user_id = :user_id"), {"user_id": user_id})
        except Exception:
            pass  # Table might not exist
            
        # Clean up any cached user data (if you have cache tables)
        try:
            db.execute(text("DELETE FROM user_cache WHERE user_id = :user_id"), {"user_id": user_id})
        except Exception:
            pass  # Table might not exist
            
        # Clean up password reset tokens
        try:
            db.execute(text("DELETE FROM password_reset_tokens WHERE email = :email"), {"email": email})
        except Exception:
            pass  # Table might not exist
            
        # Clean up email verification tokens
        try:
            db.execute(text("DELETE FROM email_verification_tokens WHERE email = :email"), {"email": email})
        except Exception:
            pass  # Table might not exist
            
        print(f"    🧹 Cleaned up credentials and sessions for {username}")
        
    except Exception as e:
        print(f"    ⚠️ Warning cleaning credentials for {username}: {e}")

def clean_existing_demo_users(db):
    """Remove existing demo users and their credentials."""
    print("🧹 Cleaning up existing demo users...")
    
    demo_users = db.query(User).filter(User.username.like('demo_%')).all()
    
    if not demo_users:
        print("  ℹ️ No existing demo users found.")
        return 0
        
    deleted_count = 0
    for user in demo_users:
        try:
            print(f"  Removing {user.full_name} ({user.username})...")
            
            # Clean up credentials and sessions
            cleanup_user_credentials(db, user.id, user.email, user.username)
            
            # Clean up user-related records
            try:
                db.execute(text("DELETE FROM userpermission WHERE user_id = :user_id"), {"user_id": user.id})
            except Exception:
                pass
                
            try:
                db.execute(text("DELETE FROM accessrequest WHERE email = :email"), {"email": user.email})
            except Exception:
                pass
                
            try:
                db.execute(text("DELETE FROM notification WHERE user_id = :user_id"), {"user_id": user.id})
            except Exception:
                pass
                
            try:
                db.execute(text("DELETE FROM teacher WHERE user_id = :user_id"), {"user_id": user.id})
            except Exception:
                pass
                
            try:
                db.execute(text("DELETE FROM student WHERE user_id = :user_id"), {"user_id": user.id})
            except Exception:
                pass
            
            # Delete the user
            db.delete(user)
            db.commit()
            deleted_count += 1
            print(f"    ✅ Removed successfully")
            
        except Exception as e:
            db.rollback()
            print(f"    ❌ Failed to remove: {e}")
            continue
            
    return deleted_count

def create_demo_users():
    """Create demo users for testing."""
    
    # Create database connection
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    try:
        db = SessionLocal()
        
        print("👥 EduDemy Demo Users Creation")
        print("=" * 50)
        
        # Clean up existing demo users first
        deleted_count = clean_existing_demo_users(db)
        if deleted_count > 0:
            print(f"✅ Removed {deleted_count} existing demo users\n")
        
        print("🚀 Creating new demo users...")
        created_count = 0
        
        for user_data in DEMO_USERS:
            try:
                print(f"  Creating {user_data['full_name']} ({user_data['role']})...")
                
                # Hash password
                hashed_password = pwd_context.hash(user_data['password'])
                
                # Create new user
                new_user = User(
                    username=user_data['username'],
                    email=user_data['email'],
                    full_name=user_data['full_name'],
                    hashed_password=hashed_password,
                    role=user_data['role'].upper(),  # Store in uppercase to match existing pattern
                    is_active=True,
                    created_at=datetime.utcnow()
                )
                
                db.add(new_user)
                db.commit()
                created_count += 1
                print(f"    ✅ Created successfully")
                
            except Exception as e:
                db.rollback()
                print(f"    ❌ Failed to create: {e}")
                continue
        
        print(f"\n🎉 Successfully created {created_count} demo users!")
        
        # Display credentials
        print("\n📋 Demo User Credentials:")
        print("=" * 50)
        for user_data in DEMO_USERS:
            print(f"👤 {user_data['full_name']}")
            print(f"   Role: {user_data['role']}")
            print(f"   Username: {user_data['username']}")
            print(f"   Email: {user_data['email']}")
            print(f"   Password: {user_data['password']}")
            print("-" * 30)
        
        return True
        
    except Exception as e:
        print(f"❌ Error during demo user creation: {e}")
        db.rollback()
        return False
        
    finally:
        db.close()

if __name__ == "__main__":
    print("🎭 EduDemy Demo Users Setup")
    print("=" * 40)
    
    success = create_demo_users()
    
    if success:
        print("\n🎉 Demo users setup completed successfully!")
        print("\nYou can now test the User Management system with these accounts.")
    else:
        print("\n💥 Demo users setup failed!")