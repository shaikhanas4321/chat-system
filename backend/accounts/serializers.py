from rest_framework import serializers
from accounts.models import User

class Registerserializers(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True , style={ "input_type":"password"})
    confirm_password= serializers.CharField(write_only=True , style={ "input_type":"password"})
    def validate(self , data):
        password = data["password"]
        confirm_password=data["confirm_password"]
        if password != confirm_password:
            raise serializers.ValidationError("confirm password should match")
        if User.objects.filter(email = data["email"]).exists():
            raise serializers.ValidationError("a user email already exist")
        return data
    def create(self ,validated_data):
       validated_data.pop("confirm_password")
       user = User.objects.create_user(email = validated_data["email"] , password = validated_data["password"])
       return user
        

     
