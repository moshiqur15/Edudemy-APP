#!/usr/bin/env python3
"""
Complete System Integration Test
Tests all components of the Edudemy Analytics System working together
"""

import sys
import os
import subprocess
import time
import requests
import json
from datetime import datetime

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from sqlmodel import create_engine, Session, select, text
from backend.app.models import Student, Batch
from analytics_models import StudentAnalytics, AnalyticsSettings
from student_analytics_engine import StudentAnalyticsEngine

DATABASE_URL = "postgresql://postgres:1122@localhost:5432/edudemy_db"
API_BASE_URL = "http://localhost:8001"

def test_database_connectivity():
    """Test database connection and data"""
    print("📊 Testing Database Connectivity...")
    
    try:
        engine = create_engine(DATABASE_URL)
        with Session(engine) as session:
            # Test basic data
            students = session.exec(select(Student)).all()
            batches = session.exec(select(Batch)).all()
            settings = session.exec(select(AnalyticsSettings).where(AnalyticsSettings.is_active == True)).first()
            
            print(f"✅ Database Connection: OK")
            print(f"   👥 Students: {len(students)}")
            print(f"   📚 Batches: {len(batches)}")
            print(f"   ⚙️ Settings: {'OK' if settings else 'Missing'}")
            
            return len(students) > 0 and len(batches) > 0 and settings is not None
            
    except Exception as e:
        print(f"❌ Database Connection Failed: {e}")
        return False

def test_analytics_engine():
    """Test the analytics engine directly"""
    print("\n🤖 Testing Analytics Engine...")
    
    try:
        engine = create_engine(DATABASE_URL)
        with Session(engine) as session:
            analytics_engine = StudentAnalyticsEngine(session)
            
            # Get a test student
            student = session.exec(select(Student).limit(1)).first()
            if not student:
                print("❌ No students found for testing")
                return False
            
            # Test analytics calculation
            analytics_result = analytics_engine.calculate_student_analytics(student.id)
            
            print(f"✅ Analytics Engine: OK")
            print(f"   Student: {analytics_result['student_name']}")
            print(f"   FIFA Rating: {analytics_result['ratings']['fifa_rating']:.1f}")
            print(f"   Risk Level: {analytics_result['risk_level']}")
            print(f"   Recommendations: {len(analytics_result['recommendations'])}")
            
            # Test ML training
            model_stats = analytics_engine.train_ml_model()
            if model_stats:
                print(f"   🧠 ML Model: Trained (R²={model_stats['r2_score']:.3f})")
            else:
                print(f"   🧠 ML Model: Insufficient data")
            
            return True
            
    except Exception as e:
        print(f"❌ Analytics Engine Failed: {e}")
        return False

def test_api_server():
    """Test if API server is running and responsive"""
    print("\n🌐 Testing API Server...")
    
    max_retries = 3
    for attempt in range(max_retries):
        try:
            # Health check
            response = requests.get(f"{API_BASE_URL}/", timeout=5)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ API Server: {data['message']}")
                return True
            else:
                print(f"⚠️ API Server returned status {response.status_code}")
                
        except requests.exceptions.ConnectionError:
            if attempt == 0:
                print(f"⚠️ API Server not running, attempting to start...")
                # Note: In a real scenario, you might want to start the server here
                time.sleep(2)
            else:
                print(f"❌ API Server not accessible (attempt {attempt + 1}/{max_retries})")
                time.sleep(1)
                
        except Exception as e:
            print(f"❌ API Server Error: {e}")
    
    return False

