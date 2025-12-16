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

    getRequirementsHTML(password) {
        const checks = [
            { label: "8+ Chars", valid: password.length >= 8 },
            { label: "Upper & Lower", valid: /[a-z]/.test(password) && /[A-Z]/.test(password) },
            { label: "Number", valid: /\d/.test(password) },
            { label: "Symbol", valid: /[!@#$%^&*(),.?":{}|<>]/.test(password) }
        ];

        let html = `<div class="pass_reqs">`;
        checks.forEach(c => {
            const icon = c.valid ? "✔" : "○";
            const css = c.valid ? "req_item done" : "req_item missing";
            html += `<span class="${css}">${icon} ${c.label}</span>`;
        });
        html += `</div>`;
        return html;
    }

    config() {
        const countries = [
            { id: "LK", value: "Sri Lanka" }, { id: "AU", value: "Australia" },
            { id: "US", value: "United States" }, { id: "IN", value: "India" },
            { id: "UK", value: "United Kingdom" }, { id: "CA", value: "Canada" },
            { id: "JP", value: "Japan" }, { id: "DE", value: "Germany" }
        ];

        const countryCodes = [
            { id: "+94", value: "+94 (LK)" }, { id: "+61", value: "+61 (AU)" },
            { id: "+1",  value: "+1 (US/CA)" }, { id: "+91", value: "+91 (IN)" },
            { id: "+44", value: "+44 (UK)" }, { id: "+81", value: "+81 (JP)" },
            { id: "+49", value: "+49 (DE)" }
        ];

        const genderOptions = [
            { id: "Male", value: "Male" }, { id: "Female", value: "Female" },
            { id: "Other", value: "Other" }, { id: "Prefer not to say", value: "Prefer not to say" }
        ];

        const profileElements = [
            {
                cols: [
                    {
                        view: "template", 
                        localId: "avatar_preview", 
                        borderless: true, 
                        width: 100, 
                        height: 100, 
                        css: "avatar_circle",
                        padding: 0, 
                        template: (obj) => {
                            if(obj.src) return `<img src="${obj.src}" class="avatar_img">`;
                            return `<div class="avatar_placeholder">U</div>`;
                        }
                    },
                    { width: 60 },
                    {
                        rows: [
                            {
                                view: "uploader", 
                                value: "Upload New Photo", 
                                localId: "photo_uploader", 
                                autosend: false, 
                                name: "upload", 
                                accept: "image/*", 
                                width: 160, 
                                css: "webix_primary",
                                on: {
                                    onAfterFileAdd: function(item){
                                        const file = item.file;
                                        const token = webix.storage.local.get("token"); 

                                        const formData = new FormData();
                                        formData.append("upload", file);

                                        webix.ajax()
                                            .headers({ "Authorization": "Bearer " + token }) 
                                            .post("http://127.0.0.1:8000/api/settings/avatar-upload/", formData)
                                            .then((res) => {
                                                const response = res.json();
                                                if (response && response.url) {
                                                    let fullUrl = response.url;
                                                    if (!fullUrl.startsWith("http")) {
                                                        fullUrl = "http://127.0.0.1:8000" + fullUrl;
                                                    }
                                                    this.$scope.$$("avatar_preview").setValues({ src: fullUrl });
                                                    webix.message({type:"success", text: "Photo saved!"});
                                                }
                                            })
                                            .fail((err) => {
                                                console.error("Upload Error:", err);
                                                webix.message({type:"error", text: "Upload failed. Please login again."});
                                            });
                                        return false; 
                                    }
                                }
                            },
                            { height: 5 },
                            {
                                view: "button", 
                                value: "Remove Photo", 
                                width: 160, 
                                css: "webix_danger delete_button_force",
                                click: () => {
                                    webix.confirm({
                                        title: "Remove Photo",
                                        text: "Are you sure you want to remove your profile photo?",
                                        ok: "Remove",
                                        cancel: "Cancel",
                                        type: "confirm-error"
                                    }).then(() => {
                                        this.$$("avatar_preview").setValues({ src: "" });
                                        webix.message("Photo removed");
                                    });
                                }
                            }
                        ]
                    },
                    {}
                ]
            },
            { height: 20 },

            // 2. Basic Details
            { template: "BASIC INFORMATION", type: "header", align: "left", },
            
            { 
                view: "text", 
                label: "Username", 
                name: "username", 
                localId: "username", 
                placeholder: "e.g. jdoe123", 
                labelWidth: 150, 
                fillspace: true,
                readonly: true, 
                inputAlign: "left",
                css: "readonly_field" 
            },
        
            { 
                view: "text", 
                label: "Display Name", 
                name: "display_name", 
                localId: "display_name", 
                placeholder: "e.g. John Doe", 
                labelWidth: 150, 
                fillspace: true, 
                readonly: true,
                validate: (value) => /^[a-zA-Z\s]*$/.test(value), 
                invalidMessage: "Name must contain letters only",
                on: { onTimedKeyPress: function() { this.validate(); } }
            },
            
            { 
                view: "datepicker", label: "Date of Birth", name: "dob", localId: "dob", 
                placeholder: "Select Date", labelWidth: 150, disabled: true, 
                fillspace: true, 
                stringResult: true, format: "%Y-%m-%d" 
            },
            
            { 
                view: "radio", label: "Gender", name: "gender", localId: "gender", 
                labelWidth: 150, disabled: true, 
                options: genderOptions,
                customRadio: false
            },

            { 
                view: "textarea", label: "Bio", name: "bio", localId: "bio", 
                height: 100, placeholder: "Tell us a little about yourself...", 
                labelWidth: 150, readonly: true,
                fillspace: true 
            },

            // 3. Contact Info 
            { template: "CONTACT INFORMATION", type: "header", align: "left" },
            
            { 
                view: "text", label: "Email Address", name: "email", localId: "email", 
                placeholder: "user@example.com", labelWidth: 150, readonly: true,
                fillspace: true, 
                validate: webix.rules.isEmail, invalidMessage: "Invalid email format",
                on: { onTimedKeyPress: function() { this.validate(); } }
            },
            
            { 
                view: "combo", label: "Country", name: "country", localId: "country", 
                placeholder: "Select country", labelWidth: 150, disabled: true, 
                fillspace: true, 
                suggest: { body: { yCount: 5, autoWidth: true, data: countries } } 
            },
            {
                cols: [
                    { 
                        view: "combo", label: "Phone Number", name: "phone_code", localId: "phone_code", 
                        placeholder: "Code", labelWidth: 150, width: 260, disabled: true, 
                        suggest: { body: { yCount: 5, autoWidth: false, data: countryCodes } } 
                    },
                    { width: 10 },
                    { 
                        view: "text", name: "phone_number", localId: "phone_number", 
                        placeholder: "1234567890", fillspace: true, readonly: true,
                        validate: (value) => /^\d*$/.test(value), invalidMessage: "Numbers only",
                        on: { onTimedKeyPress: function() { this.validate(); } }
                    }
                ]
            },
            { height: 20 },

            // ACTION BUTTONS
            { 
                cols: [
                    { view: "button", localId: "btn_edit", value: "Edit Profile", css: "webix_primary", width: 150, click: () => this.toggleEditMode(true) },
                    { view: "button", localId: "btn_cancel", value: "Cancel", width: 100, hidden: true, click: () => this.toggleEditMode(false) },
                    { width: 10 },
                    { view: "button", localId: "btn_save", value: "Save Changes", css: "webix_primary", width: 150, hidden: true, click: () => this.saveProfileChanges() },
                    {} 
                ]
            }
        ];
        
        const securityElements = [
            { template: "PASSWORD & SECURITY", type: "header", align: "left" },
            { 
                cols: [
                    { view: "button", value: "Change Password", css: "webix_primary", width: 200, align: "left", click: () => this.showPasswordWindow() },
                    {} 
                ]
            }
        ];

        // MAIN CONFIGURATION 
        return {
            view: "scrollview", scroll: "y",
            body: {
                view: "form", 
                localId: "mainForm", 
                borderless: true, 
                padding: {top: 20, right: 30, bottom: 20, left: 30},
                elementsConfig: { labelWidth: 150, bottomPadding: 18 },
                
                elements: [
                    { rows:[
                        { template: "Account Settings", type: "header", borderless: true, css: "webix_header_l", align: "left" },
                        { template: "Manage your profile, contact info, and security credentials", height: 35, borderless: true, css: "webix_el_label", style: "color: #888;", align: "left" }
                    ]},
                    { height: 20 },
                    ...profileElements,
                    { height: 10 },
                    ...securityElements,
                    { height: 20 }
                ]
            }
        };
    }

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
                dob: data.dob,       
                gender: data.gender, 
                bio: data.bio,
                country: data.country,
                phone_code: data.phone_code,
                phone_number: data.phone_number
            });

            if (data.avatar) {
                 let avatarUrl = data.avatar;
                 if (!avatarUrl.startsWith("http")) {
                     avatarUrl = "http://127.0.0.1:8000" + avatarUrl;
                 }
                 this.$$("avatar_preview").setValues({ src: avatarUrl });
            }
            webix.message("Profile data loaded.");
        }).fail(error => {
            webix.message({type: "error", text: "Failed to connect to Django (Port 8000)."});
            console.error("API Error:", error);
        });
    }

    saveProfileChanges() {
        const form = this.$$("mainForm");
        
        if (!form.validate()) {
            webix.message({ type: "error", text: "Please fix the validation errors." });
            return;
        }

        const values = form.getValues();
        
        const payload = {
            user: { username: values.username },
            display_name: values.display_name,
            dob: values.dob,
            gender: values.gender,
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
        const textFields = ["display_name", "bio", "email", "phone_number"];
        const comboFields = ["country", "phone_code", "dob", "gender"];

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
                    field.validate(); 
                }
                field.refresh();
            }
        });

        if(!enable) {
            this.$$("mainForm").clearValidation();
        }

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
        if (this._passWindow) {
            this._passWindow.show();
            const form = this._passWindow.getBody();
            form.clear();
            form.clearValidation();

            const meter = this._passWindow.getBody().queryView({ localId: "password_feedback" });
            if(meter) meter.setHTML(""); 
            return;
        }

        this._passWindow = this.ui({
            view: "window", 
            modal: true, 
            position: "center", 
            head: "Change Password", 
            width: 400,
            body: {
                view: "form", 
                padding: 20,
                elementsConfig: { labelPosition: "top", bottomPadding: 15 },
                elements: [
                    { view: "text", type: "password", label: "Old Password", name: "old_pass", placeholder: "Enter current password", required: true },
                    
                    { 
                        view: "text", type: "password", label: "New Password", name: "new_pass", placeholder: "Enter new password", required: true,
                        localId: "new_pass_input",
                        on: {
                            onTimedKeyPress: () => {
                                const form = this._passWindow.getBody();
                                const val = form.queryView({ localId: "new_pass_input" }).getValue();
                                
                                const strength = this.checkPasswordStrength(val);
                                const reqsHTML = this.getRequirementsHTML(val);

                                const html = `
                                    <div class="strength_text ${strength.css}">${strength.text}</div>
                                    <div class="strength_bar ${strength.css}"></div>
                                    ${reqsHTML}
                                `;

                                const feedbackView = form.queryView({ localId: "password_feedback" });
                                if (feedbackView) feedbackView.setHTML(html);
                            }
                        }
                    },

                    { view: "template", localId: "password_feedback", height: 60, borderless: true, css: "strength_container", template: "" },

                    { view: "text", type: "password", label: "Confirm Password", name: "confirm_pass", placeholder: "Re-enter new password", required: true },
                    
                    { 
                        margin: 20, 
                        cols: [
                            { 
                                view: "button", value: "Cancel", 
                                click: () => {
                                    this._passWindow.hide();
                                } 
                            },
                            { 
                                view: "button", value: "Save", css: "webix_primary", 
                                click: () => {
                                    const form = this._passWindow.getBody();
                                    const values = form.getValues();
                                    
                                    if (!form.validate()) { webix.message({ type: "error", text: "Please fill all required fields." }); return; }
                                    if (values.new_pass !== values.confirm_pass) { webix.message({ type: "error", text: "New passwords do not match!" }); return; }
                                    if (this.checkPasswordStrength(values.new_pass).css === "weak") { webix.message({ type: "error", text: "Password is too weak." }); return; }
                                    
                                    const changePasswordPayload = { old_password: values.old_pass, new_password: values.new_pass };
                                    
                                    webix.ajax().put("http://127.0.0.1:8000/api/settings/change-password/", changePasswordPayload).then(response => {
                                        webix.message({ type:"success", text: "Password Changed Successfully" });
                                        this._passWindow.hide(); 
                                    }).fail(error => {
                                        let errorMsg = "Password change failed.";
                                        if (error.json() && error.json().error) errorMsg = error.json().error;
                                        webix.message({ type: "error", text: errorMsg });
                                    });
                                }
                            }
                        ]
                    }
                ]
            }
        });

        this._passWindow.show();
    }

    ready(){
        this.toggleEditMode(false);
        this.loadProfileData(); 
    }
}