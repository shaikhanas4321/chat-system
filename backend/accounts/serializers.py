from rest_framework import serializers
from accounts.models import User ,emailOTP
from accounts.utils import generate_otp , send_otp_email


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
       validated_data.pop("confirm_password")
       user = User.objects.create_user(email = validated_data["email"] , password = validated_data["password"])
       otp = generate_otp(user)
       send_otp_email(user , otp)
    
       return user




class verifyOTPserializer(serializers.Serializer):
    email = serializers.EmailField()
    otp=serializers.CharField(max_length=6)
    def validate(self , data):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            user = User.objects.get(email=data["email"])
        except User.DoesNotExist:
            raise serializers.ValidationError("user does not exist ")
        try:
            otp_obj=user.email_otp
        except emailOTP.DoesNotExist:
            raise serializers.ValidationError("No OTP found. Please request a new one.")
        if otp_obj.is_expired():
            raise serializers.ValidationError("OTP expired. Please request a new one.")

        if otp_obj.otp != data["otp"]:
            raise serializers.ValidationError("Invalid OTP.")

        data ["user"]=user
        return data

     
