from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import ProfileAPIView, ChangePasswordView, AvatarUploadView, RegisterView, DeleteAccountView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'), # Default Login
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('profile/', ProfileAPIView.as_view(), name='user-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('avatar-upload/', AvatarUploadView.as_view(), name='avatar-upload'),
    path('delete-account/', DeleteAccountView.as_view(), name='delete-account'),
]