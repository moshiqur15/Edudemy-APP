#!/usr/bin/env python3
"""
Database cleanup script to remove demo accounts except superadmin.
This script will keep only the superadmin user and remove all other demo/test accounts.
"""

import asyncio
import sys
import os
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
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

async def cleanup_demo_accounts():
    """Clean up demo accounts, keeping only superadmin."""
    
    # Create database connection
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    try:
        db = SessionLocal()
        
        print("🔍 Checking existing users...")
        
        # Get all users
        all_users = db.query(User).all()
        print(f"Found {len(all_users)} total users")
        
        # Find superadmin users (case insensitive)
        superadmin_users = db.query(User).filter(User.role.ilike('superadmin')).all()
        print(f"Found {len(superadmin_users)} superadmin users")
        
        if len(superadmin_users) == 0:
            print("❌ No superadmin users found! Cannot proceed with cleanup.")
            print("Please ensure at least one superadmin user exists before running this script.")
            return False
            
        # Show superadmin users that will be kept
        print("\n✅ Superadmin users that will be kept:")
        for user in superadmin_users:
            print(f"  - {user.full_name} ({user.username}) - {user.email}")
        
        # Get non-superadmin users to delete (case insensitive)
        users_to_delete = db.query(User).filter(~User.role.ilike('superadmin')).all()
        
        if len(users_to_delete) == 0:
            print("\n✨ Database is already clean - only superadmin users exist.")
            return True
            
        print(f"\n🗑️  Users to be deleted ({len(users_to_delete)}):")
        for user in users_to_delete:
            print(f"  - {user.full_name or user.username} ({user.role}) - {user.email}")
        
        # Proceed with cleanup (non-interactive for demo)
        print(f"\n🧙 Proceeding with deletion of {len(users_to_delete)} demo users...")
        print(f"Keeping {len(superadmin_users)} superadmin user(s).")
        
        # Delete non-superadmin users
        print(f"\n🧹 Deleting {len(users_to_delete)} demo accounts...")
        
        # Delete users one by one with proper transaction handling
        deleted_count = 0
        
        for user in users_to_delete:
            try:
                print(f"  Deleting {user.full_name or user.username} ({user.role})...")
                
                # Transaction is handled automatically
                
                # Update any users created by this user to NULL
                try:
                    db.execute(text("UPDATE \"user\" SET created_by = NULL WHERE created_by = :user_id"), {"user_id": user.id})
                except Exception:
                    pass  # Column might not exist
                
                # Delete user-related records (ignore if tables don't exist)
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
                print(f"    ✅ Deleted successfully")
                
            except Exception as e:
                db.rollback()
                print(f"    ❌ Failed to delete: {e}")
                continue
        
        print(f"✅ Successfully deleted {deleted_count} demo accounts")
        print(f"✅ Database cleanup completed. {len(superadmin_users)} superadmin users remain.")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during cleanup: {e}")
        db.rollback()
        return False
        
    finally:
        db.close()

if __name__ == "__main__":
    print("🧹 EduDemy Database Cleanup Script")
    print("=" * 40)
    
    # Run the cleanup
    success = asyncio.run(cleanup_demo_accounts())
    
    if success:
        print("\n🎉 Database cleanup completed successfully!")
    else:
        print("\n💥 Database cleanup failed!")
        sys.exit(1)