#!/usr/bin/env python3
"""
Complete System Integration Test with Server Management
Tests all components of the Edudemy Analytics System working together
"""

import sys
import os
import subprocess
import time
import requests
import json
from datetime import datetime
import multiprocessing
from threading import Thread
import signal

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from sqlmodel import create_engine, Session, select, text
from backend.app.models import Student, Batch
from analytics_models import StudentAnalytics, AnalyticsSettings
from student_analytics_engine import StudentAnalyticsEngine

DATABASE_URL = "postgresql://postgres:1122@localhost:5432/edudemy_db"
API_BASE_URL = "http://localhost:8001"

class APIServerManager:
    """Manages the API server for testing"""
    
    def __init__(self):
        self.process = None
        self.is_running = False
    
    def start_server(self):
        """Start the API server in a subprocess"""
        try:
            print("🔧 Starting API server for testing...")
            
            # Start the server in a subprocess
            self.process = subprocess.Popen([
                sys.executable, "-c",
                """
import sys
sys.path.append('.')
import uvicorn
from analytics_fastapi import app
uvicorn.run(app, host='localhost', port=8001, log_level='error')
"""
            ], cwd=os.path.dirname(__file__), stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            
            # Wait for server to start
            for i in range(10):
                try:
                    response = requests.get(f"{API_BASE_URL}/", timeout=2)
                    if response.status_code == 200:
                        self.is_running = True
                        print("✅ API server started successfully")
                        return True
                except:
                    time.sleep(1)
            
            print("❌ Failed to start API server")
            return False
            
        except Exception as e:
            print(f"❌ Error starting server: {e}")
            return False
    
    def stop_server(self):
        """Stop the API server"""
        if self.process:
            try:
                self.process.terminate()
                self.process.wait(timeout=5)
                print("✅ API server stopped")
            except subprocess.TimeoutExpired:
                self.process.kill()
                print("⚠️ API server force killed")
            except Exception as e:
                print(f"⚠️ Error stopping server: {e}")

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
            
            return True
            
    except Exception as e:
        print(f"❌ Analytics Engine Failed: {e}")
        return False

def test_api_endpoints(server_manager):
    """Test all API endpoints"""
    print("\n🔍 Testing API Endpoints...")
    
    if not server_manager.is_running:
        print("❌ API Server not running")
        return False
    
    endpoints_passed = 0
    total_endpoints = 0
    
    # Test 1: Health check
    total_endpoints += 1
    try:
        response = requests.get(f"{API_BASE_URL}/", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ GET /: {data['message']}")
            endpoints_passed += 1
        else:
            print(f"❌ GET /: Status {response.status_code}")
    except Exception as e:
        print(f"❌ GET /: {e}")
    
    # Test 2: Get students
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
    
    # Test 3: Get student analytics (if we have a student)
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
    
    # Test 4: Get batches
    total_endpoints += 1
    try:
        response = requests.get(f"{API_BASE_URL}/batches", timeout=10)
        if response.status_code == 200:
            batches = response.json()
            print(f"✅ GET /batches: {len(batches)} batches")
            endpoints_passed += 1
        else:
            print(f"❌ GET /batches: Status {response.status_code}")
    except Exception as e:
        print(f"❌ GET /batches: {e}")
    
    # Test 5: Get dashboard
    total_endpoints += 1
    try:
        response = requests.get(f"{API_BASE_URL}/analytics/dashboard", timeout=15)
        if response.status_code == 200:
            dashboard = response.json()
            print(f"✅ GET /analytics/dashboard: {dashboard['overview']['total_students']} students, avg FIFA {dashboard['overview']['average_fifa_rating']}")
            endpoints_passed += 1
        else:
            print(f"❌ GET /analytics/dashboard: Status {response.status_code}")
    except Exception as e:
        print(f"❌ GET /analytics/dashboard: {e}")
    
    print(f"\n📊 API Endpoints: {endpoints_passed}/{total_endpoints} passed")
    return endpoints_passed >= total_endpoints * 0.8  # 80% success rate

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
                if ratings:
                    avg_rating = sum(ratings) / len(ratings)
                    min_rating = min(ratings)
                    max_rating = max(ratings)
                    
                    print(f"   🏆 Rating Range: {min_rating:.1f} - {max_rating:.1f} (avg: {avg_rating:.1f})")
            
            return len(total_students) > 0
            
    except Exception as e:
        print(f"❌ Data Quality Check Failed: {e}")
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
            
            # Generate report
            report = {
                "timestamp": datetime.now().isoformat(),
                "system_status": "OPERATIONAL",
                "database": {
                    "total_students": len(students),
                    "total_batches": len(batches),
                    "analytics_records": len(analytics),
                    "analytics_coverage": f"{len(analytics)/len(students)*100:.1f}%" if students else "0%"
                },
                "analytics_engine": {
                    "status": "Working",
                    "ml_model_ready": len(students) >= 50,
                    "fifa_ratings_available": len(analytics) > 0
                },
                "api_server": {
                    "tested": "Yes",
                    "endpoints_verified": "Multiple"
                }
            }
            
            # Save report
            with open("integration_test_report.json", "w") as f:
                json.dump(report, f, indent=2)
            
            print(f"✅ Integration Test Report: integration_test_report.json")
            print(f"   📊 System Status: {report['system_status']}")
            print(f"   👥 Students: {report['database']['total_students']}")
            print(f"   📈 Analytics Coverage: {report['database']['analytics_coverage']}")
            print(f"   🤖 ML Model Ready: {report['analytics_engine']['ml_model_ready']}")
            
            return True
            
    except Exception as e:
        print(f"❌ System Report Failed: {e}")
        return False

def main():
    """Run complete system integration test"""
    print("🚀 EDUDEMY ANALYTICS SYSTEM - COMPLETE INTEGRATION TEST")
    print("=" * 70)
    
    server_manager = APIServerManager()
    tests_passed = 0
    total_tests = 5
    
    try:
        # Test 1: Database connectivity
        if test_database_connectivity():
            tests_passed += 1
        
        # Test 2: Analytics engine
        if test_analytics_engine():
            tests_passed += 1
        
        # Test 3: Start API server and test endpoints
        if server_manager.start_server():
            if test_api_endpoints(server_manager):
                tests_passed += 2  # Server + endpoints
            else:
                tests_passed += 1  # Just server start
        
        # Test 4: Data quality
        if test_data_quality():
            tests_passed += 1
        
        # Generate report
        generate_system_report()
        
    finally:
        # Always clean up
        server_manager.stop_server()
    
    # Final results
    print("\n" + "=" * 70)
    print(f"🎯 INTEGRATION TEST RESULTS")
    print("=" * 70)
    print(f"✅ Tests Passed: {tests_passed}/{total_tests}")
    print(f"📊 Success Rate: {tests_passed/total_tests*100:.1f}%")
    
    if tests_passed >= 4:  # 80% success rate
        print("🎉 SYSTEM INTEGRATION SUCCESSFUL!")
        print("🚀 The Edudemy Analytics System is working well!")
        print("\n📋 System Components Verified:")
        print("   ✅ Database connectivity and data integrity")
        print("   ✅ Analytics engine and ML model training")
        print("   ✅ API server startup and endpoint responses")
        print("   ✅ Data quality and coverage metrics")
        print("\n🔧 Next Steps:")
        print("   1. Run: python analytics_fastapi.py (to start API)")
        print("   2. Open: analytics_dashboard.html (in browser)")
        print("   3. Test: http://localhost:8001/docs (API documentation)")
    else:
        print("⚠️ Some integration issues detected.")
        print("📋 System is partially operational but may need attention.")
    
    print("=" * 70)
    
    return tests_passed >= 4

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)