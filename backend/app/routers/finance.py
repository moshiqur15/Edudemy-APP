from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, and_, or_, func
from datetime import datetime, timedelta
from typing import List, Optional
from ..database import get_session
from ..models import (
    User, Student, Payment, AdmissionFee, PaymentReceipt, StudentDues, 
    MonthlyFeeStructure, PaymentType, PaymentStatus, PaymentMethod
)
from ..schemas import (
    PaymentCreate, PaymentUpdate, PaymentRead,
    AdmissionFeeCreate, AdmissionFeeUpdate, AdmissionFeeRead,
    PaymentReceiptCreate, PaymentReceiptRead,
    StudentDuesRead, MonthlyFeeStructureCreate, MonthlyFeeStructureRead,
    FinanceDashboardStats
)
from ..core.deps import get_current_user, require_role
import uuid
import calendar

router = APIRouter(prefix="/finance", tags=["finance"])

# Helper function to generate receipt number
def generate_receipt_number():
    """Generate unique receipt number"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    unique_id = str(uuid.uuid4())[:8].upper()
    return f"RCP-{timestamp}-{unique_id}"

# Helper function to update student dues
def update_student_dues(student_id: int, session: Session):
    """Update student dues summary"""
    student_dues = session.exec(
        select(StudentDues).where(StudentDues.student_id == student_id)
    ).first()
    
    if not student_dues:
        student_dues = StudentDues(student_id=student_id)
        session.add(student_dues)
    
    # Calculate total dues from payments
    pending_payments = session.exec(
        select(Payment).where(
            and_(
                Payment.student_id == student_id,
                Payment.status.in_([PaymentStatus.PENDING, PaymentStatus.PARTIAL, PaymentStatus.OVERDUE])
            )
        )
    ).all()
    
    monthly_fee_due = sum(p.amount for p in pending_payments if p.payment_type == PaymentType.MONTHLY_FEE)
    admission_fee_due = sum(p.amount for p in pending_payments if p.payment_type == PaymentType.ADMISSION_FEE)
    other_dues = sum(p.amount for p in pending_payments if p.payment_type not in [PaymentType.MONTHLY_FEE, PaymentType.ADMISSION_FEE])
    
    student_dues.monthly_fee_due = monthly_fee_due
    student_dues.admission_fee_due = admission_fee_due
    student_dues.other_dues = other_dues
    student_dues.total_due = monthly_fee_due + admission_fee_due + other_dues
    
    # Get last payment
    last_payment = session.exec(
        select(Payment).where(
            and_(Payment.student_id == student_id, Payment.status == PaymentStatus.PAID)
        ).order_by(Payment.payment_date.desc())
    ).first()
    
    if last_payment:
        student_dues.last_payment_date = last_payment.payment_date
        student_dues.last_payment_amount = last_payment.amount
        if last_payment.fee_month and last_payment.fee_year:
            student_dues.last_paid_month = last_payment.fee_month
            student_dues.last_paid_year = last_payment.fee_year
    
    # Calculate months pending
    if student_dues.last_paid_month and student_dues.last_paid_year:
        current_date = datetime.now()
        last_paid = datetime(student_dues.last_paid_year, student_dues.last_paid_month, 1)
        months_diff = (current_date.year - last_paid.year) * 12 + current_date.month - last_paid.month
        student_dues.months_pending = max(0, months_diff - 1)
    
    # Set flags
    student_dues.has_overdue = any(p.status == PaymentStatus.OVERDUE for p in pending_payments)
    student_dues.needs_attention = student_dues.has_overdue or student_dues.months_pending > 2
    
    student_dues.updated_at = datetime.utcnow()
    session.commit()

# Dashboard endpoints
@router.get("/dashboard/stats", response_model=FinanceDashboardStats)
async def get_finance_dashboard_stats(
    current_user: User = Depends(require_role(["superadmin", "admin", "finance"])),
    session: Session = Depends(get_session)
):
    """Get finance dashboard statistics"""
    current_month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    last_month_start = (current_month_start - timedelta(days=1)).replace(day=1)
    
    # Monthly collections this month
    this_month_collections = session.exec(
        select(func.sum(Payment.amount)).where(
            and_(
                Payment.status == PaymentStatus.PAID,
                Payment.payment_date >= current_month_start
            )
        )
    ).first() or 0.0
    
    # Last month collections
    last_month_collections = session.exec(
        select(func.sum(Payment.amount)).where(
            and_(
                Payment.status == PaymentStatus.PAID,
                Payment.payment_date >= last_month_start,
                Payment.payment_date < current_month_start
            )
        )
    ).first() or 0.0
    
    # Pending admissions
    pending_admissions = session.exec(
        select(func.count(AdmissionFee.id)).where(
            AdmissionFee.status != PaymentStatus.PAID
        )
    ).first() or 0
    
    # Total outstanding dues
    total_dues = session.exec(
        select(func.sum(StudentDues.total_due))
    ).first() or 0.0
    
    # Overdue students
    overdue_students = session.exec(
        select(func.count(StudentDues.id)).where(
            StudentDues.has_overdue == True
        )
    ).first() or 0
    
    return FinanceDashboardStats(
        total_monthly_collections=this_month_collections + last_month_collections,
        pending_admissions=pending_admissions,
        total_dues_outstanding=total_dues,
        overdue_students=overdue_students,
        this_month_collections=this_month_collections,
        last_month_collections=last_month_collections,
        upcoming_due_dates=0  # Can be calculated based on due dates
    )

# Fee Collection endpoints
@router.get("/students/dues", response_model=List[dict])
async def get_students_with_dues(
    class_name: Optional[str] = Query(None, description="Filter by class"),
    batch_id: Optional[int] = Query(None, description="Filter by batch"),
    has_dues: Optional[bool] = Query(None, description="Filter students with dues"),
    search: Optional[str] = Query(None, description="Search by student name or reg number"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(require_role(["superadmin", "admin", "finance"])),
    session: Session = Depends(get_session)
):
    """Get students with their dues information"""
    # Build query
    stmt = select(Student, StudentDues).outerjoin(
        StudentDues, Student.id == StudentDues.student_id
    )
    
    # Apply filters
    if class_name:
        stmt = stmt.where(Student.class_name == class_name)
    if batch_id:
        stmt = stmt.where(Student.batch_id == batch_id)
    if has_dues is not None:
        if has_dues:
            stmt = stmt.where(StudentDues.total_due > 0)
        else:
            stmt = stmt.where(or_(StudentDues.total_due == 0, StudentDues.total_due.is_(None)))
    if search:
        stmt = stmt.where(
            or_(
                Student.full_name.ilike(f"%{search}%"),
                Student.student_reg_number.ilike(f"%{search}%")
            )
        )
    
    stmt = stmt.offset(skip).limit(limit)
    results = session.exec(stmt).all()
    
    # Format response
    students_data = []
    for student, dues in results:
        student_data = {
            "student_id": student.id,
            "full_name": student.full_name,
            "student_reg_number": student.student_reg_number,
            "class_name": student.class_name,
            "batch_id": student.batch_id,
            "total_due": dues.total_due if dues else 0.0,
            "monthly_fee_due": dues.monthly_fee_due if dues else 0.0,
            "admission_fee_due": dues.admission_fee_due if dues else 0.0,
            "last_payment_date": dues.last_payment_date if dues else None,
            "months_pending": dues.months_pending if dues else 0,
            "has_overdue": dues.has_overdue if dues else False,
            "needs_attention": dues.needs_attention if dues else False
        }
        students_data.append(student_data)
    
    return students_data

@router.post("/payments", response_model=PaymentRead)
async def create_payment(
    payment_data: PaymentCreate,
    current_user: User = Depends(require_role(["superadmin", "admin", "finance"])),
    session: Session = Depends(get_session)
):
    """Create a new payment record"""
    # Verify student exists
    student = session.get(Student, payment_data.student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Create payment
    payment = Payment(
        student_id=payment_data.student_id,
        amount=payment_data.amount,
        payment_type=payment_data.payment_type,
        payment_method=payment_data.payment_method,
        due_date=payment_data.due_date,
        remarks=payment_data.remarks,
        fee_month=payment_data.fee_month,
        fee_year=payment_data.fee_year,
        is_admission_complete=payment_data.is_admission_complete,
        collected_by=current_user.id,
        receipt_number=generate_receipt_number(),
        status=PaymentStatus.PAID,
        payment_date=datetime.utcnow()
    )
    
    session.add(payment)
    session.commit()
    session.refresh(payment)
    
    # Update student dues
    update_student_dues(payment_data.student_id, session)
    
    return payment

@router.get("/payments/{payment_id}/receipt", response_model=PaymentReceiptRead)
async def generate_payment_receipt(
    payment_id: int,
    current_user: User = Depends(require_role(["superadmin", "admin", "finance"])),
    session: Session = Depends(get_session)
):
    """Generate a payment receipt"""
    payment = session.get(Payment, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    student = session.get(Student, payment.student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Check if receipt already exists
    existing_receipt = session.exec(
        select(PaymentReceipt).where(PaymentReceipt.payment_id == payment_id)
    ).first()
    
    if existing_receipt:
        return existing_receipt
    
    # Generate fee description
    fee_description = ""
    if payment.payment_type == PaymentType.MONTHLY_FEE and payment.fee_month and payment.fee_year:
        month_name = calendar.month_name[payment.fee_month]
        fee_description = f"Monthly Fee for {month_name} {payment.fee_year}"
    elif payment.payment_type == PaymentType.ADMISSION_FEE:
        fee_description = "Admission Fee"
    else:
        fee_description = payment.payment_type.value.replace("_", " ").title()
    
    # Calculate dues
    student_dues = session.exec(
        select(StudentDues).where(StudentDues.student_id == student.id)
    ).first()
    
    # Create receipt
    receipt = PaymentReceipt(
        receipt_number=payment.receipt_number or generate_receipt_number(),
        payment_id=payment_id,
        student_id=payment.student_id,
        amount_paid=payment.amount,
        payment_type=payment.payment_type,
        payment_method=payment.payment_method,
        payment_date=payment.payment_date,
        student_name=student.full_name,
        student_reg_number=student.student_reg_number,
        class_name=student.class_name,
        batch_name=None,  # Can be populated from batch relationship
        fee_month=payment.fee_month,
        fee_year=payment.fee_year,
        fee_description=fee_description,
        previous_due=0.0,  # Calculate if needed
        current_due=student_dues.total_due if student_dues else 0.0,
        generated_by=current_user.id
    )
    
    session.add(receipt)
    session.commit()
    session.refresh(receipt)
    
    return receipt

# Admission endpoints
@router.get("/admissions/pending", response_model=List[dict])
async def get_pending_admissions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(require_role(["superadmin", "admin", "finance"])),
    session: Session = Depends(get_session)
):
    """Get newly added students pending admission fee processing"""
    # Get students without admission fee records or with incomplete admission
    stmt = select(Student).outerjoin(
        AdmissionFee, Student.id == AdmissionFee.student_id
    ).where(
        or_(
            AdmissionFee.id.is_(None),
            AdmissionFee.status != PaymentStatus.PAID
        )
    ).offset(skip).limit(limit)
    
    students = session.exec(stmt).all()
    
    # Format response with admission fee info if exists
    admissions_data = []
    for student in students:
        admission_fee = session.exec(
            select(AdmissionFee).where(AdmissionFee.student_id == student.id)
        ).first()
        
        student_data = {
            "student_id": student.id,
            "full_name": student.full_name,
            "student_reg_number": student.student_reg_number,
            "class_name": student.class_name,
            "admission_date": student.admission_date,
            "admission_fee": admission_fee.dict() if admission_fee else None,
            "is_new": admission_fee is None
        }
        admissions_data.append(student_data)
    
    return admissions_data

@router.post("/admissions", response_model=AdmissionFeeRead)
async def create_admission_fee(
    admission_data: AdmissionFeeCreate,
    current_user: User = Depends(require_role(["superadmin", "admin", "finance"])),
    session: Session = Depends(get_session)
):
    """Create admission fee record for a student"""
    # Verify student exists
    student = session.get(Student, admission_data.student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Check if admission fee already exists
    existing_admission = session.exec(
        select(AdmissionFee).where(AdmissionFee.student_id == admission_data.student_id)
    ).first()
    
    if existing_admission:
        raise HTTPException(status_code=400, detail="Admission fee record already exists for this student")
    
    # Create admission fee record
    admission_fee = AdmissionFee(
        student_id=admission_data.student_id,
        admission_fee_amount=admission_data.admission_fee_amount,
        registration_fee=admission_data.registration_fee,
        security_deposit=admission_data.security_deposit,
        total_amount=admission_data.total_amount,
        balance_due=admission_data.total_amount,
        due_date=admission_data.due_date,
        processed_by=current_user.id
    )
    
    session.add(admission_fee)
    session.commit()
    session.refresh(admission_fee)
    
    return admission_fee

@router.put("/admissions/{admission_id}/pay")
async def pay_admission_fee(
    admission_id: int,
    amount: float,
    payment_method: PaymentMethod = PaymentMethod.CASH,
    current_user: User = Depends(require_role(["superadmin", "admin", "finance"])),
    session: Session = Depends(get_session)
):
    """Process admission fee payment"""
    admission_fee = session.get(AdmissionFee, admission_id)
    if not admission_fee:
        raise HTTPException(status_code=404, detail="Admission fee record not found")
    
    if amount <= 0 or amount > admission_fee.balance_due:
        raise HTTPException(status_code=400, detail="Invalid payment amount")
    
    # Create payment record
    payment = Payment(
        student_id=admission_fee.student_id,
        amount=amount,
        payment_type=PaymentType.ADMISSION_FEE,
        payment_method=payment_method,
        collected_by=current_user.id,
        receipt_number=generate_receipt_number(),
        status=PaymentStatus.PAID,
        payment_date=datetime.utcnow(),
        is_admission_complete=True
    )
    
    session.add(payment)
    
    # Update admission fee
    admission_fee.amount_paid += amount
    admission_fee.balance_due -= amount
    admission_fee.updated_at = datetime.utcnow()
    
    if admission_fee.balance_due <= 0:
        admission_fee.status = PaymentStatus.PAID
        admission_fee.completion_date = datetime.utcnow()
    elif admission_fee.amount_paid > 0:
        admission_fee.status = PaymentStatus.PARTIAL
    
    session.commit()
    session.refresh(payment)
    
    # Update student dues
    update_student_dues(admission_fee.student_id, session)
    
    return {"message": "Payment processed successfully", "payment_id": payment.id, "balance_due": admission_fee.balance_due}

# Payment Sheet endpoints
@router.get("/payment-sheet", response_model=List[dict])
async def get_payment_sheet(
    month: Optional[int] = Query(None, ge=1, le=12, description="Filter by month"),
    year: Optional[int] = Query(None, ge=2020, description="Filter by year"),
    class_name: Optional[str] = Query(None, description="Filter by class"),
    current_user: User = Depends(require_role(["superadmin", "admin", "finance"])),
    session: Session = Depends(get_session)
):
    """Get payment sheet with all student payment information"""
    # Build query to get all students with their payment status
    stmt = select(Student, StudentDues).outerjoin(
        StudentDues, Student.id == StudentDues.student_id
    )
    
    if class_name:
        stmt = stmt.where(Student.class_name == class_name)
    
    results = session.exec(stmt).all()
    
    payment_sheet = []
    for student, dues in results:
        # Get payment history for the specified month/year
        payment_query = select(Payment).where(Payment.student_id == student.id)
        if month and year:
            payment_query = payment_query.where(
                and_(Payment.fee_month == month, Payment.fee_year == year)
            )
        
        payments = session.exec(payment_query.order_by(Payment.payment_date.desc())).all()
        
        # Calculate months paid
        paid_months = []
        for payment in payments:
            if payment.fee_month and payment.fee_year and payment.status == PaymentStatus.PAID:
                paid_months.append(f"{payment.fee_year}-{payment.fee_month:02d}")
        
        student_data = {
            "student_id": student.id,
            "full_name": student.full_name,
            "student_reg_number": student.student_reg_number,
            "class_name": student.class_name,
            "total_due": dues.total_due if dues else 0.0,
            "monthly_fee_due": dues.monthly_fee_due if dues else 0.0,
            "months_paid": paid_months,
            "last_payment_date": dues.last_payment_date if dues else None,
            "months_pending": dues.months_pending if dues else 0,
            "needs_attention": dues.needs_attention if dues else False,
            "recent_payments": [
                {
                    "id": p.id,
                    "amount": p.amount,
                    "payment_date": p.payment_date,
                    "payment_method": p.payment_method,
                    "status": p.status,
                    "fee_month": p.fee_month,
                    "fee_year": p.fee_year
                } for p in payments[:5]  # Last 5 payments
            ]
        }
        payment_sheet.append(student_data)
    
    return payment_sheet

@router.put("/payments/{payment_id}", response_model=PaymentRead)
async def update_payment(
    payment_id: int,
    payment_update: PaymentUpdate,
    current_user: User = Depends(require_role(["superadmin", "admin"])),  # Only admin can edit
    session: Session = Depends(get_session)
):
    """Update payment record (admin only)"""
    payment = session.get(Payment, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    # Update fields
    update_data = payment_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(payment, field, value)
    
    payment.updated_at = datetime.utcnow()
    session.commit()
    session.refresh(payment)
    
    # Update student dues
    update_student_dues(payment.student_id, session)
    
    return payment

@router.delete("/payments/{payment_id}")
async def clear_payment_due(
    payment_id: int,
    reason: str,
    current_user: User = Depends(require_role(["superadmin", "admin"])),  # Only admin can clear dues
    session: Session = Depends(get_session)
):
    """Clear payment due (admin permission required)"""
    payment = session.get(Payment, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    # Mark as cancelled with reason
    payment.status = PaymentStatus.CANCELLED
    payment.remarks = f"Cleared by admin: {reason}"
    payment.updated_at = datetime.utcnow()
    
    session.commit()
    
    # Update student dues
    update_student_dues(payment.student_id, session)
    
    return {"message": "Payment due cleared successfully"}

# Monthly fee structure endpoints
@router.get("/fee-structures", response_model=List[MonthlyFeeStructureRead])
async def get_fee_structures(
    current_user: User = Depends(require_role(["superadmin", "admin", "finance"])),
    session: Session = Depends(get_session)
):
    """Get all monthly fee structures"""
    fee_structures = session.exec(
        select(MonthlyFeeStructure).where(MonthlyFeeStructure.is_active == True)
    ).all()
    return fee_structures

@router.post("/fee-structures", response_model=MonthlyFeeStructureRead)
async def create_fee_structure(
    fee_structure_data: MonthlyFeeStructureCreate,
    current_user: User = Depends(require_role(["superadmin", "admin"])),
    session: Session = Depends(get_session)
):
    """Create monthly fee structure"""
    fee_structure = MonthlyFeeStructure(
        **fee_structure_data.model_dump(),
        created_by=current_user.id
    )
    
    session.add(fee_structure)
    session.commit()
    session.refresh(fee_structure)
    
    return fee_structure