const mockApiRequest = jest.fn();

const mockGetTokens = jest.fn();
const mockSetTokens = jest.fn();
const mockClearTokens = jest.fn();

jest.mock("../../sources/config/api", () => ({
    API_CONFIG: {
        ENDPOINTS: {
            LOGIN: "/auth/login/",
            REGISTER: "/auth/register/",
            LOGOUT: "/auth/logout/",
            PROFILE: "/auth/profile/",
            CHANGE_PASSWORD: "/auth/change-password/",
            DELETE_ACCOUNT: "/auth/delete-account/",
        },
    },
    apiRequest: (...args) => mockApiRequest(...args),
    getTokens: () => mockGetTokens(),
    setTokens: (...args) => mockSetTokens(...args),
    clearTokens: () => mockClearTokens(),
}));

// mock localStorage and sessionStorage
const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};

const mockSessionStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};

global.localStorage = mockLocalStorage;
global.sessionStorage = mockSessionStorage;
// Ensure sessionStorage is available as a global variable (not just on global object)
Object.defineProperty(global, "sessionStorage", {
    value: mockSessionStorage,
    writable: true,
    configurable: true,
});

const AuthService = require("../../sources/services/auth").default;

describe("AuthService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        AuthService.currentUser = null;

        mockGetTokens.mockReturnValue({ access: "token123", refresh: "refresh123" });
    });

    describe("User Transformation", () => {
        test("should transform backend user to frontend format", async () => {
            mockApiRequest.mockResolvedValue({
                success: true,
                data: {
                    success: true,
                    user: {
                        id: 1,
                        full_name: "John Doe",
                        email: "john@example.com",
                        country: "USA",
                        country_code: "+1",
                        phone: "1234567890",
                        date_of_birth: "1990-01-01",
                        gender: "male",
                        date_joined: "2024-01-01",
                    },
                    tokens: { access: "token", refresh: "refresh" },
                },
            });

            const result = await AuthService.login("john@example.com", "password");

            expect(result.success).toBe(true);
            expect(result.user.fullName).toBe("John Doe");
            expect(result.user.countryCode).toBe("+1");
            expect(result.user.dateOfBirth).toBe("1990-01-01");
        });
    });

    describe("Login", () => {
        test("should return error on failed login", async () => {
            mockApiRequest.mockResolvedValue({
                success: false,
                data: { error: "Invalid credentials" },
            });

            const result = await AuthService.login("wrong@example.com", "wrongpass");

            expect(result.success).toBe(false);
            expect(result.error).toBe("Invalid credentials");
        });

        test("should handle network errors", async () => {
            mockApiRequest.mockRejectedValue(new Error("Network error"));

            const result = await AuthService.login("test@test.com", "pass");

            expect(result.success).toBe(false);
            expect(result.error).toBe("Network error");
        });
    });

    describe("Register", () => {
        test("should register successfully with valid data", async () => {
            mockApiRequest.mockResolvedValue({
                success: true,
                data: {
                    success: true,
                    user: { id: 1, full_name: "Jane Doe", email: "jane@example.com" },
                    tokens: { access: "token", refresh: "refresh" },
                },
            });

            const result = await AuthService.register("Jane Doe", "jane@example.com", "Pass@123");

            expect(result.success).toBe(true);
            expect(result.user.fullName).toBe("Jane Doe");
            expect(mockApiRequest).toHaveBeenCalledWith(
                "/auth/register/",
                expect.objectContaining({
                    method: "POST",
                    body: expect.stringContaining("Jane Doe"),
                })
            );
        });

        test("should return validation errors from backend", async () => {
            mockApiRequest.mockResolvedValue({
                success: false,
                data: {
                    errors: {
                        email: ["Email already exists"],
                        password: ["Password too weak"],
                    },
                },
            });

            const result = await AuthService.register("Test", "test@test.com", "weak");

            expect(result.success).toBe(false);
            expect(result.errors.email).toContain("Email already exists");
        });
    });

    describe("Logout", () => {
        test("should logout successfully", async () => {
            mockApiRequest.mockResolvedValue({ success: true, data: { success: true } });
            mockGetTokens.mockReturnValue({ refresh: "refresh123" });

            const result = await AuthService.logout();

            expect(result.success).toBe(true);
            expect(mockClearTokens).toHaveBeenCalled();
            expect(AuthService.currentUser).toBe(null);
        });

        test("should clear local data even if API fails", async () => {
            mockApiRequest.mockRejectedValue(new Error("API error"));

            const result = await AuthService.logout();

            expect(result.success).toBe(true);
            expect(mockClearTokens).toHaveBeenCalled();
        });
    });

    describe("Get Current User", () => {
        test("should return current user from memory", () => {
            AuthService.currentUser = { id: 1, fullName: "John Doe" };

            const user = AuthService.getCurrentUser();

            expect(user.fullName).toBe("John Doe");
        });

        test("should load user from sessionStorage", () => {
            AuthService.currentUser = null;
            // Reset and set up the mock for this specific test
            mockSessionStorage.getItem.mockReset();
            mockSessionStorage.getItem.mockImplementation((key) => {
                if (key === "currentUser") {
                    return JSON.stringify({ id: 1, fullName: "Jane Doe" });
                }
                return null;
            });

            const user = AuthService.getCurrentUser();

            expect(user).not.toBeNull();
            expect(user.fullName).toBe("Jane Doe");
        });
    });

    describe("Is Authenticated", () => {
        test("should return true when tokens exist", () => {
            mockGetTokens.mockReturnValue({ access: "token123", refresh: "refresh123" });

            expect(AuthService.isAuthenticated()).toBe(true);
        });

        test("should return false when no tokens", () => {
            mockGetTokens.mockReturnValue(null);

            expect(AuthService.isAuthenticated()).toBe(false);
        });
    });

    describe("Update Profile", () => {
        test("should update profile successfully", async () => {
            mockApiRequest.mockResolvedValue({
                success: true,
                data: {
                    success: true,
                    user: {
                        id: 1,
                        full_name: "John Updated",
                        email: "john@example.com",
                        country: "Canada",
                    },
                },
            });

            const result = await AuthService.updateProfile({
                fullName: "John Updated",
                country: "Canada",
            });

            expect(result.success).toBe(true);
            expect(result.user.fullName).toBe("John Updated");
        });

        test("should return validation errors", async () => {
            mockApiRequest.mockResolvedValue({
                success: false,
                data: {
                    errors: {
                        phone: ["Invalid phone number"],
                    },
                },
            });

            const result = await AuthService.updateProfile({ phone: "123" });

            expect(result.success).toBe(false);
            expect(result.errors.phone).toBeDefined();
        });
    });

    describe("Change Password", () => {
        test("should change password successfully", async () => {
            mockApiRequest.mockResolvedValue({
                success: true,
                data: { success: true, message: "Password changed" },
            });

            const result = await AuthService.changePassword("oldpass", "newpass", "newpass");

            expect(result.success).toBe(true);
            expect(mockApiRequest).toHaveBeenCalledWith(
                "/auth/change-password/",
                expect.objectContaining({
                    method: "POST",
                    body: expect.stringContaining("current_password"),
                })
            );
        });

        test("should return error for incorrect current password", async () => {
            mockApiRequest.mockResolvedValue({
                success: false,
                data: {
                    errors: {
                        current_password: ["Current password is incorrect"],
                    },
                },
            });

            const result = await AuthService.changePassword("wrong", "new", "new");

            expect(result.success).toBe(false);
            expect(result.error).toContain("incorrect");
        });
    });

    describe("Delete Account", () => {
        test("should delete account with correct password and confirmation", async () => {
            mockApiRequest.mockResolvedValue({
                success: true,
                data: { success: true, message: "Account deleted" },
            });

            const result = await AuthService.deleteAccount("password", "DELETE");

            expect(result.success).toBe(true);
            expect(mockClearTokens).toHaveBeenCalled();
            expect(AuthService.currentUser).toBe(null);
        });

        test("should return error for wrong confirmation", async () => {
            mockApiRequest.mockResolvedValue({
                success: false,
                data: {
                    errors: {
                        confirmation: ["Confirmation must be DELETE"],
                    },
                },
            });

            const result = await AuthService.deleteAccount("password", "WRONG");

            expect(result.success).toBe(false);
            expect(result.errors).toBeDefined();
        });
    });

    describe("Local Preferences", () => {
        beforeEach(() => {
            AuthService.currentUser = { id: 1, fullName: "Test User" };
            mockLocalStorage.getItem.mockReturnValue(null);
        });

        test("should update notification preferences", () => {
            const prefs = { email: true, push: false };

            const result = AuthService.updateNotificationPreferences(prefs);

            expect(result.success).toBe(true);
            expect(result.preferences).toEqual(prefs);
        });

        test("should update privacy settings", () => {
            const settings = { profileVisibility: "private" };

            const result = AuthService.updatePrivacySettings(settings);

            expect(result.success).toBe(true);
            expect(result.settings).toEqual(settings);
        });
    });
});


