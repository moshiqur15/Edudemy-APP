#!/usr/bin/env python3

import requests
import json

API_BASE = "http://127.0.0.1:8000"

def test_login(username, password, label=""):
    """Test login with given credentials"""
    login_data = {
        "username": username,
        "password": password
    }
    
    try:
        print(f"Testing {label}: {username}")
        response = requests.post(f"{API_BASE}/auth/login", json=login_data)
        
        if response.status_code == 200:
            data = response.json()
            print(f"  ✅ SUCCESS - Token: {data.get('access_token', 'No token')[:50]}...")
            return data.get('access_token')
        else:
            print(f"  ❌ FAILED - {response.status_code}: {response.text}")
            return None
            
    except Exception as e:
        print(f"  ❌ ERROR: {e}")
        return None

def main():
    print("🔐 Login Credential Test")
    print("=" * 30)
    
    # Test different credential combinations
    credentials_to_test = [
        ("superadmin@edudemy.com", "superadmin123", "Email from user list"),
        ("superadmin@edudemy.local", "superadmin123", "Email from creation script"),
        ("superadmin", "superadmin123", "Username only"),
        ("admin@edudemy.com", "admin123", "Common admin variant"),
        ("superadmin@edudemy.com", "admin123", "Different password variant"),
        ("superadmin", "admin123", "Username with different password")
    ]
    
    successful_logins = []
    
    for username, password, label in credentials_to_test:
        token = test_login(username, password, label)
        if token:
            successful_logins.append((username, password, token))
    
    print("\n" + "=" * 50)
    print("RESULTS:")
    
    if successful_logins:
        print(f"✅ Found {len(successful_logins)} working credential(s):")
        for username, password, token in successful_logins:
            print(f"  📧 Username: {username}")
            print(f"  🔑 Password: {password}")
            print(f"  🎫 Token (first 50 chars): {token[:50]}...")
            print()
    else:
        print("❌ No working credentials found!")
        print("\nTroubleshooting suggestions:")
        print("1. Check if backend server is running")
        print("2. Verify database connection")
        print("3. Check user table for correct credentials")
        print("4. Try recreating superadmin user")

if __name__ == "__main__":
    main()