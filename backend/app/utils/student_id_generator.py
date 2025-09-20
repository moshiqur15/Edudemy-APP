from datetime import datetime
from sqlmodel import Session, select, func
from typing import Optional
from ..models import Student, Gender, StudentVersion


class StudentIDGenerator:
    """
    Utility class for generating student registration numbers and roll numbers
    Format: CC-GG-RRR
    - CC: Class (06,07,08,09,10,11,12)
    - GG: Gender (01=Boys, 02=Girls)  
    - RRR: Serial number (001, 002, etc.)
    """
    
    @staticmethod
    def get_gender_code(gender: Gender) -> str:
        """Convert gender to numeric code"""
        gender_mapping = {
            Gender.MALE: "01",  # Boys
            Gender.FEMALE: "02",  # Girls
            Gender.OTHER: "01"  # Default to boys
        }
        return gender_mapping.get(gender, "01")
    
    @staticmethod
    def get_class_code(class_name: str) -> str:
        """Convert class name to numeric code"""
        class_mapping = {
            "Class 6": "06",
            "6": "06",
            "Class 7": "07",
            "7": "07",
            "Class 8": "08",
            "8": "08",
            "Class 9": "09",
            "9": "09",
            "Class 10": "10",
            "10": "10",
            "HSC 1st Year": "11",
            "Class 11": "11",
            "11": "11",
            "HSC 2nd Year": "12",
            "Class 12": "12",
            "12": "12",
            "SSC": "10"  # SSC is equivalent to Class 10
        }
        return class_mapping.get(class_name, "09")
    
    @staticmethod
    def get_next_admission_serial(session: Session, class_name: str, gender: Gender) -> int:
        """Get the next admission serial number for the given class and gender"""
        class_code = StudentIDGenerator.get_class_code(class_name)
        gender_code = StudentIDGenerator.get_gender_code(gender)
        
        # Find the highest admission serial for this class-gender combination
        # Look for students with IDs that start with CC-GG-
        id_prefix = f"{class_code}-{gender_code}-"
        stmt = select(func.max(Student.admission_serial)).where(
            Student.student_reg_number.like(f"{id_prefix}%")
        )
        result = session.exec(stmt).first()
        
        # If no students exist for this combination, start from 1
        if result is None:
            return 1
        
        return (result or 0) + 1
    
    @staticmethod
    def generate_student_reg_number(
        session: Session,
        gender: Gender,
        class_name: str,
        admission_date: Optional[datetime] = None
    ) -> tuple[str, str, int]:
        """
        Generate student registration number and roll number
        
        Returns:
            tuple: (student_reg_number, student_roll_number, admission_serial)
        """
        class_code = StudentIDGenerator.get_class_code(class_name)
        gender_code = StudentIDGenerator.get_gender_code(gender)
        
        # Get next admission serial for this class-gender combination
        admission_serial = StudentIDGenerator.get_next_admission_serial(session, class_name, gender)
        
        # Format serial number as 3-digit string
        serial_str = f"{admission_serial:03d}"
        
        # Generate registration number: CC-GG-RRR
        student_reg_number = f"{class_code}-{gender_code}-{serial_str}"
        
        # Generate roll number (same as reg number for this format)
        student_roll_number = student_reg_number
        
        return student_reg_number, student_roll_number, admission_serial
    
    @staticmethod
    def validate_and_generate_ids(
        session: Session,
        gender: Gender,
        class_name: str,
        admission_date: Optional[datetime] = None
    ) -> dict:
        """
        Generate and validate student IDs, ensuring uniqueness
        
        Returns:
            dict: Contains generated IDs and admission serial
        """
        max_attempts = 100  # Prevent infinite loops
        attempts = 0
        
        while attempts < max_attempts:
            reg_num, roll_num, admission_serial = StudentIDGenerator.generate_student_reg_number(
                session, gender, class_name, admission_date
            )
            
            # Check if registration number already exists
            existing_reg = session.exec(
                select(Student).where(Student.student_reg_number == reg_num)
            ).first()
            
            # Check if roll number already exists
            existing_roll = session.exec(
                select(Student).where(Student.student_roll_number == roll_num)
            ).first()
            
            if not existing_reg and not existing_roll:
                return {
                    "student_reg_number": reg_num,
                    "student_roll_number": roll_num,
                    "admission_serial": admission_serial
                }
            
            attempts += 1
        
        raise Exception("Unable to generate unique student ID after maximum attempts")
    
    @staticmethod
    def preview_student_id(
        gender: Gender,
        class_name: str,
        admission_date: Optional[datetime] = None,
        mock_serial: int = 1
    ) -> dict:
        """
        Preview what the student ID would look like without checking database
        Useful for frontend preview functionality
        """
        class_code = StudentIDGenerator.get_class_code(class_name)
        gender_code = StudentIDGenerator.get_gender_code(gender)
        serial_str = f"{mock_serial:03d}"
        
        student_reg_number = f"{class_code}-{gender_code}-{serial_str}"
        student_roll_number = student_reg_number  # Same format
        
        return {
            "student_reg_number": student_reg_number,
            "student_roll_number": student_roll_number,
            "class_code": class_code,
            "gender_code": gender_code,
            "serial": mock_serial,
            "format_explanation": {
                "reg_number": "CC-GG-RRR (Class-Gender-Serial)",
                "roll_number": "Same as registration number",
                "class_codes": {"06": "Class 6", "07": "Class 7", "08": "Class 8", "09": "Class 9", "10": "Class 10", "11": "Class 11", "12": "Class 12"},
                "gender_codes": {"01": "Boys", "02": "Girls"}
            }
        }
