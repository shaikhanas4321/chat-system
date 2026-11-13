from django.shortcuts import render
from rest_framework import status , permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from  accounts.models import User
from accounts.serializers import *
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
# Create your views here.
 
User = get_user_model()
class RegisterView(APIView):
    def post(self , request):
        serializer = Registerserializers(data = request.data)
        if serializer.is_valid():
            registration = serializer.save()

            return Response({
                     
                "message": "OTP sent to your email.",
                "email": registration["email"],
            },
            status=status.HTTP_200_OK,
        )
        return Response(serializer.errors , status=status.HTTP_400_BAD_REQUEST)
    
class verifyOTP(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self , request):
              serializer = verifyOTPserializer(data=request.data)
              serializer.is_valid(raise_exception=True)

              user = serializer.save()

              return Response(
            {
                "message": "Email verified and account created successfully.",
                "user_id": user.id,
                "email": user.email,
            },
            status=status.HTTP_201_CREATED,
        )

class LoginView(TokenObtainPairView):
     serializer_class = CustomTokenObtainSerializer

class ProfileView(APIView):
     permission_classes = [IsAuthenticated]

     def get(self , request):
      return Response({
           "id":request.user.id,
           "email":request.user.email,
           "username":request.user.username,
      })

class setUsername(APIView):
     permission_classes = [IsAuthenticated]
     def post(self , request):
          serializer = setusernameSerializer(request.user , data = request.data ,partial =True)
          serializer.is_valid(raise_exception=True)
          user = serializer.save()
          return Response({
               "message":"your user name has been set successfully",
               "email":request.user.email,
               "username":request.user.username
          })
