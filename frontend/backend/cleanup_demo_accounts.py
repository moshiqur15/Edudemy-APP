#!/usr/bin/env python3
"""
Database cleanup script to remove demo accounts except superadmin.
This script will keep only the superadmin user and remove all other demo/test accounts.
"""

import asyncio
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine, text
from app.core.config import settings
from app.models import User
from app.core.database import get_db
import sys

async def cleanup_demo_accounts():
    """Clean up demo accounts, keeping only superadmin."""
    
    # Create database connection
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    try:
        db = SessionLocal()
        
        print("🔍 Checking existing users...")
        
        # Get all users
        all_users = db.query(User).all()
        print(f"Found {len(all_users)} total users")
        
        # Find superadmin users
        superadmin_users = db.query(User).filter(User.role == 'superadmin').all()
        print(f"Found {len(superadmin_users)} superadmin users")
        
        if len(superadmin_users) == 0:
            print("❌ No superadmin users found! Cannot proceed with cleanup.")
            print("Please ensure at least one superadmin user exists before running this script.")
            return False
            
        # Show superadmin users that will be kept
        print("\n✅ Superadmin users that will be kept:")
        for user in superadmin_users:
            print(f"  - {user.full_name} ({user.username}) - {user.email}")
        
        # Get non-superadmin users to delete
        users_to_delete = db.query(User).filter(User.role != 'superadmin').all()
        
        if len(users_to_delete) == 0:
            print("\n✨ Database is already clean - only superadmin users exist.")
            return True
            
        print(f"\n🗑️  Users to be deleted ({len(users_to_delete)}):")
        for user in users_to_delete:
            print(f"  - {user.full_name or user.username} ({user.role}) - {user.email}")
        
        # Ask for confirmation
        print(f"\nThis will delete {len(users_to_delete)} users, keeping only {len(superadmin_users)} superadmin users.")
        confirm = input("Are you sure you want to proceed? (yes/no): ").lower().strip()
        
        if confirm != 'yes':
            print("❌ Operation cancelled.")
            return False
        
        # Delete non-superadmin users
        print(f"\n🧹 Deleting {len(users_to_delete)} demo accounts...")
        
        # Delete related records first to avoid foreign key constraints
        deleted_count = 0
        for user in users_to_delete:
            try:
                # Delete user permissions
                db.execute(text("DELETE FROM userpermission WHERE user_id = :user_id"), {"user_id": user.id})
                
                # Delete access requests
                db.execute(text("DELETE FROM accessrequest WHERE email = :email"), {"email": user.email})
                
                # Delete other related records as needed
                # Add more cleanup here if you have other tables with foreign keys to users
                
                # Delete the user
                db.delete(user)
                deleted_count += 1
                
            except Exception as e:
                print(f"❌ Error deleting user {user.username}: {e}")
                continue
        
        # Commit the changes
        db.commit()
        
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