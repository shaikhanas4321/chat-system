import secrets
from django.core.mail import send_mail



def registration_cache_key(email):
    return f"pending_registration:{email.strip().lower()}"

def forgot_password_cache_key(username):
    return f"pending_registration:{username.strip()}"


def generate_otp():
    return f"{secrets.randbelow(1_000_000):06d}"


def send_otp_email(email, otp):
    send_mail(
        subject="Chat System - Email Verification",
        message=f"""
Hello,

Your verification code is:

{otp}

This code will expire in 5 minutes.

If you did not create an account, you can ignore this email.
""",
        from_email=None,
        recipient_list=[email],
        fail_silently=False,
    )

def send_ResetPassword_OTP_email(email, otp ,username):
    send_mail(
        subject="Chat System - Reset Password",
        message=f"""
Hello,

Your verification code is:

{otp}

This code will expire in 5 minutes.

this is for account under username {username}
""",
        from_email=None,
        recipient_list=[email],
        fail_silently=False,
    )