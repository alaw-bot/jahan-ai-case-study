import { JetView } from "webix-jet";

export default class PrivacySettingsView extends JetView {
    config() {
        return {
            view: "scrollview",
            scroll: "y",
            body: {
                cols: [
                    {
                        view: "form",
                        localId: "privacyForm",
                        width: 0,
                        borderless: true,
                        elementsConfig: {
                            labelWidth: 250,
                            bottomPadding: 18
                        },
                        elements: [

                            // HEADER
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

                            // BUTTONS
                            {
                                cols: [
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

                            { height: 30 },

                            // DELETE ACCOUNT
                            {
                                view: "button",
                                value: "Delete Account",
                                css: "webix_danger",
                                // width: 200,
                                click: () => this.deleteAccount()
                            },

                            { height: 50 }
                        ]
                    }
                ]
            }
        };
    }

    toggleSection(groupId, enabled) {
        const container = this.$$(groupId);
        if (enabled) container.enable();
        else container.disable();
    }

    resetForm() {
        const form = this.$$("privacyForm");
        form.setValues({
            account_privacy: "public",
            show_activity: 1,
            personalized_recommendations: 1,
            two_factor: 0,
            two_factor_method: "mobile"
        });
        this.$$("two_factor_method").disable();
        webix.message("Privacy settings reset to default");
    }

    saveSettings() {
        const form = this.$$("privacyForm");
        const values = form.getValues();
        console.log("Saved Privacy Settings:", values);
        webix.message("Privacy settings saved");
    }

    deleteAccount() {
        webix.confirm({
            title: "Delete Account",
            text: "Are you sure you want to delete your account? This action cannot be undone.",
            ok: "Delete",
            cancel: "Cancel"
        }).then(() => {
            webix.message("Account deleted"); // Add actual deletion logic here
        });
    }
}
