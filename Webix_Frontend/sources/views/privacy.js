import { JetView } from "webix-jet";
import * as webix from "webix";
import { PrivacyService } from "../services/privacy";

export default class PrivacySettingsView extends JetView {
    STORAGE_KEY = "user_privacy_settings";

    getStorageKey() {
        const userId = webix.storage.local.get("current_user_id");
        return `privacy_settings_${userId}`;
    }

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
                            { template: "Account Privacy", type: "header", css: { "text-align": "left", "font-size": "18px" } },
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
                            { template: "Activity Status", type: "header", css: { "text-align": "left", "font-size": "18px" } },
                            {
                                view: "checkbox",
                                name: "show_activity",
                                label: "Show when you're online",
                                value: 1
                            },

                            { height: 20 },

                            // PERSONALIZED RECOMMENDATIONS
                            {
                                view: "checkbox",
                                name: "personalized_recommendations",
                                label: "Allow personalized recommendations",
                                value: 1
                            },

                            { height: 20 },

                            // TWO-FACTOR AUTHENTICATION
                            { template: "Two-Factor Authentication", type: "header", css: { "text-align": "center", "font-size": "18px" } },
                            {
                                view: "checkbox",
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
                                        width: 140,
                                        css: "webix_danger delete_button_force",
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
        const key = this.getStorageKey();
        const storedData = webix.storage.local.get(key) || webix.storage.local.get(this.STORAGE_KEY);

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
                webix.storage.local.put(this.getStorageKey(), data);
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
                webix.storage.local.put(this.getStorageKey(), values);
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

        webix.storage.local.remove(this.getStorageKey());

        webix.message("Privacy settings reset to default");
    }

    deleteAccount() {
        // First confirmation dialog
        webix.confirm({
            title: "Delete Account",
            text: "Are you sure you want to delete your account? This action cannot be undone.",
            ok: "Continue",
            cancel: "Cancel",
            type: "confirm-error"
        }).then(() => {
            // Show password confirmation window
            this.showPasswordConfirmationWindow();
        });
    }

