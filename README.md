# User Preferences Application

A full‑stack web application for managing user preferences, built with Django REST Framework (backend) and Webix Jet (frontend).
This system provides user account management including authentication, profile customization, password changes, avatar upload, and a rich settings UI with theme and accessibility options.

## Features

- **Authentication**
- User registration and login with JWT token-based authentication (Simple JWT)
- Protected API endpoints using Bearer tokens

- **Profile Management**
- View and update personal information (display name, bio, phone, country, date of birth, gender)
- Upload and store profile avatars

- **Password Management**
- Change password with validation against the existing password

- **Account Deletion**
- Secure Account Deletion

- **Notification Settings**
- Customize notification preferences including notification sound change and 2FA

- **Theme Customization**
- Sidebar-based settings layout with sections for:
  Account
  Notifications
  Theme
  Privacy
- Logout handling

## Technology Stack

**Backend:**

- Django 6
- Django REST Framework
- Simple JWT for authentication
- SQLite database (default; easily replaceable)

**Frontend:**

- Webix
- JavaScript
- Postman for API testing
- ESLint for frontend linting

**Testing:**

- Jest

## Project Structure Overview

```
Project Structure Overview
────────────────────────────────────────────────────────────────────────────────────────────────
project-root/
├── Django_Backend/
│   ├── user_preferences/      # Django project (settings, URLs, WSGI)
│   ├── settings_api/          # REST API app (auth, profile, password, avatar)
│   ├── models.py              # UserProfile model
│   ├── serializers.py         # Profile, register, change password serializers
│   ├── urls.py                # API routes under /api/settings/
│   ├── migrations/            # Database migrations
│   ├── media/                 # Uploaded media files (avatars)
│   ├── avatars/               # Stored avatar images
│   ├── manage.py              # Django management script
│   ├── Pipfile                # Dependency management
│   └── Pipfile.lock           # Dependency lock file
├── Webix_Frontend/
│   ├── index.html             # App entry HTML
│   ├── sources/
│   │   ├── myapp.js           # Main Webix Jet app (routing, auth guard, theme restore)
│   │   ├── locales/           # i18n files
│   │   ├── models/            # Example data models
│   │   ├── views/             # UI views (login, settings, account, theme, privacy)
│   │   ├── services/          # Notification, privacy, theme helpers (frontend)
│   │   └── styles/            # CSS files
│   ├── package.json           # Frontend dependencies
│   └── package-lock.json      # Dependency lock file
├── tests/
│   ├── functional/
│   │   └── app.guard.functional.test.js   # Functional tests for app guards
│   └── unit/
│       ├── auth.guard.unit.test.js        # Unit tests for auth guard
│       ├── sample.unit.test.js           # Sample unit test
│       ├── services.auth.unit.test.js    # Unit tests for authentication service
│       ├── services.notification.unit.test.js   # Unit tests for notification service
│       ├── services.privacy.unit.test.js     # Unit tests for privacy settings
│       └── jest.setup.js                  # Jest setup file for unit tests
└── README.md                 # Frontend-specific instructions

```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:

```bash
cd Django_Backend
```

2. Create and activate a virtual environment:

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Run migrations:

```bash
python manage.py migrate
```

5. Start the development server:

```bash
python manage.py runserver
```

The backend will run at `http://127.0.0.1:8000`

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd Webix_Frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

The frontend will run at `http://localhost:5173`

## Testing

### Frontend Tests

Run all tests:

```bash
npm test
```

### Demo Usage Flow

- Register a new user via the frontend login/register view or via the /register/ API.
- Log in to obtain a JWT; the frontend stores this token in local storage.
- Access the Settings area:
  Edit profile (display name, bio, contact info, etc.).
  Upload an avatar.
  Customize theme, font, and high‑contrast mode.
- Logout from the settings sidebar, which clears the JWT token and redirects back to the login page.
