from django.db import models
from django.conf import settings
from django.db.models import Q , F
from django.core.exceptions import ValidationError
# Create your models here.
class Conversation(models.Model):
    user1 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE ,
        related_name="conversation_as_user1")
    user2 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE ,
        related_name="conversation_as_user2")
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        constraints =[
            models.UniqueConstraint(
                fields=["user1" , "user2"],
                name="unique_conversation_pair"
            ),
            models.CheckConstraint(
                condition=~Q(user1=F("user2")),
                name="conversation_users_must_be_different"
            )
        ]
    def save(self, *args , **kwargs):
       if self.user1_id and self.user2_id:
            if self.user1_id > self.user2_id:
                self.user1_id, self.user2_id = (
                    self.user2_id,
                    self.user1_id
                )
       super().save(*args, **kwargs)
    def __str__(self):
        return f"Conversation: {self.user1} - {self.user2}"


class Message(models.Model):

    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name="messages"
    )

    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_messages"
    )

    content = models.TextField()

    is_read = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        super().clean()

        if self.conversation_id and self.sender_id:
            conversation = self.conversation

            if self.sender_id not in (
                conversation.user1_id,
                conversation.user2_id
            ):
                raise ValidationError(
                    "Sender must be a participant of this conversation."
                )

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Message from {self.sender}"
    