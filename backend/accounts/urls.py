from django.urls import path
from accounts import views
from accounts.views import *

urlpatterns=[
    path("register/", register.as_view(),name="register")
    ]