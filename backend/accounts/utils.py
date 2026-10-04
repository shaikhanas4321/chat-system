import secrets
from datetime import timedelta
from django.core.mail import send_mail
from django.utils import timezone

from accounts.models import emailOTP

def generate_otp(user):
     otp = f"{secrets.randbelow(1_000_000):06d}"
     expires_at = timezone.now() + timedelta(minutes=5)
     emailOTP.objects.update_or_create(
          user = user,
          defaults={
               "otp":otp,
                         
               },
     )
     return otp

def send_otp_email(user , otp):
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
        recipient_list=[user.email],
        fail_silently=False,
    )