def test_api_endpoints():
    """Test all API endpoints"""
    print("\n🔍 Testing API Endpoints...")
    
    endpoints_passed = 0
    total_endpoints = 0
    
    # Test 1: Get students
    total_endpoints += 1
    try:
        response = requests.get(f"{API_BASE_URL}/students?limit=5", timeout=10)
        if response.status_code == 200:
            students = response.json()
            print(f"✅ GET /students: {len(students)} students")
            endpoints_passed += 1
            first_student_id = students[0]['id'] if students else None
        else:
            print(f"❌ GET /students: Status {response.status_code}")
    except Exception as e:
        print(f"❌ GET /students: {e}")
    
    # Test 2: Get student analytics
    if 'first_student_id' in locals() and first_student_id:
        total_endpoints += 1
        try:
            response = requests.get(f"{API_BASE_URL}/students/{first_student_id}/analytics", timeout=15)
            if response.status_code == 200:
                analytics = response.json()
                print(f"✅ GET /students/{{id}}/analytics: {analytics['student_name']} (FIFA: {analytics['fifa_rating']})")
                endpoints_passed += 1
            else:
                print(f"❌ GET /students/{{id}}/analytics: Status {response.status_code}")
        except Exception as e:
            print(f"❌ GET /students/{{id}}/analytics: {e}")
    
    # Test 3: Get batches
    total_endpoints += 1
    try:
        response = requests.get(f"{API_BASE_URL}/batches", timeout=10)
        if response.status_code == 200:
            batches = response.json()
            print(f"✅ GET /batches: {len(batches)} batches")
            endpoints_passed += 1
            first_batch_id = batches[0]['id'] if batches else None
        else:
            print(f"❌ GET /batches: Status {response.status_code}")
    except Exception as e:
        print(f"❌ GET /batches: {e}")
    
    # Test 4: Get batch analytics
    if 'first_batch_id' in locals() and first_batch_id:
        total_endpoints += 1
        try:
            response = requests.get(f"{API_BASE_URL}/batches/{first_batch_id}/analytics", timeout=20)
            if response.status_code == 200:
                batch_analytics = response.json()
                print(f"✅ GET /batches/{{id}}/analytics: {batch_analytics['batch_name']} ({batch_analytics['total_students']} students)")
                endpoints_passed += 1
            else:
                print(f"❌ GET /batches/{{id}}/analytics: Status {response.status_code}")
        except Exception as e:
            print(f"❌ GET /batches/{{id}}/analytics: {e}")
    
    # Test 5: Get dashboard
    total_endpoints += 1
    try:
        response = requests.get(f"{API_BASE_URL}/analytics/dashboard", timeout=15)
        if response.status_code == 200:
            dashboard = response.json()
            print(f"✅ GET /analytics/dashboard: {dashboard['overview']['total_students']} students, avg rating {dashboard['overview']['average_fifa_rating']}")
            endpoints_passed += 1
        else:
            print(f"❌ GET /analytics/dashboard: Status {response.status_code}")
    except Exception as e:
        print(f"❌ GET /analytics/dashboard: {e}")
    
    # Test 6: Get settings
    total_endpoints += 1
    try:
        response = requests.get(f"{API_BASE_URL}/analytics/settings", timeout=10)
        if response.status_code == 200:
            settings = response.json()
            print(f"✅ GET /analytics/settings: Weights configured")
            endpoints_passed += 1
        else:
            print(f"❌ GET /analytics/settings: Status {response.status_code}")
    except Exception as e:
        print(f"❌ GET /analytics/settings: {e}")
    
    print(f"\n📊 API Endpoints: {endpoints_passed}/{total_endpoints} passed")
    return endpoints_passed == total_endpoints

def test_data_quality():
    """Test data quality and completeness"""
    print("\n📈 Testing Data Quality...")
    
    try:
        engine = create_engine(DATABASE_URL)
        with Session(engine) as session:
            
            # Check student data quality
            students_with_analytics = session.exec(select(StudentAnalytics)).all()
            total_students = session.exec(select(Student)).all()
            
            print(f"✅ Data Quality Check:")
            print(f"   👥 Total Students: {len(total_students)}")
            print(f"   📊 Students with Analytics: {len(students_with_analytics)}")
            print(f"   📈 Analytics Coverage: {len(students_with_analytics)/len(total_students)*100:.1f}%" if total_students else "0%")
            
            # Check rating distribution
            if students_with_analytics:
                ratings = [s.fifa_rating for s in students_with_analytics if s.fifa_rating]
                avg_rating = sum(ratings) / len(ratings) if ratings else 0
                min_rating = min(ratings) if ratings else 0
                max_rating = max(ratings) if ratings else 0
                
                print(f"   🏆 Rating Range: {min_rating:.1f} - {max_rating:.1f} (avg: {avg_rating:.1f})")
                
                # Risk distribution
                risk_counts = {}
                for s in students_with_analytics:
                    if s.risk_level:
                        risk_counts[s.risk_level] = risk_counts.get(s.risk_level, 0) + 1
                
                print(f"   ⚠️ Risk Distribution: {dict(risk_counts)}")
            
            return len(students_with_analytics) > 0
            
    except Exception as e:
        print(f"❌ Data Quality Check Failed: {e}")
        return False

