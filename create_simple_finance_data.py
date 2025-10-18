#!/usr/bin/env python3
"""
Create Simple Finance Data
Generate basic payment records that work with the existing database schema
"""

import sys
import os
from datetime import datetime, date
import random

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from sqlmodel import create_engine, Session, select
from backend.app.models import Student, Batch, Payment, PaymentStatus, PaymentType, PaymentMethod

DATABASE_URL = "postgresql://postgres:1122@localhost:5432/edudemy_db"

def create_basic_payment_records(session):
    """Create basic payment records for the finance tab"""
    print("💰 Creating basic payment records for Finance tab...")
    
    # Get first 30 students for sample data
    students = session.exec(select(Student).limit(30)).all()
    
    current_month = datetime.now().month
    current_year = datetime.now().year
    
    created_count = 0
    for student in students:
        # Skip if payment already exists
        existing_payment = session.exec(
            select(Payment).where(Payment.student_id == student.id).limit(1)
        ).first()
        
        if existing_payment:
            continue
        
        # Get student's batch for fee amount
        batch = session.get(Batch, student.batch_id) if student.batch_id else None
        fee_amount = batch.fee_amount if batch and batch.fee_amount else 3000
        
        # Create payment record (80% paid, 20% pending)
        status = PaymentStatus.PAID if random.random() < 0.8 else PaymentStatus.PENDING
        payment_method = random.choice([
            PaymentMethod.CASH,
            PaymentMethod.BANK_TRANSFER, 
            PaymentMethod.MOBILE_BANKING
        ])
        
        payment = Payment(
            student_id=student.id,
            amount=fee_amount,
            payment_type=PaymentType.MONTHLY_FEE,
            payment_method=payment_method,
            status=status,
            payment_date=datetime.now() if status == PaymentStatus.PAID else None,
            due_date=datetime(current_year, current_month, 5),
            fee_month=current_month,
            fee_year=current_year,
            remarks=f"Monthly fee for {student.class_name}" if status == PaymentStatus.PAID else "Pending payment"
        )
        
        session.add(payment)
        created_count += 1
        print(f"   💳 Created payment for {student.full_name}: ৳{fee_amount} ({status})")
    
    session.commit()
    print(f"✅ Created {created_count} payment records")
    return created_count

def create_sample_admission_fees(session):
    """Create sample admission fee records"""
    print("\n🎓 Creating sample admission fee records...")
    
    # Get students who don't have admission payments
    students_without_admission = []
    students = session.exec(select(Student).limit(20)).all()
    
    for student in students:
        admission_payment = session.exec(
            select(Payment).where(
                Payment.student_id == student.id,
                Payment.payment_type == PaymentType.ADMISSION_FEE
            )
        ).first()
        
        if not admission_payment:
            students_without_admission.append(student)
    
    created_count = 0
    for student in students_without_admission[:10]:  # Create for first 10
        # Determine admission fee based on class
        base_admission = 5000
        if "HSC" in student.class_name:
            base_admission = 8000
        elif student.class_name in ["Class 9", "Class 10", "SSC"]:
            base_admission = 6000
        
        # English version premium
        if student.version.value == 'EV':
            base_admission += 1000
        
        # 70% paid, 30% pending
        status = PaymentStatus.PAID if random.random() < 0.7 else PaymentStatus.PENDING
        
        admission_payment = Payment(
            student_id=student.id,
            amount=base_admission,
            payment_type=PaymentType.ADMISSION_FEE,
            payment_method=PaymentMethod.CASH,
            status=status,
            payment_date=student.admission_date if status == PaymentStatus.PAID else None,
            due_date=student.admission_date if student.admission_date else datetime.now(),
            remarks=f"Admission fee for {student.class_name}"
        )
        
        session.add(admission_payment)
        created_count += 1
        print(f"   🎓 Created admission fee for {student.full_name}: ৳{base_admission} ({status})")
    
    session.commit()
    print(f"✅ Created {created_count} admission fee records")
    return created_count

def display_finance_summary(session):
    """Display finance data summary"""
    print("\n💰 FINANCE DATA SUMMARY:")
    print("=" * 40)
    
    # Count payments by type
    monthly_payments = session.exec(select(Payment).where(Payment.payment_type == PaymentType.MONTHLY_FEE)).all()
    admission_payments = session.exec(select(Payment).where(Payment.payment_type == PaymentType.ADMISSION_FEE)).all()
    
    paid_monthly = [p for p in monthly_payments if p.status == PaymentStatus.PAID]
    pending_monthly = [p for p in monthly_payments if p.status == PaymentStatus.PENDING]
    
    paid_admission = [p for p in admission_payments if p.status == PaymentStatus.PAID]
    pending_admission = [p for p in admission_payments if p.status == PaymentStatus.PENDING]
    
    print(f"📅 Monthly Fee Payments: {len(monthly_payments)} total")
    print(f"   ✅ Paid: {len(paid_monthly)}")
    print(f"   ⏳ Pending: {len(pending_monthly)}")
    
    print(f"\n🎓 Admission Fee Payments: {len(admission_payments)} total")
    print(f"   ✅ Paid: {len(paid_admission)}")
    print(f"   ⏳ Pending: {len(pending_admission)}")
    
    # Calculate totals
    total_monthly_paid = sum(p.amount for p in paid_monthly)
    total_monthly_pending = sum(p.amount for p in pending_monthly)
    total_admission_paid = sum(p.amount for p in paid_admission)
    total_admission_pending = sum(p.amount for p in pending_admission)
    
    print(f"\n💵 FINANCIAL TOTALS:")
    print(f"   Monthly Fees Collected: ৳{total_monthly_paid:,.2f}")
    print(f"   Monthly Fees Pending: ৳{total_monthly_pending:,.2f}")
    print(f"   Admission Fees Collected: ৳{total_admission_paid:,.2f}")
    print(f"   Admission Fees Pending: ৳{total_admission_pending:,.2f}")
    print(f"   TOTAL COLLECTED: ৳{total_monthly_paid + total_admission_paid:,.2f}")
    print(f"   TOTAL PENDING: ৳{total_monthly_pending + total_admission_pending:,.2f}")

def main():
    """Main function to create finance data"""
    print("💰 CREATING SIMPLE FINANCE DATA")
    print("=" * 40)
    
    engine = create_engine(DATABASE_URL)
    
    with Session(engine) as session:
        # Step 1: Create basic payment records
        monthly_payments_created = create_basic_payment_records(session)
        
        # Step 2: Create admission fee records
        admission_fees_created = create_sample_admission_fees(session)
        
        # Step 3: Display summary
        display_finance_summary(session)
        
        print("\n✅ FINANCE DATA CREATION COMPLETED!")
        print("🎯 What was created:")
        print(f"   📅 {monthly_payments_created} monthly fee records")
        print(f"   🎓 {admission_fees_created} admission fee records")
        print("   💰 Structured data for Finance tab functionality")
        
        print("\n🚀 FINANCE TAB SHOULD NOW WORK:")
        print("   ✅ Fee Collection tab will show students with payment status")
        print("   ✅ Admission Fee tab will show pending admission fees")
        print("   ✅ Payment records are organized and searchable")
        print("   ✅ Monthly fee collection interface is ready")
        
        print("\n🔧 NEXT STEPS:")
        print("   1. Start backend: python -m uvicorn backend.app.main:app --reload --port 8000")
        print("   2. Start frontend: npm run dev")
        print("   3. Navigate to Finance tab")
        print("   4. Test fee collection functionality")

if __name__ == "__main__":
    main()