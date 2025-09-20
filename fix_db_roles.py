#!/usr/bin/env python3
"""
Fix database role enum and create superadmin user
"""

import psycopg2

def fix_database():
    try:
        conn = psycopg2.connect(
            host='localhost',
            port=5432,
            database='edudemy_db',
            user='postgres',
            password='1122'
        )
        cur = conn.cursor()
        
        print("🔧 Fixing user role column...")
        
        # Update the role column to be VARCHAR instead of enum
        cur.execute('ALTER TABLE "user" ALTER COLUMN role TYPE VARCHAR USING role::text;')
        print("✅ Role column updated to VARCHAR")
        
        # Create superadmin user
        hashed_password = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewgMF3VHaRTfBRsK'
        
        # Check if user already exists
        cur.execute('SELECT id FROM "user" WHERE username = %s', ('superadmin',))
        if cur.fetchone():
            print("✅ Superadmin user already exists")
        else:
            cur.execute("""
            INSERT INTO "user" (email, username, full_name, role, hashed_password, is_active)
            VALUES ('superadmin@edudemy.com', 'superadmin', 'Super Administrator', 'superadmin', %s, true)
            """, (hashed_password,))
            print("✅ Superadmin user created")
        
        conn.commit()
        conn.close()
        
        print("✅ Database fixed successfully!")
        return True
        
    except psycopg2.Error as e:
        print(f"❌ Database error: {e}")
        return False

if __name__ == "__main__":
    fix_database()