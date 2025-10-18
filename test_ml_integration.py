#!/usr/bin/env python3
"""
Test Script for ML Analytics Integration
Tests the real-time ML analytics system with database integration
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

import requests
import json
from datetime import datetime

def test_backend_endpoints():
    """Test the backend API endpoints"""
    base_url = "http://localhost:8000/api"
    
    print("🧪 Testing Backend ML Analytics Endpoints")
    print("=" * 50)
    
    # Test priority alerts
    print("\n1. Testing Priority Alerts Endpoint...")
    try:
        response = requests.get(f"{base_url}/students/analytics/priority-alerts")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Priority alerts loaded successfully")
            print(f"   📊 Critical: {len(data.get('critical', []))}, High Priority: {len(data.get('high_priority', []))}, Medium: {len(data.get('medium_priority', []))}")
            
            if data.get('critical'):
                print(f"   🚨 Sample critical student: {data['critical'][0]['name']} (FIFA: {data['critical'][0]['fifa_rating']:.1f})")
        else:
            print(f"   ❌ Failed: Status {response.status_code}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test dashboard summary
    print("\n2. Testing Dashboard Summary Endpoint...")
    try:
        response = requests.get(f"{base_url}/students/analytics/dashboard-summary")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Dashboard summary loaded successfully")
            stats = data.get('system_stats', {})
            print(f"   📊 Students: {stats.get('total_students')}, Avg FIFA: {stats.get('avg_fifa_rating', 0):.1f}, High Risk: {stats.get('high_risk_students', 0)}")
            print(f"   📚 Classes: {len(data.get('class_performance', []))}")
        else:
            print(f"   ❌ Failed: Status {response.status_code}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test ML model training
    print("\n3. Testing ML Model Training Endpoint...")
    try:
        response = requests.post(f"{base_url}/students/analytics/train-ml-model")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ ML model training completed")
            if data.get('status') == 'success':
                print(f"   🤖 Training successful!")
                if 'model_stats' in data:
                    stats = data['model_stats']
                    print(f"   📈 R² Score: {stats.get('r2_score', 0):.3f}, Training Samples: {stats.get('training_samples', 0)}")
            else:
                print(f"   ⚠️ Training status: {data.get('message', 'Unknown')}")
        else:
            print(f"   ❌ Failed: Status {response.status_code}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test analytics refresh
    print("\n4. Testing Analytics Refresh Endpoint...")
    try:
        response = requests.post(f"{base_url}/students/analytics/refresh-all")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Analytics refresh completed")
            print(f"   📊 Processed: {data.get('processed_count', 0)}, Errors: {data.get('error_count', 0)}")
        else:
            print(f"   ❌ Failed: Status {response.status_code}")
    except Exception as e:
        print(f"   ❌ Error: {e}")

def test_direct_ml_engine():
    """Test the ML analytics engine directly"""
    print("\n🔬 Testing Direct ML Analytics Engine")
    print("=" * 50)
    
    try:
        from sqlmodel import create_engine, Session
        from student_analytics_engine import StudentAnalyticsEngine
        
        # Database connection
        DATABASE_URL = "postgresql://postgres:1122@localhost:5432/edudemy_db"
        engine = create_engine(DATABASE_URL)
        
        with Session(engine) as session:
            analytics_engine = StudentAnalyticsEngine(session)
            
            # Get first few students
            from sqlalchemy import text
            students = session.exec(text("SELECT id, full_name FROM student WHERE is_active = true LIMIT 3")).fetchall()
            
            print(f"\n📋 Testing with {len(students)} students...")
            
            for student_row in students:
                student_id, student_name = student_row
                try:
                    print(f"\n   🎓 Analyzing: {student_name} (ID: {student_id})")
                    
                    # Calculate analytics
                    analytics = analytics_engine.calculate_student_analytics(student_id)
                    
                    ratings = analytics['ratings']
                    print(f"   🏆 FIFA Rating: {ratings['fifa_rating']:.1f}")
                    print(f"   📅 Attendance: {ratings['attendance_rating']:.1f}")
                    print(f"   📚 Homework: {ratings['homework_classwork_rating']:.1f}")
                    print(f"   📝 Exams: {ratings['exam_rating']:.1f}")
                    print(f"   🧠 Skills: {ratings['skill_rating']:.1f}")
                    print(f"   ⚠️ Risk Level: {analytics['risk_level']}")
                    print(f"   💡 Recommendations: {len(analytics.get('recommendations', []))}")
                    
                    # Save to database
                    analytics_engine.save_analytics_to_database(analytics)
                    print(f"   ✅ Saved to database")
                    
                except Exception as e:
                    print(f"   ❌ Error analyzing {student_name}: {e}")
            
            print(f"\n🤖 Testing ML Model Training...")
            try:
                model_stats = analytics_engine.train_ml_model()
                if model_stats:
                    print(f"   ✅ ML Model trained successfully!")
                    print(f"   📊 R² Score: {model_stats['r2_score']:.3f}")
                    print(f"   📈 MSE: {model_stats['mse']:.3f}")
                    print(f"   👥 Training Samples: {model_stats['training_samples']}")
                else:
                    print(f"   ⚠️ ML Model training skipped (insufficient data or sklearn unavailable)")
            except Exception as e:
                print(f"   ❌ ML Training Error: {e}")
                
    except ImportError as e:
        print(f"   ❌ Import Error: {e}")
        print(f"   📝 Make sure the ML analytics engine and database models are available")
    except Exception as e:
        print(f"   ❌ Error: {e}")

def main():
    """Main test function"""
    print("🚀 ML Analytics Integration Test")
    print("=" * 60)
    print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test backend endpoints
    test_backend_endpoints()
    
    # Test direct ML engine
    test_direct_ml_engine()
    
    print("\n" + "=" * 60)
    print("🎉 ML Analytics Integration Test Completed!")
    print(f"⏰ Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main()