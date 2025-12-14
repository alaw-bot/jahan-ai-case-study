from rest_framework import serializers
from .models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    email = serializers.CharField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', required=False)
    
    class Meta:
        model = UserProfile
        fields = ('id', 'username', 'email', 'display_name', 'bio', 
                  'phone_code', 'phone_number', 'country', 'avatar')
        read_only_fields = ('email',)

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        user = instance.user
        if 'username' in user_data:
            user.username = user_data['username']
            user.save()

        instance.display_name = validated_data.get('display_name', instance.display_name)
        instance.bio = validated_data.get('bio', instance.bio)
        instance.phone_code = validated_data.get('phone_code', instance.phone_code)
        instance.phone_number = validated_data.get('phone_number', instance.phone_number)
        instance.country = validated_data.get('country', instance.country)
        instance.save()
        return instance

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)