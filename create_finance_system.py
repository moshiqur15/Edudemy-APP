#!/usr/bin/env python3
"""
Create Complete Finance System
Generate finance data using the correct database schema
"""

import sys
import os
from datetime import datetime, timedelta
import random
import calendar

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from sqlmodel import create_engine, Session, select, text
from backend.app.models import Student, Batch, User, UserRole

DATABASE_URL = "postgresql://postgres:1122@localhost:5432/edudemy_db"

def create_payment_records_with_raw_sql(session, engine):
    """Create payment records using raw SQL to match exact database schema"""
    print("💰 Creating payment records using actual database schema...")
    
    # Get students with their batches
    students = session.exec(
        select(Student)
        .where(Student.batch_id.isnot(None))
        .limit(50)  # Create payments for first 50 students
    ).all()
    
    # Get or create admin user for collected_by
    admin_user = session.exec(select(User).where(User.role == UserRole.ADMIN)).first()
    if not admin_user:
        # Create admin user
        admin_user = User(
            email="admin@edudemy.com",
            username="admin", 
            full_name="Finance Admin",
            role=UserRole.ADMIN,
            hashed_password="dummy_hash",
            is_active=True
        )
        session.add(admin_user)
        session.commit()
        session.refresh(admin_user)
    
    created_count = 0
    current_date = datetime.now()
    
    # Create payments for last 3 months
    months_to_create = [
        (current_date.month - 2 if current_date.month > 2 else current_date.month + 10, 
         current_date.year if current_date.month > 2 else current_date.year - 1),
        (current_date.month - 1 if current_date.month > 1 else 12, 
         current_date.year if current_date.month > 1 else current_date.year - 1),
        (current_date.month, current_date.year)
    ]
    
    with engine.connect() as conn:
        for student in students:
            # Get student's batch for fee amount
            batch = session.get(Batch, student.batch_id) if student.batch_id else None
            monthly_fee = batch.fee_amount if batch and batch.fee_amount else 3000
            
            for month, year in months_to_create:
                # Check if payment already exists
                existing_check = conn.execute(text("""
                    SELECT COUNT(*) FROM payment 
                    WHERE student_id = :student_id 
                    AND payment_type = 'monthly_fee'
                    AND remarks LIKE :month_pattern
                """), {
                    "student_id": student.id,
                    "month_pattern": f"%{calendar.month_name[month]} {year}%"
                })
                
                if existing_check.scalar() > 0:
                    continue
                
                # Randomly determine payment status (75% paid, 25% pending)
                is_paid = random.random() < 0.75
                status = "paid" if is_paid else "pending"
                payment_method = random.choice(["cash", "bank_transfer", "mobile_banking"])
                
                # Set dates
                payment_date = datetime(year, month, random.randint(1, 28)) if is_paid else None
                due_date = datetime(year, month, 5)  # Due on 5th of each month
                
                # Create payment record
                conn.execute(text("""
                    INSERT INTO payment (
                        student_id, amount, payment_type, payment_method, 
                        payment_date, due_date, status, remarks, collected_by
                    ) VALUES (
                        :student_id, :amount, :payment_type, :payment_method,
                        :payment_date, :due_date, :status, :remarks, :collected_by
                    )
                """), {
                    "student_id": student.id,
                    "amount": monthly_fee,
                    "payment_type": "monthly_fee",
                    "payment_method": payment_method,
                    "payment_date": payment_date,
                    "due_date": due_date,
                    "status": status,
                    "remarks": f"Monthly fee for {calendar.month_name[month]} {year}",
                    "collected_by": admin_user.id if is_paid else None
                })
                created_count += 1
        
        conn.commit()
    
    print(f"✅ Created {created_count} monthly payment records")
    return created_count

