import { API_CONFIG, apiRequest, getTokens, setTokens, clearTokens } from "../config/api";

const SESSION_USER_KEY = "currentUser";

function transformUser(backendUser) {
  if (!backendUser) return null;

  return {
    id: backendUser.id,
    fullName: backendUser.full_name,
    email: backendUser.email,
    country: backendUser.country,
    countryCode: backendUser.country_code,
    phone: backendUser.phone,
    dateOfBirth: backendUser.date_of_birth,
    gender: backendUser.gender,
    dateJoined: backendUser.date_joined,
  };
}

function saveUserToSession(user) {
  if (typeof sessionStorage === "undefined") return;
  if (!user) {
    sessionStorage.removeItem(SESSION_USER_KEY);
  } else {
    sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
  }
}

function loadUserFromSession() {
  if (typeof sessionStorage === "undefined") return null;
  const raw = sessionStorage.getItem(SESSION_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

const AuthService = {
  currentUser: null,

  async login(email, password) {
    try {
      const response = await apiRequest(API_CONFIG.ENDPOINTS.LOGIN, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (!response.success || !response.data?.success) {
        const data = response.data || {};
        return {
          success: false,
          error: data.error || "Login failed",
          errors: data.errors,
        };
      }

      const { user, tokens } = response.data;
      if (tokens) {
        setTokens(tokens);
      }

      const frontendUser = transformUser(user);
      this.currentUser = frontendUser;
      saveUserToSession(frontendUser);

      return {
        success: true,
        user: frontendUser,
      };
    } catch (err) {
      return {
        success: false,
        error: err.message || "Network error",
      };
    }
  },

  async register(fullName, email, password) {
    try {
      const response = await apiRequest(API_CONFIG.ENDPOINTS.REGISTER, {
        method: "POST",
        body: JSON.stringify({
          full_name: fullName,
          email,
          password,
        }),
      });

      if (!response.success || !response.data?.success) {
        const data = response.data || {};
        return {
          success: false,
          error: data.error || "Registration failed",
          errors: data.errors,
        };
      }

      const { user, tokens } = response.data;
      if (tokens) {
        setTokens(tokens);
      }

      const frontendUser = transformUser(user);
      this.currentUser = frontendUser;
      saveUserToSession(frontendUser);

      return {
        success: true,
        user: frontendUser,
      };
    } catch (err) {
      return {
        success: false,
        error: err.message || "Network error",
      };
    }
  },

  async logout() {
    const tokens = getTokens();

    try {
      if (tokens && tokens.refresh) {
        await apiRequest(API_CONFIG.ENDPOINTS.LOGOUT, {
          method: "POST",
          body: JSON.stringify({ refresh: tokens.refresh }),
        });
      }
    } catch (e) {
      // Ignore API errors but still clear local state
    }

    clearTokens();
    this.currentUser = null;
    saveUserToSession(null);

    return { success: true };
  },

  getCurrentUser() {
    if (this.currentUser) {
      return this.currentUser;
    }

    const user = loadUserFromSession();
    if (user) {
      this.currentUser = user;
    }
    return user;
  },

  isAuthenticated() {
    const tokens = getTokens();
    return !!(tokens && tokens.access);
  },

  async updateProfile(updates) {
    try {
      const response = await apiRequest(API_CONFIG.ENDPOINTS.PROFILE, {
        method: "PUT",
        body: JSON.stringify(updates),
      });

      if (!response.success || !response.data?.success) {
        const data = response.data || {};
        return {
          success: false,
          error: data.error || "Update profile failed",
          errors: data.errors,
        };
      }

      const frontendUser = transformUser(response.data.user);
      this.currentUser = frontendUser;
      saveUserToSession(frontendUser);

      return {
        success: true,
        user: frontendUser,
      };
    } catch (err) {
      return {
        success: false,
        error: err.message || "Network error",
      };
    }
  },

  async changePassword(currentPassword, newPassword, confirmPassword) {
    try {
      const response = await apiRequest(API_CONFIG.ENDPOINTS.CHANGE_PASSWORD, {
        method: "POST",
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      if (!response.success || !response.data?.success) {
        const data = response.data || {};
        let errorMessage = data.error || "Change password failed";
        if (data.errors?.current_password?.length) {
          errorMessage = data.errors.current_password.join(" ");
        }

        return {
          success: false,
          error: errorMessage,
          errors: data.errors,
        };
      }

      return {
        success: true,
        message: response.data.message,
      };
    } catch (err) {
      return {
        success: false,
        error: err.message || "Network error",
      };
    }
  },

  async deleteAccount(password, confirmation) {
    try {
      const response = await apiRequest(API_CONFIG.ENDPOINTS.DELETE_ACCOUNT, {
        method: "POST",
        body: JSON.stringify({ password, confirmation }),
      });

      if (!response.success || !response.data?.success) {
        const data = response.data || {};
        return {
          success: false,
          error: data.error || "Delete account failed",
          errors: data.errors,
        };
      }

      clearTokens();
      this.currentUser = null;
      saveUserToSession(null);

      return {
        success: true,
        message: response.data.message,
      };
    } catch (err) {
      return {
        success: false,
        error: err.message || "Network error",
      };
    }
  },

  updateNotificationPreferences(prefs) {
    if (!this.currentUser) {
      return { success: false, error: "Not authenticated" };
    }

    if (typeof localStorage !== "undefined") {
      const key = `notificationPreferences:${this.currentUser.id}`;
      localStorage.setItem(key, JSON.stringify(prefs));
    }

    return {
      success: true,
      preferences: prefs,
    };
  },

  updatePrivacySettings(settings) {
    if (!this.currentUser) {
      return { success: false, error: "Not authenticated" };
    }

    if (typeof localStorage !== "undefined") {
      const key = `privacySettings:${this.currentUser.id}`;
      localStorage.setItem(key, JSON.stringify(settings));
    }

    return {
      success: true,
      settings,
    };
  },
};

export default AuthService;



