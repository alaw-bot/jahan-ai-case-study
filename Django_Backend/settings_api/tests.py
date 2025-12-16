from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient

from .models import UserProfile


class AuthAndProfileAPITests(APITestCase):
    """
    End‑to‑end tests for the main authentication and profile endpoints.
    """

    def setUp(self):
        self.client = APIClient()

        # Common URLs
        self.register_url = reverse("auth_register")
        self.login_url = reverse("token_obtain_pair")
        self.refresh_url = reverse("token_refresh")
        self.profile_url = reverse("user-profile")
        self.change_password_url = reverse("change-password")
        self.avatar_upload_url = reverse("avatar-upload")

        # Create a base user for most tests
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="initialPassword123",
        )

    # ---------- Helper methods ----------

    def authenticate(self, username="testuser", password="initialPassword123"):
        """
        Helper to log in a user and set Authorization header on the client.
        """
        response = self.client.post(
            self.login_url,
            {"username": username, "password": password},
            format="json",
        )
        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
            msg="Login should succeed to obtain JWT tokens.",
        )

        access_token = response.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        return response.data

    # ---------- Registration tests ----------

    def test_register_creates_user(self):
        payload = {
            "username": "newuser",
            "email": "new@example.com",
            "password": "StrongPass123",
            "confirm_password": "StrongPass123",
        }

        response = self.client.post(self.register_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username="newuser").exists())

    def test_register_password_mismatch_returns_error(self):
        payload = {
            "username": "mismatchuser",
            "email": "mismatch@example.com",
            "password": "StrongPass123",
            "confirm_password": "WrongPass123",
        }

        response = self.client.post(self.register_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # ---------- Login / token tests ----------

    def test_login_returns_jwt_tokens(self):
        response = self.client.post(
            self.login_url,
            {"username": "testuser", "password": "initialPassword123"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_refresh_token(self):
        # First obtain tokens
        tokens = self.authenticate()
        refresh_token = tokens["refresh"]

        response = self.client.post(
            self.refresh_url,
            {"refresh": refresh_token},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    # ---------- Profile API tests ----------

    def test_get_profile_creates_and_returns_profile(self):
        self.authenticate()

        response = self.client.get(self.profile_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], self.user.email)
        # Profile should be created automatically
        self.assertTrue(UserProfile.objects.filter(user=self.user).exists())

    def test_update_profile_updates_user_and_profile_fields(self):
        self.authenticate()

        payload = {
            "username": "updatedname",
            "display_name": "Updated Display Name",
            "bio": "Updated bio text",
            "phone_code": "+1",
            "phone_number": "1234567890",
            "country": "Wonderland",
            "gender": "Non-binary",
        }

        response = self.client.patch(self.profile_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.user.refresh_from_db()
        profile = UserProfile.objects.get(user=self.user)

        self.assertEqual(self.user.username, "updatedname")
        self.assertEqual(profile.display_name, "Updated Display Name")
        self.assertEqual(profile.bio, "Updated bio text")
        self.assertEqual(profile.phone_code, "+1")
        self.assertEqual(profile.phone_number, "1234567890")
        self.assertEqual(profile.country, "Wonderland")
        self.assertEqual(profile.gender, "Non-binary")

    # ---------- Change password tests ----------

    def test_change_password_with_correct_old_password_succeeds(self):
        self.authenticate()

        payload = {
            "old_password": "initialPassword123",
            "new_password": "NewPassword456",
        }

        response = self.client.put(self.change_password_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get("detail"), "Success")

        # Confirm the user can now authenticate with the new password
        self.client.credentials()  # clear auth
        login_response = self.client.post(
            self.login_url,
            {"username": "testuser", "password": "NewPassword456"},
            format="json",
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)

    def test_change_password_with_incorrect_old_password_fails(self):
        self.authenticate()

        payload = {
            "old_password": "WrongPassword",
            "new_password": "NewPassword456",
        }

        response = self.client.put(self.change_password_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    # ---------- Avatar upload tests ----------

    def test_avatar_upload_saves_file_and_returns_url(self):
        self.authenticate()

        # Prepare a tiny fake image file (content doesn't matter for the test)
        image_content = b"\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x80\x00"
        image_file = SimpleUploadedFile(
            "test_avatar.gif",
            image_content,
            content_type="image/gif",
        )

        response = self.client.post(
            self.avatar_upload_url,
            {"upload": image_file},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data.get("status"), "server")
        self.assertIn("url", response.data)

        profile = UserProfile.objects.get(user=self.user)
        self.assertIsNotNone(profile.avatar)

    def test_avatar_upload_without_file_returns_error(self):
        self.authenticate()

        response = self.client.post(
            self.avatar_upload_url,
            {},  # no file
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)
