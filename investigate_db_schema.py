#!/usr/bin/env python3
"""
Investigate Database Schema
Check what tables and columns actually exist in the database
"""

import sys
import os
import psycopg2
from sqlalchemy import create_engine, inspect, text

DATABASE_URL = "postgresql://postgres:1122@localhost:5432/edudemy_db"

def investigate_payment_schema():
    """Check the actual payment table structure"""
    print("🔍 INVESTIGATING DATABASE SCHEMA")
    print("=" * 50)
    
    try:
        engine = create_engine(DATABASE_URL)
        inspector = inspect(engine)
        
        # Get all tables
        tables = inspector.get_table_names()
        print(f"📊 Found {len(tables)} tables:")
        for table in sorted(tables):
            print(f"   - {table}")
        
        # Check if payment table exists
        if 'payment' in tables:
            print(f"\n💰 PAYMENT TABLE STRUCTURE:")
            columns = inspector.get_columns('payment')
            for col in columns:
                nullable = "NULL" if col['nullable'] else "NOT NULL"
                print(f"   {col['name']}: {col['type']} ({nullable})")
        else:
            print("\n❌ Payment table does not exist")
        
        # Check student table structure
        if 'student' in tables:
            print(f"\n👥 STUDENT TABLE STRUCTURE:")
            columns = inspector.get_columns('student')
            for col in columns:
                nullable = "NULL" if col['nullable'] else "NOT NULL"
                print(f"   {col['name']}: {col['type']} ({nullable})")
        
        # Check batch table structure
        if 'batch' in tables:
            print(f"\n📚 BATCH TABLE STRUCTURE:")
            columns = inspector.get_columns('batch')
            for col in columns:
                nullable = "NULL" if col['nullable'] else "NOT NULL"
                print(f"   {col['name']}: {col['type']} ({nullable})")
                
        # Check for any finance-related tables
        finance_tables = [t for t in tables if 'payment' in t.lower() or 'fee' in t.lower() or 'finance' in t.lower()]
        if finance_tables:
            print(f"\n💵 FINANCE-RELATED TABLES:")
            for table in finance_tables:
                print(f"   - {table}")
                
    except Exception as e:
        print(f"❌ Error investigating schema: {e}")

def check_existing_data():
    """Check what data exists"""
    print(f"\n📈 EXISTING DATA CHECK:")
    print("=" * 30)
    
    try:
        engine = create_engine(DATABASE_URL)
        
        # Check students
        with engine.connect() as conn:
            result = conn.execute(text("SELECT COUNT(*) FROM student"))
            student_count = result.scalar()
            print(f"👥 Students: {student_count}")
            
            result = conn.execute(text("SELECT COUNT(*) FROM batch"))
            batch_count = result.scalar()
            print(f"📚 Batches: {batch_count}")
            
            # Check if payment table exists and has data
            try:
                result = conn.execute(text("SELECT COUNT(*) FROM payment"))
                payment_count = result.scalar()
                print(f"💰 Payments: {payment_count}")
            except Exception:
                print(f"💰 Payments: Table doesn't exist or is empty")
                
    except Exception as e:
        print(f"❌ Error checking data: {e}")

def main():
    investigate_payment_schema()
    check_existing_data()
    
    print(f"\n🔧 RECOMMENDATIONS:")
    print("=" * 20)
    print("1. Use the actual table structures found above")
    print("2. Create finance models that match the existing schema")
    print("3. Generate sample data compatible with the real structure")
    print("4. Build finance tab using the correct field names")

if __name__ == "__main__":
    main()