def create_admission_fee_records(session, engine):
    """Create admission fee records"""
    print("\n🎓 Creating admission fee records...")
    
    students = session.exec(select(Student).limit(30)).all()
    admin_user = session.exec(select(User).where(User.role == UserRole.ADMIN)).first()
    
    created_count = 0
    
    with engine.connect() as conn:
        for student in students:
            # Check if admission fee already exists
            existing_check = conn.execute(text("""
                SELECT COUNT(*) FROM admissionfee WHERE student_id = :student_id
            """), {"student_id": student.id})
            
            if existing_check.scalar() > 0:
                continue
            
            # Determine admission fee based on class
            base_admission = 5000
            registration = 1000
            security = 2000
            
            if "HSC" in student.class_name:
                base_admission = 8000
                registration = 1500
                security = 3000
            elif student.class_name in ["Class 9", "Class 10", "SSC"]:
                base_admission = 6000
                registration = 1200
                security = 2500
            
            # English version premium
            if student.version == "EV":
                base_admission += 1000
                registration += 200
            
            total_amount = base_admission + registration + security
            
            # 70% paid, 30% pending
            is_paid = random.random() < 0.7
            status = "paid" if is_paid else "pending"
            amount_paid = total_amount if is_paid else 0
            balance_due = 0 if is_paid else total_amount
            
            # Create admission fee record
            conn.execute(text("""
                INSERT INTO admissionfee (
                    student_id, admission_fee_amount, registration_fee, security_deposit,
                    total_amount, amount_paid, balance_due, status, processed_by, created_at
                ) VALUES (
                    :student_id, :admission_fee_amount, :registration_fee, :security_deposit,
                    :total_amount, :amount_paid, :balance_due, :status, :processed_by, :created_at
                )
            """), {
                "student_id": student.id,
                "admission_fee_amount": base_admission,
                "registration_fee": registration,
                "security_deposit": security,
                "total_amount": total_amount,
                "amount_paid": amount_paid,
                "balance_due": balance_due,
                "status": status,
                "processed_by": admin_user.id,
                "created_at": datetime.now()
            })
            
            # If paid, create corresponding payment record
            if is_paid:
                conn.execute(text("""
                    INSERT INTO payment (
                        student_id, amount, payment_type, payment_method,
                        payment_date, status, remarks, collected_by
                    ) VALUES (
                        :student_id, :amount, :payment_type, :payment_method,
                        :payment_date, :status, :remarks, :collected_by
                    )
                """), {
                    "student_id": student.id,
                    "amount": total_amount,
                    "payment_type": "admission_fee",
                    "payment_method": "cash",
                    "payment_date": student.admission_date or datetime.now(),
                    "status": "paid",
                    "remarks": f"Admission fee for {student.class_name}",
                    "collected_by": admin_user.id
                })
            
            created_count += 1
            print(f"   💰 {student.full_name}: ৳{total_amount} ({status})")
        
        conn.commit()
    
    print(f"✅ Created {created_count} admission fee records")
    return created_count

def create_student_dues_summary(session, engine):
    """Create/update student dues summary"""
    print("\n📊 Creating student dues summary...")
    
    students = session.exec(select(Student)).all()
    updated_count = 0
    
    with engine.connect() as conn:
        for student in students:
            # Calculate pending payment amounts
            pending_result = conn.execute(text("""
                SELECT 
                    COALESCE(SUM(CASE WHEN payment_type = 'monthly_fee' THEN amount ELSE 0 END), 0) as monthly_due,
                    COALESCE(SUM(CASE WHEN payment_type = 'admission_fee' THEN amount ELSE 0 END), 0) as admission_due,
                    COALESCE(SUM(CASE WHEN payment_type NOT IN ('monthly_fee', 'admission_fee') THEN amount ELSE 0 END), 0) as other_due
                FROM payment 
                WHERE student_id = :student_id AND status IN ('pending', 'overdue')
            """), {"student_id": student.id})
            
            dues_data = pending_result.fetchone()
            monthly_due = float(dues_data[0]) if dues_data[0] else 0.0
            admission_due = float(dues_data[1]) if dues_data[1] else 0.0
            other_due = float(dues_data[2]) if dues_data[2] else 0.0
            total_due = monthly_due + admission_due + other_due
            
            # Get last payment info
            last_payment = conn.execute(text("""
                SELECT payment_date, amount FROM payment 
                WHERE student_id = :student_id AND status = 'paid'
                ORDER BY payment_date DESC LIMIT 1
            """), {"student_id": student.id}).fetchone()
            
            last_payment_date = last_payment[0] if last_payment else None
            last_payment_amount = float(last_payment[1]) if last_payment else 0.0
            
            # Check if dues record exists
            existing_dues = conn.execute(text("""
                SELECT id FROM studentdues WHERE student_id = :student_id
            """), {"student_id": student.id}).fetchone()
            
            if existing_dues:
                # Update existing record
                conn.execute(text("""
                    UPDATE studentdues SET
                        monthly_fee_due = :monthly_due,
                        admission_fee_due = :admission_due,
                        other_dues = :other_due,
                        total_due = :total_due,
                        last_payment_date = :last_payment_date,
                        last_payment_amount = :last_payment_amount,
                        has_overdue = :has_overdue,
                        needs_attention = :needs_attention,
                        updated_at = :updated_at
                    WHERE student_id = :student_id
                """), {
                    "student_id": student.id,
                    "monthly_due": monthly_due,
                    "admission_due": admission_due,
                    "other_due": other_due,
                    "total_due": total_due,
                    "last_payment_date": last_payment_date,
                    "last_payment_amount": last_payment_amount,
                    "has_overdue": total_due > 0,
                    "needs_attention": total_due > 5000,
                    "updated_at": datetime.now()
                })
            else:
                # Create new record
                conn.execute(text("""
                    INSERT INTO studentdues (
                        student_id, monthly_fee_due, admission_fee_due, other_dues, total_due,
                        last_payment_date, last_payment_amount, has_overdue, needs_attention, updated_at
                    ) VALUES (
                        :student_id, :monthly_due, :admission_due, :other_due, :total_due,
                        :last_payment_date, :last_payment_amount, :has_overdue, :needs_attention, :updated_at
                    )
                """), {
                    "student_id": student.id,
                    "monthly_due": monthly_due,
                    "admission_due": admission_due,
                    "other_due": other_due,
                    "total_due": total_due,
                    "last_payment_date": last_payment_date,
                    "last_payment_amount": last_payment_amount,
                    "has_overdue": total_due > 0,
                    "needs_attention": total_due > 5000,
                    "updated_at": datetime.now()
                })
            
            updated_count += 1
        
        conn.commit()
    
    print(f"✅ Updated {updated_count} student dues records")
    return updated_count

