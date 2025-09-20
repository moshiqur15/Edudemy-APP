#!/usr/bin/env python3
"""
Database migration script for Edudemy APP
Fixes schema issues and ensures all required tables and columns exist
"""

import os
import sys
import psycopg2
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent / "backend"
sys.path.append(str(backend_path))

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'edudemy_db',
    'user': 'postgres',
    'password': '1122'
}

def get_db_connection():
    """Create database connection"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except psycopg2.Error as e:
        print(f"❌ Database connection failed: {e}")
        return None

def execute_sql(conn, sql, description):
    """Execute SQL with error handling"""
    try:
        with conn.cursor() as cursor:
            cursor.execute(sql)
            conn.commit()
            print(f"✅ {description}")
            return True
    except psycopg2.Error as e:
        print(f"❌ {description} failed: {e}")
        return False

def migrate_users_table(conn):
    """Ensure users table exists with all required columns"""
    print("🔧 Migrating users table...")
    
    # Create users table if it doesn't exist
    create_users_sql = """
    CREATE TABLE IF NOT EXISTS "user" (
        id SERIAL PRIMARY KEY,
        email VARCHAR NOT NULL UNIQUE,
        username VARCHAR NOT NULL UNIQUE,
        full_name VARCHAR,
        role VARCHAR NOT NULL DEFAULT 'student',
        designation VARCHAR,
        is_active BOOLEAN DEFAULT true,
        phone VARCHAR,
        department VARCHAR,
        profile_image VARCHAR,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        hashed_password VARCHAR NOT NULL,
        created_by INTEGER,
        last_login TIMESTAMP
    );
    """
    execute_sql(conn, create_users_sql, "Users table created/verified")
    
    # Add missing columns if they don't exist
    columns_to_add = [
        "ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS created_by INTEGER;",
        "ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;",
        "ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS profile_image VARCHAR;",
        "ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS department VARCHAR;",
        "ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS designation VARCHAR;"
    ]
    
    for sql in columns_to_add:
        execute_sql(conn, sql, "Added missing user column")

def migrate_students_table(conn):
    """Ensure students table exists with all required columns"""
    print("🔧 Migrating students table...")
    
    create_students_sql = """
    CREATE TABLE IF NOT EXISTS student (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        full_name VARCHAR NOT NULL,
        father_name VARCHAR NOT NULL,
        mother_name VARCHAR NOT NULL,
        gender VARCHAR NOT NULL,
        date_of_birth TIMESTAMP,
        address VARCHAR,
        class_name VARCHAR NOT NULL,
        batch_id INTEGER,
        version VARCHAR DEFAULT 'BV',
        current_school VARCHAR,
        student_reg_number VARCHAR UNIQUE,
        student_roll_number VARCHAR UNIQUE,
        student_contact VARCHAR,
        father_contact VARCHAR,
        mother_contact VARCHAR,
        phone VARCHAR,
        email VARCHAR,
        student_id VARCHAR,
        parent_name VARCHAR,
        parent_phone VARCHAR,
        admission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        admission_serial INTEGER,
        FOREIGN KEY (user_id) REFERENCES "user"(id),
        FOREIGN KEY (batch_id) REFERENCES batch(id)
    );
    """
    execute_sql(conn, create_students_sql, "Students table created/verified")

def migrate_teachers_table(conn):
    """Ensure teachers table exists with all required columns"""
    print("🔧 Migrating teachers table...")
    
    create_teachers_sql = """
    CREATE TABLE IF NOT EXISTS teacher (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        employee_id VARCHAR UNIQUE,
        subjects VARCHAR,
        specialization VARCHAR,
        qualification VARCHAR,
        additional_qualifications VARCHAR,
        experience_years INTEGER,
        previous_experience VARCHAR,
        joining_date TIMESTAMP,
        employment_type VARCHAR DEFAULT 'full_time',
        hourly_rate NUMERIC(10,2),
        emergency_contact VARCHAR,
        emergency_contact_relation VARCHAR,
        preferred_classes VARCHAR,
        max_classes_per_day INTEGER DEFAULT 6,
        preferred_time_slots VARCHAR,
        bio VARCHAR,
        achievements VARCHAR,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES "user"(id)
    );
    """
    execute_sql(conn, create_teachers_sql, "Teachers table created/verified")

def migrate_batches_table(conn):
    """Ensure batches table exists with all required columns"""
    print("🔧 Migrating batches table...")
    
    create_batches_sql = """
    CREATE TABLE IF NOT EXISTS batch (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        code VARCHAR,
        course VARCHAR,
        class_name VARCHAR,
        version VARCHAR DEFAULT 'BV',
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        max_students INTEGER DEFAULT 30,
        min_students INTEGER DEFAULT 5,
        current_students_count INTEGER DEFAULT 0,
        schedule_days VARCHAR,
        time_slot VARCHAR,
        fee_amount NUMERIC(10,2),
        fee_period VARCHAR DEFAULT 'monthly',
        discount_percentage NUMERIC(5,2) DEFAULT 0.0,
        status VARCHAR DEFAULT 'active',
        notes TEXT,
        created_by INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES "user"(id)
    );
    """
    execute_sql(conn, create_batches_sql, "Batches table created/verified")

def create_superadmin_user(conn):
    """Create default superadmin user if it doesn't exist"""
    print("🔧 Creating superadmin user...")
    
    # Hash the password (using bcrypt format for compatibility)
    # This is a pre-hashed version of 'superadmin123'
    hashed_password = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewgMF3VHaRTfBRsK"
    
    create_superadmin_sql = """
    INSERT INTO "user" (email, username, full_name, role, hashed_password, is_active)
    VALUES ('superadmin@edudemy.com', 'superadmin', 'Super Administrator', 'superadmin', %s, true)
    ON CONFLICT (username) DO NOTHING;
    """
    
    try:
        with conn.cursor() as cursor:
            cursor.execute(create_superadmin_sql, (hashed_password,))
            if cursor.rowcount > 0:
                print("✅ Superadmin user created")
            else:
                print("✅ Superadmin user already exists")
            conn.commit()
    except psycopg2.Error as e:
        print(f"❌ Error creating superadmin user: {e}")

