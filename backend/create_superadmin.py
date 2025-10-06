#!/usr/bin/env python3
"""
Create a superadmin user in the database.
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

def create_superadmin():
    """Create a superadmin user."""
    
    # Create database connection
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    try:
        db = SessionLocal()
        
        print("🔍 Checking existing superadmin users...")
        
        # Check for existing superadmin users
        superadmin_users = db.query(User).filter(User.role == 'superadmin').all()
        
        if len(superadmin_users) > 0:
            print(f"✅ Found {len(superadmin_users)} existing superadmin users:")
            for user in superadmin_users:
                print(f"  - {user.full_name} ({user.username}) - {user.email}")
            
            print("\nℹ️ Superadmin user already exists. Skipping creation.")
            return True
        
        print("\n👤 Creating default superadmin user...")
        
        # Use default values for superadmin
        full_name = "Super Administrator"
        username = "superadmin"
        email = "superadmin@edudemy.local"
        password = "superadmin123"  # Change this in production!
        
        # Check if username or email already exists
        existing_user = db.query(User).filter(
            (User.username == username) | (User.email == email)
        ).first()
        
        if existing_user:
            print("❌ Username or email already exists.")
            return False
        
        # Hash password
        hashed_password = pwd_context.hash(password)
        
        # Create new superadmin user
        new_user = User(
            username=username,
            email=email,
            full_name=full_name,
            hashed_password=hashed_password,
            role='superadmin',
            is_active=True,
            created_at=datetime.utcnow()
        )
        
        db.add(new_user)
        db.commit()
        
        print(f"✅ Successfully created superadmin user: {full_name} ({username})")
        return True
        
    except Exception as e:
        print(f"❌ Error creating superadmin user: {e}")
        db.rollback()
        return False
        
    finally:
        db.close()

if __name__ == "__main__":
    print("👑 EduDemy Superadmin User Creation")
    print("=" * 40)
    
    success = create_superadmin()
    
    if success:
        print("\n🎉 Superadmin user created successfully!")
    else:
        print("\n💥 Failed to create superadmin user!")