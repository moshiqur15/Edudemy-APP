#!/usr/bin/env python3

import requests
import json
import sys

API_BASE = "http://127.0.0.1:8000"

def login_and_get_token():
    """Login and get authentication token"""
    login_data = {
        "username": "superadmin@edudemy.com",  
        "password": "superadmin123"
    }
    
    try:
        response = requests.post(f"{API_BASE}/auth/login", json=login_data)
        if response.status_code == 200:
            token = response.json()["access_token"]
            return token
        else:
            print(f"Login failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"Login error: {e}")
        return None

def test_batch_operations(token):
    """Test batch CRUD operations"""
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    print("1. Testing GET /academics/batches/ (List Batches)")
    try:
        response = requests.get(f"{API_BASE}/academics/batches/", headers=headers)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            batches = response.json()
            print(f"   Found {len(batches)} batches")
            for i, batch in enumerate(batches[:3]):  # Show first 3
                print(f"   Batch {i+1}: {batch.get('name', 'No name')} - {batch.get('class_name', 'No class')}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Exception: {e}")
    
    print("\n2. Testing POST /academics/batches/ (Create Batch)")
    test_batch = {
        "name": "Test Batch API",
        "code": "TEST001",
        "class_name": "Class 6",
        "version": "BV",
        "course": "Test Course",
        "max_students": 30,
        "fee_amount": "5000.00",
        "discount_percentage": 0,
        "status": "active",
        "start_date": "2025-01-01",
        "end_date": "2025-06-30",
        "time_slot": "10:00-11:00",
        "schedule_days": "[\"Monday\", \"Wednesday\", \"Friday\"]"
    }
    
    try:
        response = requests.post(f"{API_BASE}/academics/batches/", headers=headers, json=test_batch)
        print(f"   Status: {response.status_code}")
        if response.status_code == 201:
            batch = response.json()
            batch_id = batch.get("id")
            print(f"   ✓ Created batch: {batch.get('name')} (ID: {batch_id})")
            return batch_id
        else:
            print(f"   Error: {response.text}")
            return None
    except Exception as e:
        print(f"   Exception: {e}")
        return None

def test_students_teachers_endpoints(token):
    """Test students and teachers endpoints"""
    headers = {"Authorization": f"Bearer {token}"}
    
    print("\n3. Testing GET /students/ (List Students)")
    try:
        response = requests.get(f"{API_BASE}/students/", headers=headers)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            students = response.json()
            student_count = len(students) if isinstance(students, list) else len(students.get('students', []))
            print(f"   Found {student_count} students")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Exception: {e}")
    
    print("\n4. Testing GET /teachers/ (List Teachers)")
    try:
        response = requests.get(f"{API_BASE}/teachers/", headers=headers)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            teachers = response.json()
            teacher_count = len(teachers) if isinstance(teachers, list) else len(teachers.get('teachers', []))
            print(f"   Found {teacher_count} teachers")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Exception: {e}")

def main():
    print("Batch Management Test")
    print("====================")
    
    # Step 1: Login
    print("\nStep 1: Authenticating...")
    token = login_and_get_token()
    if not token:
        print("❌ Authentication failed. Cannot proceed.")
        sys.exit(1)
    
    print("✓ Authentication successful")
    
    # Step 2: Test batch operations
    print("\nStep 2: Testing Batch Management...")
    batch_id = test_batch_operations(token)
    
    # Step 3: Test students/teachers (to verify no demo data)
    print("\nStep 3: Testing Students and Teachers (checking for demo data)...")
    test_students_teachers_endpoints(token)
    
    print("\n" + "="*50)
    print("Test Summary:")
    print("- If batch creation works, batch management is functional")
    print("- If students/teachers return empty arrays, demo data has been removed")
    print("- If you see errors, check backend logs for details")
    
    if batch_id:
        print(f"\n✓ Test batch created successfully (ID: {batch_id})")
        print("You can now test the frontend batch management interface")
    else:
        print("\n❌ Batch creation failed - check backend for issues")

if __name__ == "__main__":
    main()