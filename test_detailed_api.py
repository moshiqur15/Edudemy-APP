#!/usr/bin/env python3
"""
Enhanced API Test Script for Edudemy Backend
Shows detailed error information to debug 500 errors
"""
import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "http://127.0.0.1:8000"

# Try different possible credentials
POSSIBLE_CREDENTIALS = [
    {"username": "superadmin", "password": "admin123"},
    {"username": "superadmin", "password": "superadmin123"},
    {"username": "admin", "password": "admin123"},
]

def test_endpoint_with_details(session, endpoint, description):
    """Test an endpoint and show detailed error information"""
    print(f"\n🔍 Testing: {description}")
    print(f"URL: {BASE_URL}{endpoint}")
    
    try:
        response = session.get(f"{BASE_URL}{endpoint}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                print(f"✅ Success: {response.status_code}")
                print(f"Response type: {type(data)}")
                if isinstance(data, list):
                    print(f"Items count: {len(data)}")
                elif isinstance(data, dict):
                    print(f"Keys: {list(data.keys())}")
                return True
            except json.JSONDecodeError:
                print(f"✅ Success: {response.status_code} (but not JSON)")
                print(f"Content: {response.text[:200]}...")
                return True
        else:
            print(f"❌ Failed: {response.status_code}")
            print(f"Headers: {dict(response.headers)}")
            
            # Try to get detailed error info
            try:
                error_data = response.json()
                print(f"Error JSON: {json.dumps(error_data, indent=2)}")
            except:
                print(f"Error Text: {response.text}")
            
            return False
            
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
        return False

def main():
    print("=" * 60)
    print("🎓 Enhanced Edudemy Backend API Test")
    print("=" * 60)
    
    # Create session
    session = requests.Session()
    
    # Test health endpoint
    if not test_endpoint_with_details(session, "/", "API Health Check"):
        print("❌ Health check failed, stopping tests")
        return
    
    # Login to get token
    print(f"\n🔐 Logging in...")
    login_success = False
    
    for i, creds in enumerate(POSSIBLE_CREDENTIALS):
        print(f"Trying credentials #{i+1}: {creds['username']}")
        try:
            login_response = session.post(
                f"{BASE_URL}/auth/login", 
                json=creds
            )
            
            if login_response.status_code == 200:
                token_data = login_response.json()
                token = token_data.get("access_token")
                if token:
                    session.headers.update({"Authorization": f"Bearer {token}"})
                    user_data = token_data.get("user", {})
                    print(f"✅ Login successful as {user_data.get('username')} (Role: {user_data.get('role')})")
                    login_success = True
                    break
                else:
                    print(f"❌ No access token in response: {token_data}")
            else:
                print(f"❌ Failed with {creds['username']}: {login_response.status_code}")
                
        except Exception as e:
            print(f"❌ Exception with {creds['username']}: {str(e)}")
    
    if not login_success:
        print("❌ All login attempts failed")
        return
    
    # Test endpoints that were failing
    endpoints_to_test = [
        ("/users", "Users API"),
        ("/teachers", "Teachers API"),
        ("/academics/batches", "Batches API"),
    ]
    
    results = {}
    for endpoint, description in endpoints_to_test:
        results[endpoint] = test_endpoint_with_details(session, endpoint, description)
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Test Results Summary")
    print("=" * 60)
    
    for endpoint, success in results.items():
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {endpoint}")
    
    if all(results.values()):
        print("\n🎉 All tests passed! Backend is working correctly.")
    else:
        print("\n⚠️  Some tests failed. Check the detailed output above.")

if __name__ == "__main__":
    main()