def display_finance_dashboard(engine):
    """Display finance dashboard statistics"""
    print("\n💰 FINANCE DASHBOARD STATISTICS")
    print("=" * 50)
    
    with engine.connect() as conn:
        # Monthly collections this month
        current_month = datetime.now().month
        current_year = datetime.now().year
        
        monthly_stats = conn.execute(text("""
            SELECT 
                COUNT(*) as total_payments,
                COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as collected,
                COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending
            FROM payment 
            WHERE payment_type = 'monthly_fee'
        """)).fetchone()
        
        admission_stats = conn.execute(text("""
            SELECT 
                COUNT(*) as total_admissions,
                COALESCE(SUM(total_amount), 0) as total_admission_amount,
                COALESCE(SUM(amount_paid), 0) as paid_admission_amount,
                COALESCE(SUM(balance_due), 0) as pending_admission_amount
            FROM admissionfee
        """)).fetchone()
        
        dues_stats = conn.execute(text("""
            SELECT 
                COUNT(*) as students_with_dues,
                COALESCE(SUM(total_due), 0) as total_outstanding,
                COUNT(CASE WHEN needs_attention THEN 1 END) as needs_attention
            FROM studentdues 
            WHERE total_due > 0
        """)).fetchone()
        
        print("📅 MONTHLY FEE COLLECTIONS:")
        print(f"   Total Payments: {monthly_stats[0]}")
        print(f"   Amount Collected: ৳{monthly_stats[1]:,.2f}")
        print(f"   Amount Pending: ৳{monthly_stats[2]:,.2f}")
        
        print("\n🎓 ADMISSION FEES:")
        print(f"   Total Students: {admission_stats[0]}")
        print(f"   Total Amount: ৳{admission_stats[1]:,.2f}")
        print(f"   Amount Collected: ৳{admission_stats[2]:,.2f}")
        print(f"   Amount Pending: ৳{admission_stats[3]:,.2f}")
        
        print("\n📊 OUTSTANDING DUES:")
        print(f"   Students with Dues: {dues_stats[0]}")
        print(f"   Total Outstanding: ৳{dues_stats[1]:,.2f}")
        print(f"   Students Needing Attention: {dues_stats[2]}")
        
        print(f"\n💵 OVERALL SUMMARY:")
        total_collected = float(monthly_stats[1]) + float(admission_stats[2])
        total_pending = float(monthly_stats[2]) + float(admission_stats[3])
        print(f"   Total Collected: ৳{total_collected:,.2f}")
        print(f"   Total Pending: ৳{total_pending:,.2f}")
        print(f"   Collection Rate: {(total_collected/(total_collected + total_pending)*100):.1f}%")

def main():
    """Main function to create complete finance system"""
    print("💰 CREATING COMPLETE FINANCE SYSTEM")
    print("=" * 60)
    
    engine = create_engine(DATABASE_URL)
    
    with Session(engine) as session:
        # Step 1: Create monthly payment records
        monthly_payments = create_payment_records_with_raw_sql(session, engine)
        
        # Step 2: Create admission fee records
        admission_fees = create_admission_fee_records(session, engine)
        
        # Step 3: Create/update student dues summary
        dues_updated = create_student_dues_summary(session, engine)
        
        # Step 4: Display finance dashboard
        display_finance_dashboard(engine)
        
        print("\n✅ FINANCE SYSTEM CREATION COMPLETED!")
        print("🎯 What was created:")
        print(f"   📅 {monthly_payments} monthly payment records")
        print(f"   🎓 {admission_fees} admission fee records")
        print(f"   📊 {dues_updated} student dues summaries")
        print("   💰 Complete finance data structure")
        
        print("\n🚀 FINANCE TAB FEATURES NOW AVAILABLE:")
        print("   ✅ Monthly fee collection with payment status")
        print("   ✅ Admission fee tracking and management")
        print("   ✅ Student dues summary and outstanding amounts")
        print("   ✅ Payment history and transaction records")
        print("   ✅ Financial dashboard with statistics")
        print("   ✅ Overdue payment tracking")
        print("   ✅ Collection rate analytics")
        
        print("\n🔧 NEXT STEPS:")
        print("   1. Start backend API server")
        print("   2. Navigate to Finance tab in frontend")
        print("   3. Test fee collection functionality")
        print("   4. Test admission fee management")
        print("   5. View financial dashboard and reports")

if __name__ == "__main__":
    main()