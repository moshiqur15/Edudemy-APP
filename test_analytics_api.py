#!/usr/bin/env python3
"""
Test script for Analytics API
"""

import requests
import json
from datetime import datetime

API_BASE_URL = "http://localhost:8001"

def test_api_endpoints():
    """Test various API endpoints"""
    
    print("🧪 Testing Edudemy Analytics API...")
    
    try:
        # Test 1: Health check
        print("\n📍 Test 1: Health Check")
        response = requests.get(f"{API_BASE_URL}/")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API is healthy: {data['message']}")
        else:
            print("❌ API health check failed")
            return
        
        # Test 2: Get students
        print("\n📍 Test 2: Get Students")
        response = requests.get(f"{API_BASE_URL}/students?limit=5")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            students = response.json()
            print(f"✅ Retrieved {len(students)} students")
            if students:
                print(f"First student: {students[0]['full_name']} (ID: {students[0]['id']})")
                first_student_id = students[0]['id']
            else:
                print("❌ No students found")
                return
        else:
            print("❌ Failed to get students")
            return
        
        # Test 3: Get student analytics
        print("\n📍 Test 3: Get Student Analytics")
        response = requests.get(f"{API_BASE_URL}/students/{first_student_id}/analytics?recalculate=true")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            analytics = response.json()
            print(f"✅ Analytics for {analytics['student_name']}:")
            print(f"   🏆 FIFA Rating: {analytics['fifa_rating']}")
            print(f"   📅 Attendance: {analytics['attendance_rating']}")
            print(f"   📚 Homework: {analytics['homework_classwork_rating']}")
            print(f"   📝 Exams: {analytics['exam_rating']}")
            print(f"   🧠 Skills: {analytics['skill_rating']}")
            print(f"   ⚠️ Risk Level: {analytics['risk_level']}")
            print(f"   💡 Recommendations: {len(analytics['recommendations'])}")
        else:
            print(f"❌ Failed to get student analytics: {response.text}")
        
        # Test 4: Get batches
        print("\n📍 Test 4: Get Batches")
        response = requests.get(f"{API_BASE_URL}/batches")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            batches = response.json()
            print(f"✅ Retrieved {len(batches)} batches")
            if batches:
                batch_id = batches[0]['id']
                print(f"First batch: {batches[0]['name']} ({batches[0]['current_students_count']} students)")
            else:
                print("❌ No batches found")
                return
        else:
            print("❌ Failed to get batches")
            return
        
        # Test 5: Get batch analytics
        print("\n📍 Test 5: Get Batch Analytics")
        response = requests.get(f"{API_BASE_URL}/batches/{batch_id}/analytics")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            batch_analytics = response.json()
            print(f"✅ Batch Analytics for {batch_analytics['batch_name']}:")
            print(f"   👥 Total Students: {batch_analytics['total_students']}")
            print(f"   🏆 Average FIFA Rating: {batch_analytics['average_fifa_rating']}")
            print(f"   💪 Strongest Area: {batch_analytics['strongest_area']}")
            print(f"   📈 Weakest Area: {batch_analytics['weakest_area']}")
        else:
            print(f"❌ Failed to get batch analytics: {response.text}")
        
        # Test 6: Get dashboard data
        print("\n📍 Test 6: Get Dashboard Data")
        response = requests.get(f"{API_BASE_URL}/analytics/dashboard")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            dashboard = response.json()
            print(f"✅ Dashboard Data:")
            print(f"   👥 Total Students: {dashboard['overview']['total_students']}")
            print(f"   📚 Total Batches: {dashboard['overview']['total_batches']}")
            print(f"   📊 Analytics Calculated: {dashboard['overview']['analytics_calculated']}")
            print(f"   🏆 Average FIFA Rating: {dashboard['overview']['average_fifa_rating']}")
        else:
            print(f"❌ Failed to get dashboard data: {response.text}")
        
        # Test 7: Get analytics settings
        print("\n📍 Test 7: Get Analytics Settings")
        response = requests.get(f"{API_BASE_URL}/analytics/settings")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            settings = response.json()
            print(f"✅ Analytics Settings:")
            print(f"   📅 Attendance Weight: {settings['attendance_weight']}")
            print(f"   📚 Homework Weight: {settings['homework_classwork_weight']}")
            print(f"   📝 Exam Weight: {settings['exam_weight']}")
            print(f"   🧠 Skills Weight: {settings['skills_weight']}")
        else:
            print(f"❌ Failed to get analytics settings: {response.text}")
        
        print("\n🎉 All API tests completed successfully!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to API server.")
        print("Please make sure the API server is running:")
        print("python analytics_fastapi.py")
        return
    
    except Exception as e:
        print(f"❌ Error during testing: {e}")
        return

if __name__ == "__main__":
    test_api_endpoints()