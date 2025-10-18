#!/usr/bin/env python3
"""
Simple Batch Assignment and Data Visibility Fix
This script focuses on the core issue: assigning students to batches properly
"""

import sys
import os
from datetime import datetime
import random

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from sqlmodel import create_engine, Session, select
from backend.app.models import Student, Batch, StudentVersion, Gender

DATABASE_URL = "postgresql://postgres:1122@localhost:5432/edudemy_db"

def assign_students_to_existing_batches(session):
    """Assign students to existing batches based on their class and version"""
    print("🔍 Checking existing batches...")
    
    # Get all batches
    batches = session.exec(select(Batch)).all()
    print(f"Found {len(batches)} existing batches")
    
    if len(batches) == 0:
        print("❌ No batches found! Creating default batches...")
        create_default_batches(session)
        batches = session.exec(select(Batch)).all()
    
    # Get all students
    students = session.exec(select(Student)).all()
    print(f"Found {len(students)} students")
    
    # Create a mapping of class_name to batch
    batch_map = {}
    for batch in batches:
        key = f"{batch.class_name}_{batch.version.value if batch.version else 'BV'}"
        if key not in batch_map:
            batch_map[key] = []
        batch_map[key].append(batch)
    
    print(f"Available batch mappings: {list(batch_map.keys())}")
    
    assigned_count = 0
    for student in students:
        if student.batch_id:
            print(f"   👥 {student.full_name} already assigned to batch {student.batch_id}")
            continue  # Already assigned
        
        # Find appropriate batch
        key = f"{student.class_name}_{student.version.value if student.version else 'BV'}"
        available_batches = batch_map.get(key, [])
        
        if not available_batches:
            # Try to find any batch with the same class name
            fallback_batches = [b for b in batches if b.class_name == student.class_name]
            if fallback_batches:
                available_batches = fallback_batches[:1]  # Take the first one
        
        if available_batches:
            # Choose batch with least students to balance
            chosen_batch = min(available_batches, key=lambda b: b.current_students_count or 0)
            
            # Assign student to batch
            student.batch_id = chosen_batch.id
            chosen_batch.current_students_count = (chosen_batch.current_students_count or 0) + 1
            assigned_count += 1
            
            print(f"   ✅ Assigned {student.full_name} ({student.class_name}, {student.version}) to {chosen_batch.name}")
        else:
            print(f"   ⚠️ No suitable batch found for {student.full_name} ({student.class_name}, {student.version})")
    
    session.commit()
    print(f"✅ Assigned {assigned_count} students to batches")
    return assigned_count

