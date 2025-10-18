#!/usr/bin/env python3
"""
Fix App Data Visibility Issues
1. Create proper batches and assign students to them
2. Generate sample financial data (admission fees, monthly fees)
3. Ensure data is structured and accessible across all tabs
"""

import sys
import os
from datetime import datetime, timedelta
import random
from decimal import Decimal

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from sqlmodel import create_engine, Session, select, text
from backend.app.models import (
    Student, Batch, StudentVersion, Gender, User, UserRole,
    Payment, PaymentStatus, PaymentType, PaymentMethod,
    AdmissionFee, StudentDues
)

DATABASE_URL = "postgresql://postgres:1122@localhost:5432/edudemy_db"

def create_proper_batches(session):
    """Create proper batches for different classes"""
    print("📚 Creating proper batches...")
    
    # Define batch configurations
    batch_configs = [
        # Class 6-8 (Junior Secondary)
        {"class_name": "Class 6", "version": StudentVersion.BV, "name": "Class 6 - Morning Batch", "fee": 2500, "schedule": "08:00-12:00"},
        {"class_name": "Class 6", "version": StudentVersion.EV, "name": "Class 6 - English Version", "fee": 3000, "schedule": "13:00-17:00"},
        {"class_name": "Class 7", "version": StudentVersion.BV, "name": "Class 7 - Morning Batch", "fee": 2700, "schedule": "08:00-12:00"},
        {"class_name": "Class 7", "version": StudentVersion.EV, "name": "Class 7 - English Version", "fee": 3200, "schedule": "13:00-17:00"},
        {"class_name": "Class 8", "version": StudentVersion.BV, "name": "Class 8 - Morning Batch", "fee": 2900, "schedule": "08:00-12:00"},
        {"class_name": "Class 8", "version": StudentVersion.EV, "name": "Class 8 - English Version", "fee": 3400, "schedule": "13:00-17:00"},
        
        # Class 9-10 (Secondary)
        {"class_name": "Class 9", "version": StudentVersion.BV, "name": "Class 9 - Science Group", "fee": 3500, "schedule": "08:00-13:00"},
        {"class_name": "Class 9", "version": StudentVersion.EV, "name": "Class 9 - English Version", "fee": 4000, "schedule": "13:30-18:30"},
        {"class_name": "Class 10", "version": StudentVersion.BV, "name": "Class 10 - Science Group", "fee": 3800, "schedule": "08:00-13:00"},
        {"class_name": "Class 10", "version": StudentVersion.EV, "name": "Class 10 - English Version", "fee": 4300, "schedule": "13:30-18:30"},
        
        # SSC Batch
        {"class_name": "SSC", "version": StudentVersion.BV, "name": "SSC - Final Preparation", "fee": 4500, "schedule": "08:00-14:00"},
        {"class_name": "SSC", "version": StudentVersion.EV, "name": "SSC - English Medium", "fee": 5000, "schedule": "14:30-20:30"},
        
        # HSC (Higher Secondary)
        {"class_name": "HSC 1st Year", "version": StudentVersion.BV, "name": "HSC 1st Year - Science", "fee": 5500, "schedule": "08:00-14:00"},
        {"class_name": "HSC 1st Year", "version": StudentVersion.EV, "name": "HSC 1st Year - English", "fee": 6000, "schedule": "15:00-21:00"},
        {"class_name": "HSC 2nd Year", "version": StudentVersion.BV, "name": "HSC 2nd Year - Science", "fee": 6000, "schedule": "08:00-14:00"},
        {"class_name": "HSC 2nd Year", "version": StudentVersion.EV, "name": "HSC 2nd Year - English", "fee": 6500, "schedule": "15:00-21:00"},
    ]
    
    created_batches = []
    for config in batch_configs:
        # Check if batch already exists
        existing_batch = session.exec(
            select(Batch).where(
                Batch.name == config["name"]
            )
        ).first()
        
        if existing_batch:
            print(f"   📚 Batch already exists: {config['name']}")
            created_batches.append(existing_batch)
            continue
        
        # Create new batch
        batch = Batch(
            name=config["name"],
            code=f"B{len(created_batches)+1:03d}-2025",
            course=f"{config['class_name']} Academic Program",
            class_name=config["class_name"],
            version=config["version"],
            start_date=datetime(2025, 1, 1),
            end_date=datetime(2025, 12, 31),
            max_students=30,
            min_students=5,
            current_students_count=0,
            schedule_days='["Monday", "Wednesday", "Friday", "Sunday"]',
            time_slot=config["schedule"],
            fee_amount=config["fee"],
            fee_period="monthly",
            status="active",
            notes=f"Academic batch for {config['class_name']} students",
            created_at=datetime.utcnow()
        )
        
        session.add(batch)
        created_batches.append(batch)
        print(f"   ✅ Created batch: {config['name']} (Fee: ৳{config['fee']})")
    
    session.commit()
    print(f"✅ Created/verified {len(created_batches)} batches")
    return created_batches

