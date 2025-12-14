import {JetView} from "webix-jet";
import * as webix from "webix";
import "../styles/account.css";

export default class SettingsView extends JetView {
    
    checkPasswordStrength(password) {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
        if (password.match(/\d/)) strength++;
        if (password.match(/[!@#$%^&*(),.?":{}|<>]/)) strength++;

        if (strength === 0 || password.length < 8) return { text: "Too Short", css: "weak" };
        if (strength <= 2) return { text: "Weak", css: "weak" };
        if (strength === 3) return { text: "Medium", css: "medium" };
        if (strength >= 4) return { text: "Strong", css: "strong" };
        return { text: "", css: "" };
    }

    config() {
        const countries = [
            { id: "LK", value: "Sri Lanka" },
            { id: "AU", value: "Australia" },
            { id: "US", value: "United States" },
            { id: "IN", value: "India" },
            { id: "UK", value: "United Kingdom" },
            { id: "CA", value: "Canada" },
            { id: "JP", value: "Japan" },
            { id: "DE", value: "Germany" }
        ];

        const countryCodes = [
            { id: "+94", value: "+94 (LK)" },
            { id: "+61", value: "+61 (AU)" },
            { id: "+1",  value: "+1 (US/CA)" },
            { id: "+91", value: "+91 (IN)" },
            { id: "+44", value: "+44 (UK)" },
            { id: "+81", value: "+81 (JP)" },
            { id: "+49", value: "+49 (DE)" }
        ];

        //SECTION 1: PROFILE INFORMATION
        const profileElements = [
            {
                rows: [
                    { view: "label", label: "Profile Information", css: "section_header", align: "left" },
                    { view: "label", label: "Update your photo and personal details", css: "section_subtitle", align: "left" }
                ]
            },
            { height: 20 },
            {
                cols: [
                    {
                        view: "template", localId: "avatar_preview", borderless: true, width: 100, height: 100, css: "avatar_circle",
                        template: (obj) => {
                            if(obj.src) return `<img src="${obj.src}" class="avatar_img">`;
                            return `<div class="avatar_placeholder">U</div>`;
                        }
                    },
                    { width: 20 },
                    {
                        rows: [
                            {
                                view: "uploader", value: "Upload New Photo", localId: "photo_uploader", autosend: false, accept: "image/*", width: 160, css: "webix_primary",
                                on: {
                                    onBeforeFileAdd: (upload) => {
                                        var reader = new FileReader();
                                        reader.onload = (e) => this.$$("avatar_preview").setValues({ src: e.target.result });
                                        reader.readAsDataURL(upload.file);
                                        return false;
                                    }
                                }
                            },
                            { height: 5 },
                            {
                                view: "button", value: "Remove Photo", width: 160, css: "webix_transparent remove_btn",
                                click: () => {
                                    this.$$("avatar_preview").setValues({ src: "" });
                                    webix.message("Photo removed");
                                }
                            }
                        ]
                    },
                    {} 
                ]
            },
            { height: 20 },

            // 2. Basic Details
            { template: "BASIC INFORMATION", type: "section", align: "left" },
            { view: "text", label: "Username", name: "username", localId: "username", placeholder: "e.g. jdoe123", labelWidth: 150, readonly: true },
            { view: "text", label: "Display Name", name: "display_name", localId: "display_name", placeholder: "e.g. John Doe", labelWidth: 150, readonly: true },
            { view: "textarea", label: "Bio", name: "bio", localId: "bio", height: 100, placeholder: "Tell us a little about yourself...", labelWidth: 150, readonly: true },

            // 3. Contact Info
            { template: "CONTACT INFORMATION", type: "section", align: "left" },
            { view: "text", label: "Email Address", name: "email", localId: "email", placeholder: "user@example.com", labelWidth: 150, readonly: true },
            { view: "combo", label: "Country", name: "country", localId: "country", placeholder: "Select country", labelWidth: 150, disabled: true, suggest: { body: { yCount: 5, autoWidth: false, data: countries } } },
            {
                cols: [
                    { view: "combo", label: "Phone Number", name: "phone_code", localId: "phone_code", placeholder: "Code", labelWidth: 150, width: 260, disabled: true, suggest: { body: { yCount: 5, autoWidth: false, data: countryCodes } } },
                    { width: 10 },
                    { view: "text", name: "phone_number", localId: "phone_number", placeholder: "123 456 7890", fillspace: true, readonly: true }
                ]
            },
            { height: 20 },

            // ACTION BUTTONS
            { 
                cols: [
                    {}, 
                    { view: "button", localId: "btn_edit", value: "Edit Profile", css: "webix_primary", width: 150, click: () => this.toggleEditMode(true) },
                    { view: "button", localId: "btn_cancel", value: "Cancel", width: 100, hidden: true, click: () => this.toggleEditMode(false) },
                    { width: 10 },
                    { view: "button", localId: "btn_save", value: "Save Changes", css: "webix_primary", width: 150, hidden: true, click: () => this.saveProfileChanges() }
                ]
            }
        ];

        //SECTION 2: PASSWORD AND SECURITY
        const securityElements = [
            { template: "PASSWORD & SECURITY", type: "section", align: "left" },
            { view: "button", value: "Change Password", css: "webix_secondary", width: 200, align: "left", click: () => this.showPasswordWindow() }
        ];

        //MAIN CONFIGURATION 
        return {
            view: "scrollview", scroll: "y",
            body: {
                cols: [
                    {}, 
                    {
                        view: "form", localId: "mainForm", width: 900, borderless: true, padding: {top: 20, right: 30, bottom: 20, left: 30},
                        elementsConfig: { labelWidth: 150, bottomPadding: 18 },
                        elements: [
                            { rows:[
                                { template: "Account Settings", type: "header", borderless: true, css: "webix_header_l", align: "left" },
                                { template: "Manage your profile, contact info, and security credentials", height: 35, borderless: true, css: "webix_el_label", style: "color: #888;", align: "left" }
                            ]},
                            { height: 20 },
                            ...profileElements,
                            { height: 40 },
                            { view: "template", template: " ", height: 1, css: "separator_line", borderless: true },
                            { height: 40 },
                            ...securityElements,
                            { height: 50 }
                        ]
                    },
                    {} 
                ]
            }
        };
    }

    //API Load Method 
    loadProfileData() {
        webix.ajax().get("http://127.0.0.1:8000/api/settings/profile/").then(response => {
            const data = response.json();
            
            if (!data || !data.username) {
                webix.message({type: "error", text: "Invalid or empty data received from the server."});
                return;
            }

            this.$$("mainForm").setValues({
                username: data.username,
                email: data.email, 
                display_name: data.display_name,
                bio: data.bio,
                country: data.country,
                phone_code: data.phone_code,
                phone_number: data.phone_number
            });

            if (data.avatar) {
                 this.$$("avatar_preview").setValues({ src: data.avatar });
            }
            webix.message("Profile data loaded.");
        }).fail(error => {
            webix.message({type: "error", text: "Failed to connect to Django (Port 8000)."});
            console.error("API Error:", error);
        });
    }

    //API Save
    saveProfileChanges() {
        const form = this.$$("mainForm");
        const values = form.getValues();
        
        const payload = {
            user: { username: values.username },
            display_name: values.display_name,
            bio: values.bio,
            country: values.country,
            phone_code: values.phone_code,
            phone_number: values.phone_number
        };

        webix.ajax().put("http://127.0.0.1:8000/api/settings/profile/", payload).then(response => {
            webix.message({ type: "success", text: "Profile Updated Successfully!" });
            this.toggleEditMode(false); 
        }).fail(error => {
            webix.message({ type: "error", text: "Profile update failed." });
            console.error("API Save Error:", error);
        });
    }

    toggleEditMode(enable) {
        const textFields = ["username", "display_name", "bio", "email", "phone_number"];
        const comboFields = ["country", "phone_code"];

        textFields.forEach(id => {
            const field = this.$$(id);
            if(field) {
                if(enable) {
                    field.define("readonly", false);
                    field.getInputNode().style.cursor = "text"; 
                    field.getInputNode().style.backgroundColor = "#fff";
                } else {
                    field.define("readonly", true);
                    field.getInputNode().style.cursor = "not-allowed"; 
                    field.getInputNode().style.backgroundColor = "#fafafa";
                }
                field.refresh();
            }
        });

        comboFields.forEach(id => {
            const field = this.$$(id);
            if(field) {
                if (enable) field.enable();
                else field.disable();
            }
        });

        if (enable) {
            this.$$("btn_edit").hide();
            this.$$("btn_save").show();
            this.$$("btn_cancel").show();
        } else {
            this.$$("btn_edit").show();
            this.$$("btn_save").hide();
            this.$$("btn_cancel").hide();
        }
    }

    showPasswordWindow() {
        const win = webix.ui({
            view: "window", modal: true, position: "center", head: "Change Password", width: 400,
            body: {
                view: "form", localId: "passwordForm", padding: 20,
                elementsConfig: { labelPosition: "top", bottomPadding: 15 },
                elements: [
                    { view: "text", type: "password", label: "Old Password", name: "old_pass", placeholder: "Enter current password", required: true },
                    { 
                        view: "text", type: "password", label: "New Password", name: "new_pass", placeholder: "Enter new password", required: true,
                        on: {
                            onKeyup: (code, event) => {
                                const password = this.$$("new_pass_input").getValue();
                                const strength = this.checkPasswordStrength(password);
                                const meter = webix.$$("strength_meter_modal"); 
                                if (meter) meter.setHTML(`<div class="strength_bar ${strength.css}"></div><div class="strength_text ${strength.css}">${strength.text}</div>`);
                            }
                        },
                        localId: "new_pass_input"
                    },
                    { view: "template", localId: "strength_meter_modal", height: 20, borderless: true, css: "strength_container" },
                    { view: "text", type: "password", label: "Confirm Password", name: "confirm_pass", placeholder: "Re-enter new password", required: true },
                    { margin: 10, cols: [
                        { view: "button", value: "Cancel", click: function(){ this.getTopParentView().close(); }},
                        { 
                            view: "button", value: "Save", css: "webix_primary", 
                            click: function() {
                                const form = this.getFormView();
                                const rootViewScope = this.$scope.getParentView().$scope;
                                const values = form.getValues();
                                
                                if (!form.validate()) { webix.message({ type: "error", text: "Please fill all required fields." }); return; }
                                if (values.new_pass !== values.confirm_pass) { webix.message({ type: "error", text: "New passwords do not match!" }); return; }
                                if (rootViewScope.checkPasswordStrength(values.new_pass).css === "weak") { webix.message({ type: "error", text: "Password is too weak." }); return; }
                                const changePasswordPayload = { old_password: values.old_pass, new_password: values.new_pass };
                                webix.ajax().put("http://127.0.0.1:8000/api/settings/change-password/", changePasswordPayload).then(response => {
                                    webix.message({ type:"success", text: "Password Changed Successfully" });
                                    this.getTopParentView().close();
                                }).fail(error => {
                                    let errorMsg = "Password change failed.";
                                    if (error.json() && error.json().error) errorMsg = error.json().error;
                                    webix.message({ type: "error", text: errorMsg });
                                });
                            }
                        }
                    ]}
                ]
            }
        });
        win.show();
    }

    ready(){
        this.toggleEditMode(false);
        this.loadProfileData(); 
    }
}