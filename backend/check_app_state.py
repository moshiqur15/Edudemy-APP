#!/usr/bin/env python3

import json
import sys
from pathlib import Path

def main():
    print("EduDemy App State Checker")
    print("=" * 40)
    
    # Define paths to potential localStorage files
    potential_paths = [
        # Common browser localStorage locations on Windows
        r"C:\Users\*\AppData\Local\Google\Chrome\User Data\Default\Local Storage",
        r"C:\Users\*\AppData\Local\Microsoft\Edge\User Data\Default\Local Storage",
        r"C:\Users\*\AppData\Roaming\Mozilla\Firefox\Profiles\*\storage\default",
    ]
    
    print("\n1. Frontend localStorage State:")
    print("   Note: Browser localStorage is not directly accessible from Python.")
    print("   Please check in your browser's Developer Tools -> Application -> Local Storage")
    print("   Look for these keys:")
    print("   - access_token (should NOT start with 'mock_token_' for real backend)")
    print("   - user (contains user information)")
    
    print("\n2. Current Working Directory:")
    print(f"   {Path.cwd()}")
    
    print("\n3. Backend Environment:")
    env_file = Path(".env")
    if env_file.exists():
        print("   ✓ .env file found")
        with open(env_file, 'r') as f:
            env_content = f.read()
            if 'DATABASE_URL' in env_content:
                print("   ✓ Database URL configured")
            else:
                print("   ✗ No DATABASE_URL in .env")
    else:
        print("   ✗ .env file not found")
    
    print("\n4. Database Tables Check:")
    try:
        import os
        import sys
        sys.path.append(str(Path.cwd() / "app"))
        
        from app.database import engine
        from sqlalchemy import inspect
        
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        required_tables = ['user', 'student', 'teacher', 'batch']
        print(f"   Total tables found: {len(tables)}")
        
        for table in required_tables:
            if table in tables:
                print(f"   ✓ {table} table exists")
            else:
                print(f"   ✗ {table} table missing")
                
    except Exception as e:
        print(f"   ✗ Cannot check database: {e}")
    
    print("\n5. Recommendations:")
    print("   To fix Batch Management issues:")
    print("   1. Ensure backend server is running:")
    print("      python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload")
    print("   ")
    print("   2. Clear browser localStorage to remove mock tokens:")
    print("      - Open browser Developer Tools (F12)")
    print("      - Go to Application -> Local Storage -> http://localhost:5174")
    print("      - Delete 'access_token' and 'user' entries")
    print("      - Refresh the page and login again")
    print("   ")
    print("   3. If database errors occur, run migration:")
    print("      python create_db.py")
    print("      python create_superadmin.py")

if __name__ == "__main__":
    main()