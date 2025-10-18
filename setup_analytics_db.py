#!/usr/bin/env python3
"""
Setup Analytics Database Tables
Creates all analytics tables in the database
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from sqlmodel import create_engine, SQLModel

# Database connection
DATABASE_URL = "postgresql://postgres:1122@localhost:5432/edudemy_db"

def setup_database():
    """Create all analytics tables in the database"""
    print("🔧 Setting up analytics database tables...")
    
    try:
        # Import models to register them with SQLModel
        from backend.app.models import Student, Teacher, Batch, User, Exam, Payment, Feedback
        from analytics_models import (
            HomeworkSubmission, ClassworkSubmission, AttendanceExtended,
            SkillsAssessment, ExamExtended, StudentAnalytics, 
            StudentRatingHistory, StudentRecommendation, BatchAnalytics,
            AnalyticsSettings
        )
        
        # Create engine
        engine = create_engine(DATABASE_URL)
        
        # Create all tables
        SQLModel.metadata.create_all(engine)
        
        print("✅ Analytics database tables created successfully!")
        print("   📊 Tables created:")
        print("   - HomeworkSubmission")
        print("   - ClassworkSubmission") 
        print("   - AttendanceExtended")
        print("   - SkillsAssessment")
        print("   - ExamExtended")
        print("   - StudentAnalytics")
        print("   - StudentRatingHistory")
        print("   - StudentRecommendation")
        print("   - BatchAnalytics")
        print("   - AnalyticsSettings")
        
        return True
        
    except Exception as e:
        print(f"❌ Error setting up database: {e}")
        return False

def main():
    """Main setup function"""
    success = setup_database()
    if success:
        print("\n🎉 Database setup completed! You can now run the analytics engine.")
    else:
        print("\n⚠️ Database setup failed. Please check the error above.")

if __name__ == "__main__":
    main()