    showPasswordConfirmationWindow() {
        const togglePasswordVisibility = function () {
            const currentValue = this.getValue();
            const input = this.getInputNode();

            if (!input) return false;

            if (input.type === "password") {
                input.type = "text";
                this.config.type = "text";
                const iconEl = this.$view.querySelector(".webix_input_icon");
                if (iconEl) {
                    iconEl.innerHTML = '<span class="mdi mdi-eye-off"></span>';
                }
                this.define({ type: "text", icon: "mdi mdi-eye-off" });
            } else {
                input.type = "password";
                this.config.type = "password";
                const iconEl = this.$view.querySelector(".webix_input_icon");
                if (iconEl) {
                    iconEl.innerHTML = '<span class="mdi mdi-eye"></span>';
                }
                this.define({ type: "password", icon: "mdi mdi-eye" });
            }

            if (currentValue !== null && currentValue !== undefined) {
                this.setValue(currentValue);
            }

            this.refresh();
            return false;
        };

        if (this._deletePassWindow) {
            this._deletePassWindow.show();
            const form = this._deletePassWindow.getBody();
            form.clear();
            form.clearValidation();

            const passwordField = form.queryView({ localId: "delete_pass_input" });
            if (passwordField) {
                passwordField.setValue("");
                passwordField.define({ type: "password", icon: "mdi mdi-eye" });
                passwordField.refresh();
            }
            return;
        }

        // Create password confirmation
        this._deletePassWindow = this.ui({
            view: "window",
            modal: true,
            position: "center",
            head: "Confirm Password to Delete Account",
            width: 400,
            body: {
                view: "form",
                padding: 20,
                elementsConfig: { labelPosition: "top", bottomPadding: 15 },
                elements: [
                    {
                        view: "template",
                        template: "<div style='color: #d32f2f; font-weight: bold; margin-bottom: 10px;'>⚠️ Warning: This action cannot be undone!</div>",
                        height: 40,
                        borderless: true
                    },
                    {
                        view: "text",
                        type: "password",
                        label: "Enter your password to confirm",
                        name: "password",
                        localId: "delete_pass_input",
                        placeholder: "Enter your current password",
                        required: true,
                        icon: "mdi mdi-eye",
                        iconWidth: 40,
                        validate: (value) => {
                            if (!value || value.trim() === "") {
                                return "Password is required";
                            }
                            if (value.length < 6) {
                                return "Password must be at least 6 characters";
                            }
                            return true;
                        },
                        invalidMessage: "Password is required",
                        on: {
                            onIconClick: togglePasswordVisibility,
                            onAfterRender: function () {
                                const iconEl = this.$view.querySelector(".webix_input_icon");
                                const inputBox = this.$view.querySelector(".webix_el_box");
                                if (iconEl && inputBox) {
                                    iconEl.style.position = "absolute";
                                    iconEl.style.right = "15px";
                                    iconEl.style.top = "50%";
                                    iconEl.style.transform = "translateY(-50%)";
                                    iconEl.style.cursor = "pointer";
                                    iconEl.style.zIndex = "10";
                                    iconEl.onclick = (e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        togglePasswordVisibility.call(this);
                                    };
                                }
                            }
                        }
                    },
                    {
                        margin: 20,
                        cols: [
                            {
                                view: "button",
                                value: "Cancel",
                                click: () => {
                                    this._deletePassWindow.hide();
                                }
                            },
                            {
                                view: "button",
                                value: "Delete Account",
                                css: "webix_danger",
                                click: () => {
                                    const form = this._deletePassWindow.getBody();
                                    const passwordField = form.queryView({ localId: "delete_pass_input" });
                                    const password = passwordField ? passwordField.getValue() : "";

                                    // Validate form
                                    if (!form.validate()) {
                                        webix.message({ type: "error", text: "Please enter your password." });
                                        return;
                                    }

                                    // Validate password is not empty
                                    if (!password || password.trim() === "") {
                                        webix.message({ type: "error", text: "Password cannot be empty." });
                                        return;
                                    }

                                    if (password.length < 6) {
                                        webix.message({ type: "error", text: "Password must be at least 6 characters." });
                                        return;
                                    }

                                    this.performAccountDeletion(password);
                                }
                            }
                        ]
                    }
                ]
            }
        });

        this._deletePassWindow.show();
    }

    performAccountDeletion(password) {
        const token = webix.storage.local.get("token");

        webix.message({ type: "info", text: "Deleting account..." });

        // Send password in request body with DELETE method
        webix.ajax()
            .headers({
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            })
            .del("http://127.0.0.1:8000/api/settings/delete-account/", {
                password: password
            })
            .then((response) => {
                // Close password window
                if (this._deletePassWindow) {
                    this._deletePassWindow.hide();
                }

                // Clear all local storage
                webix.storage.local.remove("token");
                webix.storage.local.remove("current_user_id");
                webix.storage.local.remove(this.getStorageKey());

                webix.message({ type: "success", text: "Account deleted successfully." });

                setTimeout(() => {
                    window.location.href = "#!/login";
                    window.location.reload();
                }, 1000);
            })
            .fail((err) => {
                console.error("Delete failed status:", err.status);
                console.error("Server response:", err.responseText);

                let errorMsg = "Could not delete account.";

                try {
                    const errorData = err.json();
                    if (errorData && errorData.error) {
                        errorMsg = errorData.error;
                    } else if (errorData && errorData.password) {
                        errorMsg = Array.isArray(errorData.password)
                            ? errorData.password[0]
                            : errorData.password;
                    } else if (err.status === 401) {
                        errorMsg = "Invalid password. Please try again.";
                    } else if (err.status === 400) {
                        errorMsg = "Invalid request. Please check your password.";
                    }
                } catch (e) {
                }

                webix.message({ type: "error", text: errorMsg });
            });
    }
}