def create_default_batches(session):
    """Create default batches for classes found in the student data"""
    print("📚 Creating default batches based on student data...")
    
    # Get unique class-version combinations from students
    students = session.exec(select(Student)).all()
    class_version_combinations = set()
    
    for student in students:
        combination = (student.class_name, student.version.value if student.version else 'BV')
        class_version_combinations.add(combination)
    
    print(f"Found {len(class_version_combinations)} unique class-version combinations")
    
    # Define fee structure
    fee_structure = {
        'Class 6': {'BV': 2500, 'EV': 3000},
        'Class 7': {'BV': 2700, 'EV': 3200},
        'Class 8': {'BV': 2900, 'EV': 3400},
        'Class 9': {'BV': 3500, 'EV': 4000},
        'Class 10': {'BV': 3800, 'EV': 4300},
        'SSC': {'BV': 4500, 'EV': 5000},
        'HSC 1st Year': {'BV': 5500, 'EV': 6000},
        'HSC 2nd Year': {'BV': 6000, 'EV': 6500},
        'Class 11': {'BV': 5500, 'EV': 6000},
        'Class 12': {'BV': 6000, 'EV': 6500},
    }
    
    created_count = 0
    for class_name, version in class_version_combinations:
        # Check if batch already exists
        existing_batch = session.exec(
            select(Batch).where(
                Batch.class_name == class_name,
                Batch.version == StudentVersion(version)
            )
        ).first()
        
        if existing_batch:
            print(f"   📚 Batch already exists: {class_name} - {version}")
            continue
        
        # Determine fee
        base_fee = fee_structure.get(class_name, {}).get(version, 3000)
        
        # Create batch name
        version_name = "English Version" if version == 'EV' else "Morning Batch"
        batch_name = f"{class_name} - {version_name}"
        
        # Create batch
        batch = Batch(
            name=batch_name,
            code=f"B{created_count+1:03d}-2025",
            course=f"{class_name} Academic Program",
            class_name=class_name,
            version=StudentVersion(version),
            start_date=datetime(2025, 1, 1),
            end_date=datetime(2025, 12, 31),
            max_students=30,
            min_students=5,
            current_students_count=0,
            schedule_days='["Monday", "Wednesday", "Friday", "Sunday"]',
            time_slot="08:00-12:00" if version == 'BV' else "13:00-17:00",
            fee_amount=base_fee,
            fee_period="monthly",
            status="active",
            notes=f"Academic batch for {class_name} students",
            created_at=datetime.now()
        )
        
        session.add(batch)
        created_count += 1
        print(f"   ✅ Created batch: {batch_name} (Fee: ৳{base_fee})")
    
    session.commit()
    print(f"✅ Created {created_count} new batches")

def display_summary(session):
    """Display a summary of the current state"""
    print("\n📊 CURRENT DATA SUMMARY:")
    print("=" * 40)
    
    students = session.exec(select(Student)).all()
    batches = session.exec(select(Batch)).all()
    students_with_batches = session.exec(select(Student).where(Student.batch_id.isnot(None))).all()
    
    print(f"👥 Total Students: {len(students)}")
    print(f"📚 Total Batches: {len(batches)}")
    print(f"🎯 Students with Batches: {len(students_with_batches)}")
    print(f"📈 Assignment Rate: {len(students_with_batches)/len(students)*100:.1f}%" if students else "0%")
    
    # Show batch distribution
    print("\n📚 BATCH DISTRIBUTION:")
    for batch in batches:
        students_in_batch = session.exec(select(Student).where(Student.batch_id == batch.id)).all()
        print(f"   {batch.name}: {len(students_in_batch)} students (Fee: ৳{batch.fee_amount})")
    
    # Show students without batches
    students_without_batches = session.exec(select(Student).where(Student.batch_id.is_(None))).all()
    if students_without_batches:
        print(f"\n⚠️ Students without batches ({len(students_without_batches)}):")
        for student in students_without_batches[:10]:  # Show first 10
            print(f"   - {student.full_name} ({student.class_name}, {student.version})")
        if len(students_without_batches) > 10:
            print(f"   ... and {len(students_without_batches) - 10} more")

def main():
    """Main function to fix batch assignments"""
    print("🔧 SIMPLE BATCH ASSIGNMENT FIX")
    print("=" * 40)
    
    engine = create_engine(DATABASE_URL)
    
    with Session(engine) as session:
        # Step 1: Assign students to existing batches (create if needed)
        assigned_count = assign_students_to_existing_batches(session)
        
        # Step 2: Display summary
        display_summary(session)
        
        print("\n✅ BATCH ASSIGNMENT COMPLETED!")
        if assigned_count > 0:
            print("🎯 Students are now properly assigned to batches")
            print("📱 Data should be visible in the frontend Class & Student tabs")
            print("💰 Finance tab should show student information organized by batches")
        else:
            print("ℹ️ All students were already assigned to batches")
        
        print("\n🔧 NEXT STEPS:")
        print("   1. Start the backend API: python backend/app/main.py")
        print("   2. Start the frontend: npm run dev (in frontend folder)")
        print("   3. Check Class & Student tab for batch-wise student display")
        print("   4. Check Finance tab for fee collection functionality")

if __name__ == "__main__":
    main()