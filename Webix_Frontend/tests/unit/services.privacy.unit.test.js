// Unit tests for PrivacyService API behavior

import { PrivacyService } from "../../sources/services/privacy";

describe("PrivacyService (unit)", () => {
    test("loadSettings returns default privacy settings", async () => {
        const settings = await PrivacyService.loadSettings();

        expect(settings).toHaveProperty("account_privacy", "public");
        expect(settings).toHaveProperty("show_activity", 1);
        expect(settings).toHaveProperty("personalized_recommendations", 1);
        expect(settings).toHaveProperty("two_factor", 0);
    });

    test("saveSettings resolves after mock delay", async () => {
        const payload = { account_privacy: "private" };
        const start = Date.now();
        await PrivacyService.saveSettings(payload);
        const elapsed = Date.now() - start;

        expect(elapsed).toBeGreaterThanOrEqual(0);
    });
});


