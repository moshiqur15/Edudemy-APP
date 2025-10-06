#!/usr/bin/env python3

import requests
import json

API_BASE = "http://127.0.0.1:8000"

def test_frontend_login_integration():
    """Test the login flow that the frontend will use"""
    
    print("🔗 Frontend-Backend Integration Test")
    print("=" * 40)
    
    # Test the exact format the frontend sends
    login_data = {
        "username": "superadmin@edudemy.com",
        "password": "superadmin123"
    }
    
    print(f"\n1. Testing login with frontend credentials...")
    print(f"   Username: {login_data['username']}")
    print(f"   Password: {login_data['password']}")
    
    try:
        # Test login endpoint
        response = requests.post(f"{API_BASE}/auth/login", json=login_data)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            access_token = data.get('access_token')
            user_data = data.get('user', {})
            
            print(f"   ✅ Login successful!")
            print(f"   📧 User: {user_data.get('full_name')} ({user_data.get('email')})")
            print(f"   🎭 Role: {user_data.get('role')}")
            print(f"   🎫 Token received: {len(access_token) if access_token else 0} characters")
            
            # Test a protected endpoint with the token
            headers = {"Authorization": f"Bearer {access_token}"}
            
            print(f"\n2. Testing protected endpoint with token...")
            me_response = requests.get(f"{API_BASE}/users/me", headers=headers)
            print(f"   Status: {me_response.status_code}")
            
            if me_response.status_code == 200:
                me_data = me_response.json()
                print(f"   ✅ Protected endpoint accessible")
                print(f"   👤 Current user: {me_data.get('full_name')}")
            else:
                print(f"   ❌ Protected endpoint failed: {me_response.text}")
            
            # Test batch endpoint (the main issue we're solving)
            print(f"\n3. Testing batch management endpoint...")
            batch_response = requests.get(f"{API_BASE}/academics/batches/", headers=headers)
            print(f"   Status: {batch_response.status_code}")
            
            if batch_response.status_code == 200:
                batches = batch_response.json()
                batch_count = len(batches) if isinstance(batches, list) else 0
                print(f"   ✅ Batch endpoint accessible")
                print(f"   📚 Found {batch_count} batches")
            else:
                print(f"   ❌ Batch endpoint failed: {batch_response.text}")
                
        else:
            print(f"   ❌ Login failed: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Connection error: {e}")
        print("\n   🚨 Make sure the backend server is running:")
        print("      python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload")

def main():
    test_frontend_login_integration()
    
    print("\n" + "=" * 50)
    print("INTEGRATION TEST SUMMARY:")
    print("✅ If all tests passed, the frontend login should work correctly")
    print("🌐 Frontend URL: http://localhost:5174")
    print("📧 Login with: superadmin@edudemy.com")
    print("🔑 Password: superadmin123")
    print("\nNext steps:")
    print("1. Start the frontend: npm run dev")
    print("2. Navigate to http://localhost:5174")
    print("3. Use the credentials above to login")

if __name__ == "__main__":
    main()
