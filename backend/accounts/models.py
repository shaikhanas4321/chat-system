from django.db import models
from django.contrib.auth.models import AbstractBaseUser
from django.utils import timezone
from datetime import timedelta
# Create your models here.
class User(AbstractBaseUser):
    email_verified = models.BooleanField(default=False)

class emailOTP(models.Model):
    user = models.OneToOneField(User , on_delete= models.CASCADE , related_name= "email_otp")
    otp = models.CharField(max_length=6)
    create_at = models.DateTimeField(auto_now=True)
    def is_expired(self):
        return timezone.now > self.create_at + timedelta(minutes=5)
    