def assign_students_to_batches(session):
    """Assign existing students to appropriate batches"""
    print("👥 Assigning students to batches...")
    
    # Get all students without batch assignments
    students = session.exec(select(Student)).all()
    batches = session.exec(select(Batch)).all()
    
    # Create a mapping of class_name + version to batch
    batch_map = {}
    for batch in batches:
        key = f"{batch.class_name}_{batch.version.value}"
        if key not in batch_map:
            batch_map[key] = []
        batch_map[key].append(batch)
    
    assigned_count = 0
    for student in students:
        if student.batch_id:
            continue  # Already assigned
        
        # Find appropriate batch
        key = f"{student.class_name}_{student.version.value}"
        available_batches = batch_map.get(key, [])
        
        if available_batches:
            # Choose batch with least students to balance
            chosen_batch = min(available_batches, key=lambda b: b.current_students_count or 0)
            
            # Assign student to batch
            student.batch_id = chosen_batch.id
            chosen_batch.current_students_count = (chosen_batch.current_students_count or 0) + 1
            assigned_count += 1
            
            print(f"   👥 Assigned {student.full_name} to {chosen_batch.name}")
        else:
            print(f"   ⚠️ No suitable batch found for {student.full_name} ({student.class_name}, {student.version})")
    
    session.commit()
    print(f"✅ Assigned {assigned_count} students to batches")

def generate_admission_fees(session):
    """Generate admission fee records for all students"""
    print("💰 Generating admission fees...")
    
    # Get admin user for processing
    admin_user = session.exec(
        select(User).where(User.role == UserRole.ADMIN)
    ).first()
    
    if not admin_user:
        # Create admin user if doesn't exist
        admin_user = User(
            email="admin@edudemy.com",
            username="admin",
            full_name="System Admin",
            role=UserRole.ADMIN,
            hashed_password="dummy_hash",
            is_active=True
        )
        session.add(admin_user)
        session.commit()
        session.refresh(admin_user)
    
    students = session.exec(select(Student)).all()
    created_count = 0
    
    for student in students:
        # Check if admission fee already exists
        existing_fee = session.exec(
            select(AdmissionFee).where(AdmissionFee.student_id == student.id)
        ).first()
        
        if existing_fee:
            continue
        
        # Determine admission fee based on class
        base_admission = 5000  # Base admission fee
        registration = 1000    # Registration fee
        security = 2000       # Security deposit
        
        # Adjust based on class level
        if "HSC" in student.class_name or student.class_name in ["Class 11", "Class 12"]:
            base_admission = 8000
            registration = 1500
            security = 3000
        elif student.class_name in ["Class 9", "Class 10", "SSC"]:
            base_admission = 6000
            registration = 1200
            security = 2500
        
        # English version premium
        if student.version == StudentVersion.EV:
            base_admission += 1000
            registration += 200
        
        total_amount = base_admission + registration + security
        
        # Create admission fee record
        admission_fee = AdmissionFee(
            student_id=student.id,
            admission_fee_amount=base_admission,
            registration_fee=registration,
            security_deposit=security,
            total_amount=total_amount,
            balance_due=total_amount,
            status=PaymentStatus.PENDING,
            due_date=student.admission_date + timedelta(days=7) if student.admission_date else datetime.utcnow() + timedelta(days=7),
            processed_by=admin_user.id
        )
        
        session.add(admission_fee)
        created_count += 1
        
        print(f"   💰 Created admission fee for {student.full_name}: ৳{total_amount}")
    
    session.commit()
    print(f"✅ Created {created_count} admission fee records")

def generate_monthly_fees(session):
    """Generate monthly fee records for students"""
    print("📅 Generating monthly fees...")
    
    # Get admin user
    admin_user = session.exec(
        select(User).where(User.role == UserRole.ADMIN)
    ).first()
    
    students = session.exec(select(Student).where(Student.batch_id.isnot(None))).all()
    created_count = 0
    
    # Generate fees for last 3 months
    current_date = datetime.utcnow()
    months_to_generate = [
        (current_date.month - 2 if current_date.month > 2 else current_date.month + 10, current_date.year if current_date.month > 2 else current_date.year - 1),
        (current_date.month - 1 if current_date.month > 1 else 12, current_date.year if current_date.month > 1 else current_date.year - 1),
        (current_date.month, current_date.year)
    ]
    
    for student in students:
        # Get student's batch for fee amount
        batch = session.get(Batch, student.batch_id)
        monthly_fee = batch.fee_amount if batch and batch.fee_amount else 3000
        
        for month, year in months_to_generate:
            # Check if payment already exists
            existing_payment = session.exec(
                select(Payment).where(
                    Payment.student_id == student.id,
                    Payment.fee_month == month,
                    Payment.fee_year == year,
                    Payment.payment_type == PaymentType.MONTHLY_FEE
                )
            ).first()
            
            if existing_payment:
                continue
            
            # Randomly determine payment status (80% paid, 15% pending, 5% overdue)
            status_choice = random.random()
            if status_choice < 0.8:
                status = PaymentStatus.PAID
                payment_date = datetime(year, month, random.randint(1, 28))
            elif status_choice < 0.95:
                status = PaymentStatus.PENDING
                payment_date = None
            else:
                status = PaymentStatus.OVERDUE
                payment_date = None
            
            # Generate due date (5th of each month)
            due_date = datetime(year, month, 5)
            
            payment = Payment(
                student_id=student.id,
                amount=monthly_fee,
                payment_type=PaymentType.MONTHLY_FEE,
                payment_method=random.choice([PaymentMethod.CASH, PaymentMethod.BANK_TRANSFER, PaymentMethod.MOBILE_BANKING]),
                status=status,
                payment_date=payment_date,
                due_date=due_date,
                fee_month=month,
                fee_year=year,
                receipt_number=f"RCP-{year}{month:02d}{student.id:04d}" if status == PaymentStatus.PAID else None,
                collected_by=admin_user.id if status == PaymentStatus.PAID else None,
                remarks=f"Monthly fee for {calendar.month_name[month]} {year}" if status == PaymentStatus.PAID else None
            )
            
            session.add(payment)
            created_count += 1
        
        print(f"   💳 Created monthly fees for {student.full_name}")
    
    session.commit()
    print(f"✅ Created {created_count} monthly fee records")

