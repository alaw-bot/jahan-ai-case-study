from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    display_name = models.CharField(max_length=50, blank=True, default='')
    bio = models.TextField(max_length=500, blank=True, default='')
    phone_code = models.CharField(max_length=10, blank=True, default='')
    phone_number = models.CharField(max_length=20, blank=True, default='')
    country = models.CharField(max_length=50, blank=True, default='')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    dob = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, blank=True, default='')

    def __str__(self):
        return f"{self.user.username}'s Profile"