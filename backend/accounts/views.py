from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from  accounts.models import User
from accounts.serializers import *
from django.contrib.auth import get_user_model
# Create your views here.
 
User = get_user_model()
class register(APIView):
    def post(self , request):
        registeration = Registerserializers(data = request.data)
        if registeration.is_valid():
            return Response(registeration.data , status=status.HTTP_201_CREATED)
        return Response(registeration.errors , status=status.HTTP_400_BAD_REQUEST)
    
