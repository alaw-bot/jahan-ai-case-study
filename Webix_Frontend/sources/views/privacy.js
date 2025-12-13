import { JetView } from "webix-jet";
import * as webix from "webix";
import { PrivacyService } from "../services/privacy"; 

export default class PrivacySettingsView extends JetView {
    STORAGE_KEY = "user_privacy_settings";

    config() {
        return {
            view: "scrollview",
            scroll: "y",
            body: {

                rows: [
                    {
                        view: "form",
                        localId: "privacyForm",
                        fillspace: true,
                        borderless: true,
                        elementsConfig: {
                            labelWidth: 250,
                            bottomPadding: 18
                        },
                        elements: [
                            {
                                rows: [
                                    { template: "Privacy Settings", type: "header", borderless: true, css: "webix_header_l" },
                                    { 
                                        template: "Control your privacy and data sharing preferences", 
                                        height: 35, 
                                        borderless: true, 
                                        css: "webix_el_label", 
                                        style: "color: #888;" 
                                    }
                                ]
                            },
                            { height: 20 },

                            // ACCOUNT PRIVACY
                            { template: "Account Privacy", type: "section", css: { "text-align": "center", "font-size": "18px" } },
                            {
                                view: "radio",
                                name: "account_privacy",
                                vertical: true,
                                value: "public",
                                options: [
                                    { id: "public", value: "🌐 Public" },
                                    { id: "private", value: "🔒 Private" }
                                ]
                            },

                            { height: 20 },

                            // ACTIVITY STATUS
                            { template: "Activity Status", type: "section", css: { "text-align": "center", "font-size": "18px" } },
                            {
                                view: "switch",
                                name: "show_activity",
                                label: "Show when you're online",
                                value: 1
                            },

                            { height: 20 },

                            // PERSONALIZED RECOMMENDATIONS
                            { 
                                view: "switch",
                                name: "personalized_recommendations",
                                label: "Allow personalized recommendations",
                                value: 1
                            },

                            { height: 20 },

                            // TWO-FACTOR AUTHENTICATION
                            { template: "Two-Factor Authentication", type: "section", css: { "text-align": "center", "font-size": "18px" } },
                            {
                                view: "switch",
                                name: "two_factor",
                                localId: "two_factor",
                                label: "Enable two-factor authentication (2FA)",
                                value: 0,
                                on: {
                                    onChange: (value) => {
                                        const selector = this.$$("two_factor_method");
                                        value ? selector.enable() : selector.disable();
                                    }
                                }
                            },
                            {
                                view: "richselect",
                                localId: "two_factor_method",
                                name: "two_factor_method",
                                label: "2FA Method",
                                value: "mobile",
                                options: [
                                    { id: "mobile", value: "📱 Mobile" },
                                    { id: "email", value: "✉️ Email" }
                                ],
                                disabled: true
                            },

                            { height: 30 },
                            {
                                cols: [
                                    {
                                        view: "button",
                                        value: "Delete Account",
                                        css: "webix_danger",
                                        width: 140,
                                        click: () => this.deleteAccount()
                                    },
                                    {}, 
                                    {
                                        view: "button",
                                        value: "Reset",
                                        width: 100,
                                        click: () => this.resetForm()
                                    },
                                    {
                                        view: "button",
                                        value: "Save Changes",
                                        css: "webix_primary",
                                        width: 140,
                                        click: () => this.saveSettings()
                                    }
                                ]
                            }, 
                            { height: 50 }
                        ]
                    },
                    {} 
                ]
            }
        };
    }
    init() {
        const form = this.$$("privacyForm");
        const storedData = webix.storage.local.get(this.STORAGE_KEY);
        
        if (storedData) {
            form.setValues(storedData);
            webix.message({ type: "info", text: "Settings loaded from browser session." });
        } else {
            this.loadFromAPI(form);
        }

        this.update2FAState(form.getValues().two_factor);
    }
    loadFromAPI(form) {
        PrivacyService.loadSettings()
            .then(data => {
                form.setValues(data);
                webix.storage.local.put(this.STORAGE_KEY, data); 
                webix.message({ type: "success", text: "Settings fetched from server." });
            })
            .catch(() => {
                webix.message({ type: "error", text: "Could not load settings from server. Using defaults." });
                this.resetForm(); 
            });
    }

    update2FAState(value) {
        const selector = this.$$("two_factor_method");
        value ? selector.enable() : selector.disable();
    }

    saveSettings() {
        const form = this.$$("privacyForm");
        const values = form.getValues();

        PrivacyService.saveSettings(values)
            .then(() => {
                webix.storage.local.put(this.STORAGE_KEY, values);
                webix.message({ type: "success", text: "Saved permanently & session updated!" });
            })
            .catch(() => {
                 webix.message({ type: "error", text: "Failed to save settings to server. Check API." });
            });
    }

    resetForm() {
        const form = this.$$("privacyForm");
        const defaultValues = {
            account_privacy: "public",
            show_activity: 1,
            personalized_recommendations: 1,
            two_factor: 0,
            two_factor_method: "mobile"
        };
        form.setValues(defaultValues);
        this.update2FAState(0);
        
        webix.storage.local.remove(this.STORAGE_KEY);
        
        webix.message("Privacy settings reset to default");
    }

    deleteAccount() {
        webix.confirm({
            title: "Delete Account",
            text: "Are you sure you want to delete your account? This action cannot be undone.",
            ok: "Delete",
            cancel: "Cancel"
        }).then(() => {
            webix.storage.local.remove(this.STORAGE_KEY);
            webix.message("Account deletion initiated.");
        });
    }
}