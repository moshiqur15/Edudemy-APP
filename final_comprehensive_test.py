#!/usr/bin/env python3
"""
Final Comprehensive Test
Test all systems: Students, Batches, Classes, Finance
"""

import sys
import os
from datetime import datetime

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from sqlmodel import create_engine, Session, select, text
from backend.app.models import Student, Batch, User

DATABASE_URL = "postgresql://postgres:1122@localhost:5432/edudemy_db"

def test_student_system(engine):
    """Test student and batch management"""
    print("👥 TESTING STUDENT & BATCH SYSTEM")
    print("=" * 40)
    
    with engine.connect() as conn:
        # Test student data
        students_total = conn.execute(text("SELECT COUNT(*) FROM student")).scalar()
        students_with_batches = conn.execute(text("SELECT COUNT(*) FROM student WHERE batch_id IS NOT NULL")).scalar()
        
        print(f"   Total Students: {students_total}")
        print(f"   Students with Batches: {students_with_batches}")
        print(f"   Assignment Rate: {students_with_batches/students_total*100:.1f}%")
        
        # Test batch distribution
        batch_stats = conn.execute(text("""
            SELECT 
                b.name,
                b.class_name,
                b.current_students_count,
                b.fee_amount
            FROM batch b 
            WHERE b.current_students_count > 0
            ORDER BY b.class_name, b.name
        """)).fetchall()
        
        print(f"\n   📚 Active Batches ({len(batch_stats)}):")
        for batch in batch_stats:
            print(f"     {batch[1]}: {batch[0]} - {batch[2]} students (৳{batch[3]})")
        
        return students_total > 0 and students_with_batches > 0

def test_finance_system(engine):
    """Test finance functionality"""
    print("\n💰 TESTING FINANCE SYSTEM")
    print("=" * 40)
    
    with engine.connect() as conn:
        # Test payment records
        payment_stats = conn.execute(text("""
            SELECT 
                COUNT(*) as total_payments,
                COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_payments,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments,
                COALESCE(SUM(amount), 0) as total_amount
            FROM payment
        """)).fetchone()
        
        print(f"   Total Payments: {payment_stats[0]}")
        print(f"   Paid Payments: {payment_stats[1]}")
        print(f"   Pending Payments: {payment_stats[2]}")
        print(f"   Total Amount: ৳{payment_stats[3]:,.2f}")
        
        # Test student dues
        dues_stats = conn.execute(text("""
            SELECT 
                COUNT(*) as total_records,
                COUNT(CASE WHEN total_due > 0 THEN 1 END) as students_with_dues,
                COALESCE(SUM(total_due), 0) as total_outstanding
            FROM studentdues
        """)).fetchone()
        
        print(f"   Students Tracked: {dues_stats[0]}")
        print(f"   Students with Dues: {dues_stats[1]}")
        print(f"   Total Outstanding: ৳{dues_stats[2]:,.2f}")
        
        return payment_stats[0] > 0

def test_class_student_functionality(engine):
    """Test class and student tab functionality"""
    print("\n🎓 TESTING CLASS & STUDENT FUNCTIONALITY")
    print("=" * 40)
    
    with engine.connect() as conn:
        # Test class distribution
        class_stats = conn.execute(text("""
            SELECT 
                s.class_name,
                COUNT(*) as student_count,
                COUNT(DISTINCT s.batch_id) as batch_count
            FROM student s
            WHERE s.class_name IS NOT NULL
            GROUP BY s.class_name
            ORDER BY s.class_name
        """)).fetchall()
        
        print(f"   Classes Available: {len(class_stats)}")
        for class_stat in class_stats:
            print(f"     {class_stat[0]}: {class_stat[1]} students in {class_stat[2]} batches")
        
        # Test batch-wise student organization
        batch_student_stats = conn.execute(text("""
            SELECT 
                b.class_name,
                b.name as batch_name,
                COUNT(s.id) as actual_student_count,
                b.current_students_count as recorded_count
            FROM batch b
            LEFT JOIN student s ON s.batch_id = b.id
            WHERE b.current_students_count > 0
            GROUP BY b.id, b.class_name, b.name, b.current_students_count
            ORDER BY b.class_name, b.name
        """)).fetchall()
        
        print(f"\n   Batch-Student Alignment:")
        alignment_correct = True
        for stat in batch_student_stats:
            actual = stat[2]
            recorded = stat[3]
            status = "✅" if actual == recorded else "⚠️"
            if actual != recorded:
                alignment_correct = False
            print(f"     {status} {stat[0]} - {stat[1]}: {actual}/{recorded}")
        
        return len(class_stats) > 0 and alignment_correct

