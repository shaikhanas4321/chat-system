from django.shortcuts import render
from rest_framework import status , permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from  accounts.models import User
from accounts.serializers import *
from django.contrib.auth import get_user_model
# Create your views here.
 
User = get_user_model()
class RegisterView(APIView):
    def post(self , request):
        serializer = Registerserializers(data = request.data)
        if serializer.is_valid():
            user = serializer.save()

            return Response({
                    "message": "Registration successful.",
                    "user_id": user.id,
                    "email": user.email
                }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors , status=status.HTTP_400_BAD_REQUEST)
    
class verifyOTP(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self , request):
        serializer = verifyOTPserializer(data = request.data)
        serializer.is_valid(raise_exception=True)
        user =  serializer.validated_data["user"]
        user.email_verified = True
        user.email_otp.delete()
        user.save(update_fields=["email_verified"])

        return Response({"message": "Email verified successfully."}, status=status.HTTP_200_OK)
        