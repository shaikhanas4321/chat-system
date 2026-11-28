from django.urls import path
from chat.views import *


urlpatterns = [
    path("conversations/",ConversationCreateView.as_view(), name="create_conversation"),
    path("conversations/list/", ConversationListView.as_view() , name="conversation-list"),
    path("messages/",MessageCreateView.as_view(), name = "create-message"),
    path("conversations/<int:conversation_id>/messages/", MessageListView.as_view(), name= "message-list")

]