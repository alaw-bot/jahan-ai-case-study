import {JetView} from "webix-jet";

export default class NotifyView extends JetView {
    config() {
        return {
            view: "form",
            scroll: true,
            elements: [
                { template: "Alert Preferences", type: "section" },
                { view: "switch", label: "Email Alerts", name: "email_notif", labelWidth: 200, value: 1 },
                { view: "switch", label: "Push Notifications", name: "push_notif", labelWidth: 200 },
                { view: "button", value: "Save", css: "webix_primary", click: () => webix.message("Saved") }
            ]
        };
    }
}