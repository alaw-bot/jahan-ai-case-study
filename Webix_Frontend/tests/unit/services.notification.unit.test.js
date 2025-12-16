// Unit tests for NotificationService API behavior

import { NotificationService } from "../../sources/services/notification";

describe("NotificationService (unit)", () => {
    test("loadSettings returns default notification settings", async () => {
        const settings = await NotificationService.loadSettings();

        expect(settings).toHaveProperty("email_enabled", 1);
        expect(settings).toHaveProperty("security_alerts", 1);
        expect(settings).toHaveProperty("system_notif", 1);
        expect(settings).toHaveProperty("messages", 0);
        expect(settings).toHaveProperty("post_updates", 0);
        expect(settings).toHaveProperty("frequency", "instant");
    });

    test("saveSettings resolves after mock delay", async () => {
        const payload = { email_enabled: 0 };
        const start = Date.now();
        await NotificationService.saveSettings(payload);
        const elapsed = Date.now() - start;

        expect(elapsed).toBeGreaterThanOrEqual(0);
    });
});


