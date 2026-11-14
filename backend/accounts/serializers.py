from rest_framework import serializers
from accounts.models import User ,emailOTP
from accounts.utils import generate_otp , send_otp_email ,registration_cache_key , send_ResetPassword_OTP_email ,forgot_password_cache_key
from django.core.cache import cache
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.hashers import make_password
import secrets


class Registerserializers(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True , style={ "input_type":"password"})
    confirm_password= serializers.CharField(write_only=True , style={ "input_type":"password"})
    def validate(self , data):
        password = data["password"]
        confirm_password=data["confirm_password"]
        if password != confirm_password:
            raise serializers.ValidationError("confirm password should match")
        if User.objects.filter(email = data["email"]).exists():
            raise serializers.ValidationError("a user email already exist")
        return data
    def create(self ,validated_data):
             email = validated_data["email"]
             password = validated_data["password"]
             otp = generate_otp()
             pending_data = {
                "email": email,
                 "password_hash": make_password(password),
                 "otp": otp,
                }
             key = registration_cache_key(email)
             cache.set(key, pending_data, timeout=300)# Store registration temporarily, NOT in the User table.
             try:
                   send_otp_email(email, otp)
             except Exception:
               cache.delete(key)
               raise serializers.ValidationError(
                       "Could not send OTP email. Please try again."
                        )
             return {"email": email}




class verifyOTPserializer(serializers.Serializer):
    email = serializers.EmailField()
    otp=serializers.CharField(max_length=6)
    def validate(self , data):
            from django.contrib.auth import get_user_model
            User = get_user_model()
            email = data["email"].strip()
            key = registration_cache_key(email)
            pending_data = cache.get(key)
            if pending_data is None:
              raise serializers.ValidationError(
                "Registration expired or not found. Please register again."
            )

            if pending_data["otp"] != data["otp"]:
             raise serializers.ValidationError("Invalid OTP.")

            if User.objects.filter(email__iexact=email).exists():
             raise serializers.ValidationError(
                "A user with this email already exists."
            )

            data["email"] = email
            data["pending_data"] = pending_data
            return data
    
    def create(self, validated_data):
        pending_data = validated_data["pending_data"]
        email = validated_data["email"]

        # This is the FIRST time a User object is created.
        # The password is already hashed, so don't hash it again.
        user = User(
            email=email,
            email_verified=True,
            is_active=True,
            password=pending_data["password_hash"],
        )
        user.save()

        # OTP is one-time use: remove pending registration.
        cache.delete(registration_cache_key(email))

        return user

class CustomTokenObtainSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        if not self.user.email_verified:
         raise serializers.ValidationError(
            "please verify email first"
        )
        return data 
       
class setusernameSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=64)
    def validate(self, data):
        username = data["username"]
        if User.objects.filter(username = username).exists():
            raise serializers.ValidationError("username already exists")
        return data
    def update(self ,instance , validate_data):
        instance.username = validate_data["username"]
        instance.save(update_fields=["username"])
        return instance

class ForgotPasswordSerializers(serializers.Serializer):
    username = serializers.CharField(max_length=64)
    def validate(self , data):
        username = data["username"]
        if not User.objects.filter(username__iexact=username).exists():
            raise serializers.ValidationError("Username does not exists")
        return data
    def create(self , validated_data):
        username = validated_data["username"]
        user =  User.objects.get(username__iexact=username)
        email = user.email
        otp = generate_otp()
        pending_data = {
            "username" : username,
            "otp":otp
        }
        key = forgot_password_cache_key(username)
        cache.set(key ,pending_data , timeout=300)
        try:
            send_ResetPassword_OTP_email(email , otp , username)
        except Exception:
            cache.delete(key)
            raise serializers.ValidationError(
                                   "Could not send OTP email. Please try again."
                                    )
        return {"email": email}

class verifyForgotPasswordOTPserializer(serializers.Serializer):
    username = serializers.CharField()
    otp = serializers.CharField(max_length = 6 , min_length= 6)
    def validate(self, data):
        username = data["username"]
        key = forgot_password_cache_key(username)
        pending_data = cache.get(key)
        if pending_data is None:
            raise serializers.ValidationError("otp expired or not found .... please try again")
        if pending_data["otp"] != data["otp"]:
             raise serializers.ValidationError("Invalid OTP.")
        data["pending_data"] = pending_data
        return data
    def create(self, validated_data):
      username = validated_data["username"]

      reset_token = secrets.token_urlsafe(32)

      cache.set(
        f"password_reset_token:{reset_token}",
        username,
        timeout=300
        )

      cache.delete(forgot_password_cache_key(username))

      return {
        "reset_token": reset_token
    }

          