from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from chat.serializers import *
from chat.models import Conversation
from django.db.models import Q
# Create your views here.

class ConversationCreateView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self , request):
        serializer = ConversationCreateSerializer(
            data = request.data,
            context = {"request" : request}
        )
        serializer.is_valid(raise_exception=True)
        print("VALIDATED DATA:", serializer.validated_data)
        print("OTHER USER ID:", serializer.validated_data["other_user_id"])
        print("REQUEST USER ID:", request.user.id)
        other_user_id = serializer.validated_data["other_user_id"]
        conversation , created = Conversation.objects.get_or_create(
            user1_id = min(request.user.id , other_user_id),
            user2_id = max(request.user.id , other_user_id)
        )
        return Response({
            "id":conversation.id,
            "user1":conversation.user1_id,
            "user2":conversation.user2_id
        },status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

class ConversationListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self , request):
        conversations = Conversation.objects.filter(
            Q(user1= request.user) | Q(user2 = request.user)
        )
        serializer = ConersationListSerializer(
            conversations ,
            many = True
        )
        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )