from rest_framework import serializers
from accounts.models import User ,emailOTP
from accounts.utils import generate_otp , send_otp_email ,registration_cache_key
from django.core.cache import cache
from django.contrib.auth.hashers import make_password


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
            password=pending_data["password_hash"],
        )
        user.save()

        # OTP is one-time use: remove pending registration.
        cache.delete(registration_cache_key(email))

        return user

     
