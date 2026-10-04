from django.db import models
from django.contrib.auth.models import AbstractBaseUser , BaseUserManager
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
# Create your models here.
class UserManager(BaseUserManager):
    def create_user(self , email , password=None ,**extra_feild ):
        if not email:
            raise ValueError("email not found! ")
        email = self.normalize_email(email)
        user = self.model(email = email , **extra_feild)
        user.set_password(password)
        user.save(using = self._db)
        return user
    def create_superuser(self, email, password=None, **extra_fields):
        user = self.create_user(email=email,password=password,**extra_fields)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user



class User(AbstractBaseUser):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=30 , unique=True ,null=True, blank=True)
    email_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    objects = UserManager()
    USERNAME_FIELD = "email"


class emailOTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    otp=models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now=True)
    def is_expired(self):
         return timezone.now() > self.created_at + timedelta(minutes=5)
    


