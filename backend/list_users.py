#!/usr/bin/env python3
"""
List all users in the database.
"""

import os
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

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

def list_users():
    """List all users in the database."""
    
    # Create database connection
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    try:
        db = SessionLocal()
        
        print("👥 All users in the database:")
        print("=" * 60)
        
        # Get all users
        all_users = db.query(User).all()
        
        if not all_users:
            print("No users found in the database.")
            return
        
        for user in all_users:
            status = "✅ Active" if user.is_active else "❌ Inactive"
            print(f"ID: {user.id}")
            print(f"Username: {user.username}")
            print(f"Email: {user.email}")
            print(f"Full Name: {user.full_name}")
            print(f"Role: {user.role}")
            print(f"Status: {status}")
            print(f"Created: {user.created_at}")
            print("-" * 60)
        
        # Count by role
        print(f"\nRole distribution:")
        roles = {}
        for user in all_users:
            roles[user.role] = roles.get(user.role, 0) + 1
        
        for role, count in roles.items():
            print(f"  {role}: {count}")
            
        print(f"\nTotal users: {len(all_users)}")
        
    except Exception as e:
        print(f"❌ Error listing users: {e}")
        
    finally:
        db.close()

if __name__ == "__main__":
    print("📋 EduDemy User List")
    print("=" * 40)
    
    list_users()