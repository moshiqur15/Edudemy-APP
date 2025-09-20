#!/usr/bin/env python3
"""
Quick API test script to verify backend connectivity
"""

import requests
import json

API_BASE = "http://127.0.0.1:8000"

def test_api_health():
    """Test if the API is running"""
    try:
        response = requests.get(f"{API_BASE}/", timeout=5)
        print(f"✅ API Health: {response.status_code} - {response.json()}")
        return True
    except requests.exceptions.RequestException as e:
        print(f"❌ API Health Check Failed: {e}")
        return False

def test_docs_endpoint():
    """Test if API docs are accessible"""
    try:
        response = requests.get(f"{API_BASE}/docs", timeout=5)
        print(f"✅ API Docs: {response.status_code} - Accessible")
        return True
    except requests.exceptions.RequestException as e:
        print(f"❌ API Docs Check Failed: {e}")
        return False

def test_superadmin_login():
    """Test login with superadmin credentials"""
    try:
        login_data = {
            "username": "superadmin",
            "password": "superadmin123"
        }
        response = requests.post(f"{API_BASE}/auth/login", json=login_data, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            token = data.get('access_token')
            user = data.get('user', {})
            print(f"✅ Login Success: User {user.get('username')} (Role: {user.get('role')})")
            return token
        else:
            print(f"❌ Login Failed: {response.status_code} - {response.text}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"❌ Login Request Failed: {e}")
        return None

def test_users_endpoint(token):
    """Test users endpoint with authentication"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_BASE}/users/", headers=headers, timeout=5)
        
        if response.status_code == 200:
            users = response.json()
            print(f"✅ Users API: {response.status_code} - Found {len(users)} users")
            return True
        else:
            print(f"❌ Users API Failed: {response.status_code}")
            try:
                error_detail = response.json()
                print(f"Error details: {error_detail}")
            except:
                print(f"Response text: {response.text[:500]}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Users API Request Failed: {e}")
        return False

def test_teachers_endpoint(token):
    """Test teachers endpoint with authentication"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_BASE}/teachers/", headers=headers, timeout=5)
        
        if response.status_code == 200:
            teachers = response.json()
            print(f"✅ Teachers API: {response.status_code} - Found {len(teachers)} teachers")
            return True
        else:
            print(f"❌ Teachers API Failed: {response.status_code}")
            try:
                error_detail = response.json()
                print(f"Error details: {error_detail}")
            except:
                print(f"Response text: {response.text[:500]}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Teachers API Request Failed: {e}")
        return False

def test_batches_endpoint(token):
    """Test batches endpoint with authentication"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_BASE}/academics/batches/", headers=headers, timeout=5)
        
        if response.status_code == 200:
            batches = response.json()
            print(f"✅ Batches API: {response.status_code} - Found {len(batches)} batches")
            return True
        else:
            print(f"❌ Batches API Failed: {response.status_code}")
            try:
                error_detail = response.json()
                print(f"Error details: {error_detail}")
            except:
                print(f"Response text: {response.text[:500]}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Batches API Request Failed: {e}")
        return False

def main():
    print("=" * 50)
    print("🎓 Edudemy Backend API Test")
    print("=" * 50)
    
    # Test API health
    if not test_api_health():
        print("\n❌ Backend is not running. Please start the backend server first.")
        return
    
    # Test docs endpoint
    test_docs_endpoint()
    
    # Test login
    token = test_superadmin_login()
    if not token:
        print("\n❌ Authentication failed. Cannot test protected endpoints.")
        return
    
    # Test protected endpoints
    test_users_endpoint(token)
    test_teachers_endpoint(token)
    test_batches_endpoint(token)
    
    print("\n" + "=" * 50)
    print("✅ API testing completed!")
    print("If all tests passed, the backend is working correctly.")
    print("=" * 50)

if __name__ == "__main__":
    main()