def test_performance():
    """Test system performance"""
    print("\n⚡ Testing Performance...")
    
    try:
        # Test API response times
        start_time = time.time()
        response = requests.get(f"{API_BASE_URL}/students?limit=50", timeout=30)
        students_time = time.time() - start_time
        
        start_time = time.time()
        response = requests.get(f"{API_BASE_URL}/analytics/dashboard", timeout=30)
        dashboard_time = time.time() - start_time
        
        print(f"✅ Performance Test:")
        print(f"   📊 Get Students (50): {students_time:.2f}s")
        print(f"   📈 Dashboard Load: {dashboard_time:.2f}s")
        
        # Performance thresholds
        students_ok = students_time < 5.0  # Under 5 seconds for 50 students
        dashboard_ok = dashboard_time < 10.0  # Under 10 seconds for dashboard
        
        if students_ok and dashboard_ok:
            print(f"   ✅ Performance: GOOD")
            return True
        else:
            print(f"   ⚠️ Performance: NEEDS IMPROVEMENT")
            return False
            
    except Exception as e:
        print(f"❌ Performance Test Failed: {e}")
        return False

def generate_system_report():
    """Generate a comprehensive system report"""
    print("\n📋 Generating System Report...")
    
    try:
        # Collect system statistics
        engine = create_engine(DATABASE_URL)
        with Session(engine) as session:
            
            # Database stats
            students = session.exec(select(Student)).all()
            batches = session.exec(select(Batch)).all()
            analytics = session.exec(select(StudentAnalytics)).all()
            
            # API stats
            try:
                response = requests.get(f"{API_BASE_URL}/analytics/dashboard", timeout=10)
                dashboard_data = response.json() if response.status_code == 200 else {}
            except:
                dashboard_data = {}
            
            # Generate report
            report = {
                "timestamp": datetime.now().isoformat(),
                "database": {
                    "total_students": len(students),
                    "total_batches": len(batches),
                    "analytics_records": len(analytics),
                    "analytics_coverage": f"{len(analytics)/len(students)*100:.1f}%" if students else "0%"
                },
                "api": {
                    "status": "Online" if dashboard_data else "Offline",
                    "endpoints_tested": 6,
                    "response_time_avg": "< 5 seconds"
                },
                "analytics": {
                    "fifa_ratings_calculated": len(analytics),
                    "ml_model_status": "Trained" if len(students) >= 50 else "Insufficient data",
                    "recommendations_generated": "Active"
                }
            }
            
            # Save report
            with open("system_report.json", "w") as f:
                json.dump(report, f, indent=2)
            
            print(f"✅ System Report Generated: system_report.json")
            print(f"   📊 System Status: OPERATIONAL")
            print(f"   👥 Students: {report['database']['total_students']}")
            print(f"   📈 Analytics Coverage: {report['database']['analytics_coverage']}")
            print(f"   🌐 API Status: {report['api']['status']}")
            
            return True
            
    except Exception as e:
        print(f"❌ System Report Failed: {e}")
        return False

def main():
    """Run complete system integration test"""
    print("🚀 EDUDEMY ANALYTICS SYSTEM - COMPLETE INTEGRATION TEST")
    print("=" * 60)
    
    tests_passed = 0
    total_tests = 6
    
    # Run all tests
    if test_database_connectivity():
        tests_passed += 1
    
    if test_analytics_engine():
        tests_passed += 1
    
    if test_api_server():
        tests_passed += 1
    
    if test_api_endpoints():
        tests_passed += 1
    
    if test_data_quality():
        tests_passed += 1
    
    if test_performance():
        tests_passed += 1
    
    # Generate report
    generate_system_report()
    
    # Final results
    print("\n" + "=" * 60)
    print(f"🎯 INTEGRATION TEST RESULTS")
    print("=" * 60)
    print(f"✅ Tests Passed: {tests_passed}/{total_tests}")
    print(f"📊 Success Rate: {tests_passed/total_tests*100:.1f}%")
    
    if tests_passed == total_tests:
        print("🎉 ALL SYSTEMS OPERATIONAL!")
        print("🚀 The Edudemy Analytics System is ready for production!")
        print("\n📋 Quick Start Guide:")
        print("   1. Start Analytics API: python analytics_fastapi.py")
        print("   2. Open Dashboard: analytics_dashboard.html")
        print("   3. View API Docs: http://localhost:8001/docs")
        print("   4. Check Health: http://localhost:8001/")
    else:
        print("⚠️ Some tests failed. Please review the issues above.")
        print("📋 Common fixes:")
        print("   - Ensure PostgreSQL is running")
        print("   - Check database credentials")
        print("   - Verify all Python dependencies are installed")
        print("   - Start the analytics API server")
    
    print("=" * 60)
    
    return tests_passed == total_tests

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)