import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import asyncio
import secrets
import string
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self, 
                 smtp_server: Optional[str] = None,
                 smtp_port: int = 587,
                 smtp_username: Optional[str] = None,
                 smtp_password: Optional[str] = None,
                 from_email: Optional[str] = None,
                 from_name: str = "EduDemy"):
        self.smtp_server = smtp_server or "smtp.gmail.com"  # Default to Gmail
        self.smtp_port = smtp_port
        self.smtp_username = smtp_username
        self.smtp_password = smtp_password
        self.from_email = from_email or smtp_username
        self.from_name = from_name
        
    def generate_verification_code(self) -> str:
        """Generate a 6-digit verification code"""
        return ''.join(secrets.choice(string.digits) for _ in range(6))
    
    def generate_registration_token(self) -> str:
        """Generate a secure registration token"""
        return secrets.token_urlsafe(32)
    
    def get_verification_expiry(self) -> datetime:
        """Get expiry time for verification code (15 minutes from now)"""
        return datetime.utcnow() + timedelta(minutes=15)
    
    async def send_verification_email(self, to_email: str, verification_code: str, user_name: str = None) -> bool:
        """Send email verification code"""
        try:
            subject = "EduDemy - Email Verification Code"
            
            html_body = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }}
                    .header {{
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                        border-radius: 10px 10px 0 0;
                    }}
                    .content {{
                        background: #f8f9fa;
                        padding: 30px;
                        border-radius: 0 0 10px 10px;
                    }}
                    .verification-code {{
                        background: #007bff;
                        color: white;
                        font-size: 32px;
                        font-weight: bold;
                        text-align: center;
                        padding: 20px;
                        border-radius: 8px;
                        letter-spacing: 8px;
                        margin: 20px 0;
                    }}
                    .warning {{
                        background: #fff3cd;
                        border: 1px solid #ffeaa7;
                        color: #856404;
                        padding: 15px;
                        border-radius: 8px;
                        margin-top: 20px;
                    }}
                    .footer {{
                        text-align: center;
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #dee2e6;
                        color: #6c757d;
                        font-size: 12px;
                    }}
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🎓 EduDemy</h1>
                    <h2>Email Verification</h2>
                </div>
                
                <div class="content">
                    <p>Hello{' ' + user_name if user_name else ''},</p>
                    
                    <p>Thank you for registering with EduDemy! To complete your account setup, please verify your email address using the verification code below:</p>
                    
                    <div class="verification-code">
                        {verification_code}
                    </div>
                    
                    <p>This verification code will expire in <strong>15 minutes</strong>. If you didn't request this verification, please ignore this email.</p>
                    
                    <div class="warning">
                        <strong>Security Note:</strong> Never share this verification code with anyone. EduDemy staff will never ask for your verification code via phone or email.
                    </div>
                </div>
                
                <div class="footer">
                    <p>This is an automated email from EduDemy Educational Management System.</p>
                    <p>If you have any questions, please contact our support team.</p>
                </div>
            </body>
            </html>
            """
            
            text_body = f"""
            EduDemy - Email Verification
            
            Hello{' ' + user_name if user_name else ''},
            
            Thank you for registering with EduDemy! To complete your account setup, please verify your email address using the verification code below:
            
            Verification Code: {verification_code}
            
            This verification code will expire in 15 minutes. If you didn't request this verification, please ignore this email.
            
            Security Note: Never share this verification code with anyone. EduDemy staff will never ask for your verification code via phone or email.
            
            ---
            This is an automated email from EduDemy Educational Management System.
            If you have any questions, please contact our support team.
            """
            
            return await self._send_email(to_email, subject, html_body, text_body)
            
        except Exception as e:
            logger.error(f"Failed to send verification email to {to_email}: {str(e)}")
            return False
    
    async def send_access_approved_email(self, to_email: str, user_name: str, username: str, role: str) -> bool:
        """Send access approved notification email"""
        try:
            subject = "EduDemy - Account Access Approved! 🎉"
            
            html_body = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }}
                    .header {{
                        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                        border-radius: 10px 10px 0 0;
                    }}
                    .content {{
                        background: #f8f9fa;
                        padding: 30px;
                        border-radius: 0 0 10px 10px;
                    }}
                    .credentials {{
                        background: #e9ecef;
                        border-left: 4px solid #007bff;
                        padding: 20px;
                        margin: 20px 0;
                        border-radius: 0 8px 8px 0;
                    }}
                    .button {{
                        display: inline-block;
                        background: #007bff;
                        color: white;
                        padding: 12px 30px;
                        text-decoration: none;
                        border-radius: 8px;
                        font-weight: bold;
                        margin: 20px 0;
                    }}
                    .footer {{
                        text-align: center;
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #dee2e6;
                        color: #6c757d;
                        font-size: 12px;
                    }}
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🎓 EduDemy</h1>
                    <h2>Account Approved!</h2>
                </div>
                
                <div class="content">
                    <p>Congratulations {user_name}!</p>
                    
                    <p>Your account access request has been approved! You can now access the EduDemy platform with your new account.</p>
                    
                    <div class="credentials">
                        <h3>Your Account Details:</h3>
                        <p><strong>Username:</strong> {username}</p>
                        <p><strong>Role:</strong> {role.title()}</p>
                        <p><strong>Email:</strong> {to_email}</p>
                    </div>
                    
                    <p>You can now log in using your username and the password you created during registration.</p>
                    
                    <div style="text-align: center;">
                        <a href="#" class="button">Login to EduDemy</a>
                    </div>
                    
                    <p><strong>Next Steps:</strong></p>
                    <ul>
                        <li>Complete your profile information</li>
                        <li>Explore the platform features</li>
                        <li>Join relevant batches or classes</li>
                        <li>Connect with your peers and instructors</li>
                    </ul>
                </div>
                
                <div class="footer">
                    <p>Welcome to the EduDemy community!</p>
                    <p>If you need help getting started, please contact our support team.</p>
                </div>
            </body>
            </html>
            """
            
            text_body = f"""
            EduDemy - Account Approved!
            
            Congratulations {user_name}!
            
            Your account access request has been approved! You can now access the EduDemy platform with your new account.
            
            Your Account Details:
            Username: {username}
            Role: {role.title()}
            Email: {to_email}
            
            You can now log in using your username and the password you created during registration.
            
            Next Steps:
            - Complete your profile information
            - Explore the platform features
            - Join relevant batches or classes
            - Connect with your peers and instructors
            
            ---
            Welcome to the EduDemy community!
            If you need help getting started, please contact our support team.
            """
            
            return await self._send_email(to_email, subject, html_body, text_body)
            
        except Exception as e:
            logger.error(f"Failed to send approval email to {to_email}: {str(e)}")
            return False
    
    async def send_access_rejected_email(self, to_email: str, user_name: str, reason: str) -> bool:
        """Send access rejected notification email"""
        try:
            subject = "EduDemy - Account Access Request Status"
            
            html_body = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }}
                    .header {{
                        background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                        border-radius: 10px 10px 0 0;
                    }}
                    .content {{
                        background: #f8f9fa;
                        padding: 30px;
                        border-radius: 0 0 10px 10px;
                    }}
                    .reason-box {{
                        background: #fff3cd;
                        border: 1px solid #ffeaa7;
                        color: #856404;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 20px 0;
                    }}
                    .footer {{
                        text-align: center;
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #dee2e6;
                        color: #6c757d;
                        font-size: 12px;
                    }}
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🎓 EduDemy</h1>
                    <h2>Account Request Update</h2>
                </div>
                
                <div class="content">
                    <p>Hello {user_name},</p>
                    
                    <p>Thank you for your interest in joining EduDemy. After reviewing your account access request, we regret to inform you that we are unable to approve your application at this time.</p>
                    
                    <div class="reason-box">
                        <h3>Reason:</h3>
                        <p>{reason}</p>
                    </div>
                    
                    <p>If you believe this decision was made in error or if you have additional information that might affect this decision, please feel free to contact our support team.</p>
                    
                    <p>You're welcome to submit a new application in the future if your circumstances change.</p>
                    
                    <p>Thank you for considering EduDemy.</p>
                </div>
                
                <div class="footer">
                    <p>If you have any questions, please contact our support team.</p>
                </div>
            </body>
            </html>
            """
            
            text_body = f"""
            EduDemy - Account Request Update
            
            Hello {user_name},
            
            Thank you for your interest in joining EduDemy. After reviewing your account access request, we regret to inform you that we are unable to approve your application at this time.
            
            Reason: {reason}
            
            If you believe this decision was made in error or if you have additional information that might affect this decision, please feel free to contact our support team.
            
            You're welcome to submit a new application in the future if your circumstances change.
            
            Thank you for considering EduDemy.
            
            ---
            If you have any questions, please contact our support team.
            """
            
            return await self._send_email(to_email, subject, html_body, text_body)
            
        except Exception as e:
            logger.error(f"Failed to send rejection email to {to_email}: {str(e)}")
            return False
    
    async def _send_email(self, to_email: str, subject: str, html_body: str, text_body: str) -> bool:
        """Internal method to send email"""
        if not all([self.smtp_server, self.smtp_username, self.smtp_password, self.from_email]):
            logger.warning("Email service not configured. Skipping email send.")
            # In development, just log the email content
            logger.info(f"Would send email to {to_email}: {subject}")
            logger.info(f"Text content: {text_body}")
            return True  # Return True for development
        
        try:
            msg = MIMEMultipart('alternative')
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = to_email
            msg['Subject'] = subject
            
            # Add both text and HTML parts
            text_part = MIMEText(text_body, 'plain')
            html_part = MIMEText(html_body, 'html')
            
            msg.attach(text_part)
            msg.attach(html_part)
            
            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                text = msg.as_string()
                server.sendmail(self.from_email, to_email, text)
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False

# Initialize with configuration
def get_email_service():
    """Get configured email service instance"""
    from ..config import settings
    return EmailService(
        smtp_server=settings.SMTP_SERVER or None,
        smtp_port=settings.SMTP_PORT,
        smtp_username=settings.SMTP_USERNAME or None,
        smtp_password=settings.SMTP_PASSWORD or None,
        from_email=settings.FROM_EMAIL or None,
        from_name=settings.FROM_NAME
    )

# Global email service instance
email_service = get_email_service()