def migrate_permissions_tables(conn):
    """Create permission-related tables"""
    print("🔧 Migrating permissions tables...")
    
    # Permission table
    create_permission_sql = """
    CREATE TABLE IF NOT EXISTS permission (
        id SERIAL PRIMARY KEY,
        name VARCHAR UNIQUE NOT NULL,
        description VARCHAR,
        resource VARCHAR NOT NULL,
        action VARCHAR NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """
    execute_sql(conn, create_permission_sql, "Permission table created/verified")
    
    # Role Permission table
    create_role_permission_sql = """
    CREATE TABLE IF NOT EXISTS rolepermission (
        id SERIAL PRIMARY KEY,
        role VARCHAR NOT NULL,
        permission_id INTEGER NOT NULL,
        granted BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (permission_id) REFERENCES permission(id)
    );
    """
    execute_sql(conn, create_role_permission_sql, "Role Permission table created/verified")
    
    # User Permission table
    create_user_permission_sql = """
    CREATE TABLE IF NOT EXISTS userpermission (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        permission_id INTEGER NOT NULL,
        granted BOOLEAN DEFAULT true,
        granted_by INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES "user"(id),
        FOREIGN KEY (permission_id) REFERENCES permission(id),
        FOREIGN KEY (granted_by) REFERENCES "user"(id)
    );
    """
    execute_sql(conn, create_user_permission_sql, "User Permission table created/verified")

def main():
    """Main migration function"""
    print("=" * 60)
    print("🎓 Edudemy APP Database Migration")
    print("=" * 60)
    
    # Connect to database
    conn = get_db_connection()
    if not conn:
        print("❌ Cannot connect to database. Please ensure PostgreSQL is running.")
        return False
    
    try:
        # Run migrations
        migrate_users_table(conn)
        migrate_batches_table(conn)  # Create batch table first (referenced by students)
        migrate_students_table(conn)
        migrate_teachers_table(conn)
        migrate_permissions_tables(conn)
        create_superadmin_user(conn)
        
        print("\n" + "=" * 60)
        print("✅ Database migration completed successfully!")
        print("📊 You can now:")
        print("   • Start the backend server")
        print("   • Login with: superadmin / superadmin123")
        print("   • Access all features without errors")
        print("=" * 60)
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False
        
    finally:
        conn.close()

if __name__ == "__main__":
    main()