from rest_framework import serializers
from accounts.models import User
from chat.models import Conversation


class ConversationCreateSerializer(serializers.Serializer):
    other_user_id = serializers.IntegerField()
    def validate_other_user_id(self , value):
      try:
          other_user = User.objects.get(id = value)
      except User.DoesNotExist:
         raise serializers.ValidationError("user does not exist")
      request = self.context.get("request")
      if request.user.id == other_user.id:
         raise serializers.ValidationError(
            "you cannot create a conversation with yourself"
         )
      return value

      