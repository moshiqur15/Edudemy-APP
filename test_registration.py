import requests
import json

# Test data
test_user = {
    "full_name": "Test User",
    "email": "test@example.com",
    "password": "testpass123",
    "requested_role": "student"
}

# Test registration request
try:
    response = requests.post(
        "http://127.0.0.1:8000/auth/register-request",
        json=test_user,
        headers={"Content-Type": "application/json"}
    )
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Registration Token: {data.get('registration_token')}")
    else:
        print(f"Error: {response.text}")
        
except Exception as e:
    print(f"Connection error: {e}")
    print("Make sure the backend server is running on http://127.0.0.1:8000")