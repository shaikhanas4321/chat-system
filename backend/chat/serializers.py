from rest_framework import serializers
from accounts.models import User
from chat.models import Conversation , Message


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

class ConersationListSerializer(serializers.ModelSerializer):
    class Meta:
       model = Conversation
       fields = ["id" , "user1" , "user2" , "created_at"]

class MessageCreateSerializer(serializers.ModelSerializer):
   class Meta:
      model = Message
      fields = ["conversation","content"]
      def validate_conversation(self , conversation):
         request = self.context.get("request")
         if request.user.id not in (conversation.user1_id,conversation.user2_id):
            raise serializers.ValidationError("you are not a participant of this conversation")
         return conversation


class MessageListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = [
            "id",
            "conversation",
            "sender",
            "content",
            "is_read",
            "created_at"
        ]