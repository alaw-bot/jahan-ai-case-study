function appGuard(url, token) {
    const nav = { redirect: null };

    if (url !== "/login" && !token) {
        nav.redirect = "/login";
    }

    return nav;
}

describe("Auth guard (unit)", () => {
    test("redirects to /login if no token and protected url", () => {
        const nav = appGuard("/settings", null);
        expect(nav.redirect).toBe("/login");
    });

    test("does not redirect if token exists", () => {
        const nav = appGuard("/settings", "abc123");
        expect(nav.redirect).toBeNull();
    });

    test("does not redirect when already on /login", () => {
        const nav = appGuard("/login", null);
        expect(nav.redirect).toBeNull();
    });
});


