import secrets
from datetime import timedelta

from django.utils import timezone

from accounts.models import EmailOTP

def generate_otp(user):
     otp = f"{secrets.randbelow(1_000_000):06d}"
     expires_at = timezone.now() + timedelta(minutes=5)
     EmailOTP.objects.update_or_create(
          user = user,
          defaults={
               "otp":otp,
               "expires_at":expires_at
          }
     )
     return otp