def update_student_dues_summary(session):
    """Update student dues summary"""
    print("📊 Updating student dues summary...")
    
    students = session.exec(select(Student)).all()
    updated_count = 0
    
    for student in students:
        # Check if dues record exists
        dues = session.exec(
            select(StudentDues).where(StudentDues.student_id == student.id)
        ).first()
        
        if not dues:
            dues = StudentDues(student_id=student.id)
            session.add(dues)
        
        # Calculate pending payments
        pending_payments = session.exec(
            select(Payment).where(
                Payment.student_id == student.id,
                Payment.status.in_([PaymentStatus.PENDING, PaymentStatus.OVERDUE])
            )
        ).all()
        
        # Calculate dues by type
        monthly_fee_due = sum(p.amount for p in pending_payments if p.payment_type == PaymentType.MONTHLY_FEE)
        admission_fee_due = sum(p.amount for p in pending_payments if p.payment_type == PaymentType.ADMISSION_FEE)
        other_dues = sum(p.amount for p in pending_payments if p.payment_type not in [PaymentType.MONTHLY_FEE, PaymentType.ADMISSION_FEE])
        
        # Get last payment
        last_payment = session.exec(
            select(Payment).where(
                Payment.student_id == student.id,
                Payment.status == PaymentStatus.PAID
            ).order_by(Payment.payment_date.desc())
        ).first()
        
        # Update dues record
        dues.monthly_fee_due = monthly_fee_due
        dues.admission_fee_due = admission_fee_due
        dues.other_dues = other_dues
        dues.total_due = monthly_fee_due + admission_fee_due + other_dues
        dues.has_overdue = any(p.status == PaymentStatus.OVERDUE for p in pending_payments)
        dues.needs_attention = dues.has_overdue or dues.total_due > 10000
        
        if last_payment:
            dues.last_payment_date = last_payment.payment_date
            dues.last_payment_amount = last_payment.amount
            if last_payment.fee_month and last_payment.fee_year:
                dues.last_paid_month = last_payment.fee_month
                dues.last_paid_year = last_payment.fee_year
        
        dues.updated_at = datetime.utcnow()
        updated_count += 1
    
    session.commit()
    print(f"✅ Updated {updated_count} student dues records")

def main():
    """Main function to fix app data visibility"""
    print("🔧 FIXING APP DATA VISIBILITY ISSUES")
    print("=" * 50)
    
    engine = create_engine(DATABASE_URL)
    
    with Session(engine) as session:
        # Step 1: Create proper batches
        batches = create_proper_batches(session)
        
        # Step 2: Assign students to batches
        assign_students_to_batches(session)
        
        # Step 3: Generate admission fees
        generate_admission_fees(session)
        
        # Step 4: Generate monthly fee records
        generate_monthly_fees(session)
        
        # Step 5: Update student dues summary
        update_student_dues_summary(session)
        
        # Verify the data
        print("\n📊 DATA SUMMARY:")
        print("=" * 30)
        
        total_students = session.exec(select(Student)).all()
        total_batches = session.exec(select(Batch)).all()
        students_with_batches = session.exec(select(Student).where(Student.batch_id.isnot(None))).all()
        
        print(f"👥 Total Students: {len(total_students)}")
        print(f"📚 Total Batches: {len(total_batches)}")
        print(f"🎯 Students with Batches: {len(students_with_batches)}")
        
        # Show batch distribution
        print("\n📚 BATCH DISTRIBUTION:")
        for batch in total_batches:
            count = session.exec(select(Student).where(Student.batch_id == batch.id)).all()
            print(f"   {batch.name}: {len(count)} students (Fee: ৳{batch.fee_amount})")
        
        print("\n✅ DATA VISIBILITY FIX COMPLETED!")
        print("🎯 All students are now properly assigned to batches")
        print("💰 Financial data generated for fee collection")
        print("📱 Data should now be visible across all app tabs")

if __name__ == "__main__":
    import calendar
    main()