def test_api_endpoints_readiness(engine):
    """Test if data is ready for API endpoints"""
    print("\n🌐 TESTING API READINESS")
    print("=" * 40)
    
    with engine.connect() as conn:
        # Test student API data
        api_ready_students = conn.execute(text("""
            SELECT 
                s.id,
                s.full_name,
                s.class_name,
                s.batch_id,
                b.name as batch_name
            FROM student s
            LEFT JOIN batch b ON s.batch_id = b.id
            WHERE s.batch_id IS NOT NULL
            LIMIT 5
        """)).fetchall()
        
        print(f"   Sample API-Ready Students:")
        for student in api_ready_students:
            print(f"     ID {student[0]}: {student[1]} ({student[2]}) -> {student[4]}")
        
        # Test finance API data
        finance_api_data = conn.execute(text("""
            SELECT 
                s.full_name,
                p.amount,
                p.status,
                p.payment_type
            FROM student s
            JOIN payment p ON s.id = p.student_id
            LIMIT 5
        """)).fetchall()
        
        print(f"\n   Sample Finance API Data:")
        for payment in finance_api_data:
            print(f"     {payment[0]}: ৳{payment[1]} ({payment[2]}, {payment[3]})")
        
        return len(api_ready_students) > 0 and len(finance_api_data) > 0

def run_final_system_test():
    """Run comprehensive system test"""
    print("🚀 FINAL COMPREHENSIVE SYSTEM TEST")
    print("=" * 60)
    print(f"Test Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    engine = create_engine(DATABASE_URL)
    
    # Run all tests
    test_results = {}
    test_results['students'] = test_student_system(engine)
    test_results['finance'] = test_finance_system(engine)
    test_results['classes'] = test_class_student_functionality(engine)
    test_results['api_ready'] = test_api_endpoints_readiness(engine)
    
    # Summary
    print("\n" + "=" * 60)
    print("🎯 FINAL TEST RESULTS")
    print("=" * 60)
    
    passed_tests = sum(test_results.values())
    total_tests = len(test_results)
    
    for test_name, result in test_results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {test_name.upper()}: {status}")
    
    print(f"\n📊 Overall Score: {passed_tests}/{total_tests} ({passed_tests/total_tests*100:.1f}%)")
    
    if passed_tests == total_tests:
        print("\n🎉 ALL SYSTEMS OPERATIONAL!")
        print("🚀 Your Edudemy application is ready for production!")
        print("\n✅ Ready Components:")
        print("   - Student Management System")
        print("   - Batch Organization System") 
        print("   - Class & Student Navigation")
        print("   - Finance Management System")
        print("   - Payment Processing")
        print("   - Student Dues Tracking")
        print("   - API-Ready Data Structure")
        
        print("\n🔧 Next Steps:")
        print("   1. Start backend API: python -m uvicorn backend.app.main:app --reload --port 8000")
        print("   2. Start frontend: npm run dev")
        print("   3. Navigate to different tabs and test functionality")
        print("   4. Test Class & Student tab with batch selection")
        print("   5. Test Finance tab with fee collection")
        
    else:
        print(f"\n⚠️ {total_tests - passed_tests} system(s) need attention")
        print("Please review the failed tests above")
    
    return passed_tests == total_tests

if __name__ == "__main__":
    success = run_final_system_test()
    sys.exit(0 if success else 1)