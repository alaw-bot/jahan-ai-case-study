from django.urls import path
from .views import ProfileAPIView, ChangePasswordView, AvatarUploadView

urlpatterns = [
    path('profile/', ProfileAPIView.as_view(), name='user-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('avatar-upload/', AvatarUploadView.as_view(), name='avatar-upload'),
]