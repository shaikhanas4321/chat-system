from django.urls import path
from accounts import views
from accounts.views import *

urlpatterns=[
    path("register/", RegisterView.as_view(),name="register"),
    path("verify-otp/" , verifyOTP.as_view(), name= "verify-otp"),
    path("login/",LoginView.as_view(),name="login"),
    path("profile/" , ProfileView.as_view(), name="profile"),
    path("set-username/" , setUsername.as_view() , name= "set-username")
    ]