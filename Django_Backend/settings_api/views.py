from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser 
from django.contrib.auth.models import User
from .models import UserProfile
from .serializers import UserProfileSerializer, ChangePasswordSerializer


class ProfileAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [AllowAny] # Without login 

    def get_object(self):
        user = User.objects.first()
        if not user:
            user = User.objects.create_superuser('admin', 'admin@test.com', 'admin123')
        profile, created = UserProfile.objects.get_or_create(user=user)
        return profile

class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [AllowAny]
    
    def get_object(self):
        user = User.objects.first()
        if not user:
            user = User.objects.create_superuser('admin', 'admin@test.com', 'admin123')
        return user
    
    def update(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            if not user.check_password(serializer.data.get("old_password")):
                return Response({"error": "Incorrect old password."}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(serializer.data.get("new_password"))
            user.save()
            return Response({"detail": "Success"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AvatarUploadView(APIView):

    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [AllowAny] 
    
    def post(self, request, format=None):
        user = User.objects.first()
        if not user:
            user = User.objects.create_superuser('admin', 'admin@test.com', 'admin123')
            
        profile, created = UserProfile.objects.get_or_create(user=user)
        if 'upload' not in request.FILES:
            return Response({"error": "No file attached."}, status=status.HTTP_400_BAD_REQUEST)

        avatar_file = request.FILES['upload']
        
        profile.avatar = avatar_file
        profile.save()

        return Response({
            "status": "server",
            "name": avatar_file.name,
            "url": profile.avatar.url
        }, status=status.HTTP_201_CREATED)