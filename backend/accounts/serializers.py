from rest_framework import serializers
from accounts.models import User , emailOTP

class Registerserializers(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True , style={ "input_type":"password"})
    confirm_password= serializers.CharField(write_only=True , style={ "input_type":"password"})
    def validate(self , data):
        password = data["password "]
        confirm_password=data["confirm_password"]
        if password != confirm_password:
            raise serializers.ValidationError("confirm password should match")
        else:
            return None
        

     
