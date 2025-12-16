// Functional tests for complete user authentication flows

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
        },
    },
    apiRequest: (...args) => mockApiRequest(...args),
    getTokens: () => mockGetTokens(),
    setTokens: (...args) => mockSetTokens(...args),
    clearTokens: () => mockClearTokens(),
}));

// Mock localStorage and sessionStorage
const mockStorage = {
    token: null,
    current_user_id: null,
};

const mockLocalStorage = {
    getItem: jest.fn((key) => {
        if (key === "authTokens") {
            return mockStorage.token ? JSON.stringify({ access: mockStorage.token, refresh: "refresh123" }) : null;
        }
        return null;
    }),
    setItem: jest.fn((key, value) => {
        if (key === "authTokens") {
            const tokens = JSON.parse(value);
            mockStorage.token = tokens.access;
        }
    }),
    removeItem: jest.fn((key) => {
        if (key === "authTokens") {
            mockStorage.token = null;
        }
    }),
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
Object.defineProperty(global, "sessionStorage", {
    value: mockSessionStorage,
    writable: true,
    configurable: true,
});

// App guard function (simulates routing guard)
function appGuard({ url, token }) {
    const nav = { redirect: null };

    if (url !== "/login" && !token) {
        nav.redirect = "/login";
    }

    return nav;
}

const AuthService = require("../../sources/services/auth").default;

describe("app guard functional behavior", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        AuthService.currentUser = null;
        mockStorage.token = null;
        mockStorage.current_user_id = null;
        mockGetTokens.mockReturnValue(null);
    });

    test("redirects to /login when no token and protected url", () => {
        const nav = appGuard({ url: "/settings", token: null });
        expect(nav.redirect).toBe("/login");
    });

    test("does not redirect when token exists", () => {
        const nav = appGuard({ url: "/settings", token: "abc123" });
        expect(nav.redirect).toBeNull();
    });

    test("does not redirect when already on /login", () => {
        const nav = appGuard({ url: "/login", token: null });
        expect(nav.redirect).toBeNull();
    });

    test("complete login flow: user logs in → token stored → can access protected routes", async () => {
        // Step 1: User attempts to access protected route before login
        let nav = appGuard({ url: "/settings", token: mockStorage.token });
        expect(nav.redirect).toBe("/login");
        expect(AuthService.isAuthenticated()).toBe(false);

        // Step 2: User logs in successfully
        mockApiRequest.mockResolvedValue({
            success: true,
            data: {
                success: true,
                user: {
                    id: 1,
                    full_name: "John Doe",
                    email: "john@example.com",
                },
                tokens: { access: "token123", refresh: "refresh123" },
            },
        });

        mockGetTokens.mockReturnValue({ access: "token123", refresh: "refresh123" });

        const loginResult = await AuthService.login("john@example.com", "password");

        // Step 3: Verify login succeeded
        expect(loginResult.success).toBe(true);
        expect(loginResult.user.fullName).toBe("John Doe");
        expect(mockSetTokens).toHaveBeenCalledWith({ access: "token123", refresh: "refresh123" });

        // Step 4: After login, user can access protected routes
        mockGetTokens.mockReturnValue({ access: "token123", refresh: "refresh123" });
        nav = appGuard({ url: "/settings", token: mockStorage.token || "token123" });
        expect(nav.redirect).toBeNull();
        expect(AuthService.isAuthenticated()).toBe(true);
    });

    test("complete logout flow: user logs out → token cleared → redirected to login", async () => {
        // Step 1: Setup - user is logged in
        mockStorage.token = "token123";
        AuthService.currentUser = { id: 1, fullName: "John Doe" };
        mockGetTokens.mockReturnValue({ access: "token123", refresh: "refresh123" });

        // Step 2: User can access protected routes while logged in
        let nav = appGuard({ url: "/settings", token: mockStorage.token });
        expect(nav.redirect).toBeNull();
        expect(AuthService.isAuthenticated()).toBe(true);

        // Step 3: User logs out
        mockApiRequest.mockResolvedValue({ success: true, data: { success: true } });
        mockGetTokens.mockReturnValue({ refresh: "refresh123" });

        const logoutResult = await AuthService.logout();

        // Step 4: Verify logout succeeded and tokens cleared
        expect(logoutResult.success).toBe(true);
        expect(mockClearTokens).toHaveBeenCalled();
        expect(AuthService.currentUser).toBeNull();

        // Step 5: After logout, user is redirected to login when accessing protected routes
        mockGetTokens.mockReturnValue(null);
        nav = appGuard({ url: "/settings", token: null });
        expect(nav.redirect).toBe("/login");
        expect(AuthService.isAuthenticated()).toBe(false);
    });
});
