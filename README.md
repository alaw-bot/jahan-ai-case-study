## User Preferences Application

A full‑stack web application for managing user preferences, built with **Django REST Framework** (backend) and **Webix Jet** (frontend).  
This system provides user account management including authentication, profile customization, password changes, avatar upload, and a rich settings UI with theme and accessibility options.

---

## Features

- **Authentication**
  - User registration and login with **JWT token-based authentication** (Simple JWT)
  - Protected API endpoints using `Bearer` tokens

- **Profile Management**
  - View and update personal information (display name, bio, phone, country, date of birth, gender)
  - Upload and store profile avatars

- **Password Management**
  - Change password with validation against the existing password

- **Theme & UI Customization (Frontend)**
  - Light / dark / auto theme modes
  - Adjustable font size and font family
  - High‑contrast mode for accessibility
  - Per-user UI settings stored

- **Settings UI**
  - Sidebar-based settings layout with sections for:
    - Account
    - Notifications
    - Theme
    - Privacy 
  - Logout handling  

---

## Technology Stack

### Backend

- **Django 6**
- **Django REST Framework**
- **Simple JWT** for authentication
- **SQLite** database (default; easily replaceable)

### Frontend

- **Webix** and **Webix Jet**
- **JavaScript (ES modules)**
- **Vite** dev server and build tooling

### Testing & Tools

- **Django test framework** (backend unit/functional tests possible with `python manage.py test`)
- **Postman** for API testing
- **ESLint** for frontend linting

---

## Project Structure Overview

project-root/
├── Django_Backend/
│   ├── user_preferences/        # Django project (settings, URLs, WSGI)
│   ├── settings_api/            # REST API app (auth, profile, password, avatar)
│   │   ├── models.py            # UserProfile model
│   │   ├── serializers.py       # Profile, register, change password serializers
│   │   ├── views.py             # Register, login (via SimpleJWT), profile, change password, avatar upload
│   │   ├── urls.py              # API routes under /api/settings/
│   │   └── migrations/          # Database migrations
│   ├── media/
│   │   └── avatars/             # Stored avatar images
│   ├── manage.py
│   ├── Pipfile
│   └── Pipfile.lock
│
├── Webix_Frontend/
│   ├── index.html               # App entry HTML
│   ├── sources/
│   │   ├── myapp.js             # Main Webix Jet app (routing, auth guard, theme restore)
│   │   ├── locales/             # i18n files
│   │   ├── models/              # Example data models
│   │   ├── services/            # Notification, privacy, theme helpers (frontend)
│   │   ├── views/               # UI views (login, settings, account, theme, privacy, notifications, etc.)
│   │   └── styles/              # CSS files (app, login, account, settings, theme)
│   ├── package.json
│   ├── package-lock.json
│   └── README.md                # Frontend-specific instructions
│
├── Postman_API_testing.json     # (Optional) Postman collection for API testing
└── README.md                    # This file---

## Backend Setup

From the project root:

cd Django_Backend### Create and activate a virtual environment

# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate### Install dependencies

If you use **Pipenv** (recommended by the project):

pipenv install
pipenv shellOr, if you prefer a plain `venv` + `pip`, install the packages listed in `Pipfile` manually (or generate a `requirements.txt` from Pipenv).

### Run migrations

python manage.py migrate### Create a superuser (optional, for Django admin)

python manage.py createsuperuser### Start the development server

python manage.py runserverThe backend will run at:

http://127.0.0.1:8000API base URL:

http://127.0.0.1:8000/api/settings/> **Note:** CORS is configured to allow requests from `http://localhost:5173` (the frontend dev server).

---

## Frontend Setup

From the project root:

cd Webix_Frontend### Install dependencies

npm install### Start the development server

npm startThe frontend will run at:

http://localhost:5173The frontend automatically:

- Uses Webix Jet routing (starts at `/login`).
- Attaches JWT tokens from local storage to all AJAX requests.
- Redirects unauthenticated users back to the login page.

---

## Testing

### Backend Tests

If you add Django tests (e.g., under `Django_Backend/settings_api/tests.py`), you can run them with:

cd Django_Backend
python manage.py test### Frontend Linting

cd Webix_Frontend
npm run lint---


## Demo Usage Flow

1. **Register** a new user via the frontend login/register view or via the `/register/` API.
2. **Log in** to obtain a JWT; the frontend stores this token in local storage.
3. Access the **Settings** area:
   - Edit profile (display name, bio, contact info, etc.).
   - Upload an **avatar**.
   - Customize **theme**, font, and high‑contrast mode.
4. **Logout** from the settings sidebar, which clears the JWT token and redirects back to the login page.

---
