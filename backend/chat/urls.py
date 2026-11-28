from django.urls import path
from chat.views import *


urlpatterns = [
    path("conversations/",ConversationCreateView.as_view(), name="create_conversation"),
    path("conversations/list/", ConversationListView.as_view() , name="conversation-list")

]