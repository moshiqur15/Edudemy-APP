#!/usr/bin/env python3

import asyncio
import aiohttp
import json
import sys

API_BASE = "http://127.0.0.1:8000"

async def test_endpoint(session, endpoint, method="GET", data=None, token=None):
    """Test an API endpoint"""
    url = f"{API_BASE}{endpoint}"
    headers = {'Content-Type': 'application/json'}
    
    if token:
        headers['Authorization'] = f'Bearer {token}'
    
    try:
        if method == "GET":
            async with session.get(url, headers=headers) as response:
                result = {
                    'endpoint': endpoint,
                    'status': response.status,
                    'content_type': response.content_type,
                    'data': await response.text()
                }
        elif method == "POST":
            async with session.post(url, headers=headers, json=data) as response:
                result = {
                    'endpoint': endpoint,
                    'status': response.status,
                    'content_type': response.content_type,
                    'data': await response.text()
                }
        
        # Try to parse JSON if possible
        try:
            if result['content_type'] == 'application/json':
                result['data'] = json.loads(result['data'])
        except:
            pass
            
        return result
    except Exception as e:
        return {
            'endpoint': endpoint,
            'status': 'ERROR',
            'error': str(e)
        }

async def test_login():
    """Test login endpoint to get a token"""
    async with aiohttp.ClientSession() as session:
        login_data = {
            "email": "admin@edudemy.com",
            "password": "admin123"
        }
        result = await test_endpoint(session, "/auth/login", "POST", login_data)
        return result

async def main():
    print("Testing EduDemy API Endpoints")
    print("=" * 50)
    
    # Test server connection
    async with aiohttp.ClientSession() as session:
        print("\n1. Testing Server Connection...")
        result = await test_endpoint(session, "/")
        print(f"   Status: {result.get('status', 'ERROR')}")
        if 'error' in result:
            print(f"   Error: {result['error']}")
            print("   Server appears to be down. Starting server required.")
            return
        
        # Test login
        print("\n2. Testing Login...")
        login_result = await test_login()
        print(f"   Status: {login_result.get('status', 'ERROR')}")
        
        if login_result.get('status') == 200:
            token = login_result['data'].get('access_token')
            print("   ✓ Login successful")
        else:
            print("   ✗ Login failed - testing without authentication")
            token = None
        
        # Test endpoints
        endpoints_to_test = [
            ("/academics/batches/", "GET"),
            ("/students/", "GET"),
            ("/teachers/", "GET"),
            ("/users/", "GET"),
        ]
        
        print("\n3. Testing API Endpoints...")
        for endpoint, method in endpoints_to_test:
            result = await test_endpoint(session, endpoint, method, token=token)
            status = result.get('status', 'ERROR')
            print(f"   {endpoint} ({method}): {status}")
            
            if status == 500:
                print(f"      ERROR: {result.get('data', {}).get('detail', 'Internal Server Error')}")
            elif status == 401:
                print("      ERROR: Unauthorized - authentication required")
            elif status == 404:
                print("      ERROR: Endpoint not found")
            elif status == 200:
                data = result.get('data', {})
                if isinstance(data, dict):
                    print(f"      ✓ Success - returned {len(data)} items")
                elif isinstance(data, list):
                    print(f"      ✓ Success - returned {len(data)} items")
                else:
                    print("      ✓ Success")
            elif 'error' in result:
                print(f"      ERROR: {result['error']}")
        
        print("\n4. Summary:")
        print("   If you see 500 errors, the database may need setup.")
        print("   If you see connection errors, start the backend server first.")
        print("   Use: python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload")

if __name__ == "__main__":
    asyncio.run(main())