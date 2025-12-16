import {JetView} from "webix-jet";
import * as webix from "webix";

export default class LoginView extends JetView {

    // 1. Helper: Calculate Score
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

    // 2. Helper: Generate Recommendation HTML
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
        const loginForm = {
            view: "form", localId: "loginForm",
            rules: {
                "username": webix.rules.isNotEmpty,
                "password": webix.rules.isNotEmpty
            },
            elements: [
                { view: "text", label: "Username", name: "username", invalidMessage: "Username is required", labelWidth: 100 },
                { view: "text", type: "password", label: "Password", name: "password", invalidMessage: "Password is required", labelWidth: 100 },
                { margin: 10, cols: [
                    { view: "button", value: "Login", css: "webix_primary", click: () => this.doLogin() }
                ]}
            ]
        };

        const registerForm = {
            view: "form", localId: "registerForm",
            hidden: true, 
            rules: {
                "username": webix.rules.isNotEmpty,
                "email": webix.rules.isEmail,
                "password": webix.rules.isNotEmpty,
                "confirm_password": webix.rules.isNotEmpty
            },
            elements: [
                { view: "text", label: "Username", name: "username", invalidMessage: "Required", labelWidth: 120 },
                { view: "text", label: "Email", name: "email", invalidMessage: "Invalid Email", labelWidth: 120 },
                { 
                    view: "text", type: "password", label: "Password", name: "password", invalidMessage: "Required", labelWidth: 120,
                    localId: "reg_pass",
                    on: {
                        onTimedKeyPress: () => {
                            const form = this.$$("registerForm");
                            const val = form.queryView({ localId: "reg_pass" }).getValue();

                            const strength = this.checkPasswordStrength(val);
                            const reqsHTML = this.getRequirementsHTML(val);

                            const html = `
                                <div class="strength_text ${strength.css}">${strength.text}</div>
                                <div class="strength_bar ${strength.css}"></div>
                                ${reqsHTML}
                            `;
                            const feedback = form.queryView({ localId: "reg_feedback" });
                            if(feedback) feedback.setHTML(html);
                        }
                    }
                },
                { view: "template", localId: "reg_feedback", height: 60, borderless: true, css: "strength_container", template: "" },
                { view: "text", type: "password", label: "Confirm Password", name: "confirm_password", invalidMessage: "Required", labelWidth: 120 },
                { margin: 10, cols: [
                    { view: "button", value: "Register", css: "webix_primary", click: () => this.doRegister() }
                ]}
            ]
        };

        return {
            view: "window",
            modal: true,
            position: "center",
            width: 400,
            head: {
                view: "toolbar", cols: [
                    { view: "label", label: "Welcome" },
                    { view: "segmented", width: 200, options: [
                        { id: "login", value: "Login" },
                        { id: "register", value: "Sign Up" }
                    ], on: {
                        onChange: (id) => this.toggleForm(id)
                    }}
                ]
            },
            body: {
                rows: [
                    loginForm,
                    registerForm
                ]
            }
        };
    }

    init(){
        this.getRoot().show();
    }

    toggleForm(mode) {
        if (mode === "login") {
            this.$$("loginForm").show();
            this.$$("registerForm").hide();
        } else {
            this.$$("loginForm").hide();
            this.$$("registerForm").show();
        }
    }

    doLogin() {
        const form = this.$$("loginForm");
        if (form.validate()) {
            const data = form.getValues();
            
            webix.ajax().post("http://127.0.0.1:8000/api/settings/login/", data)
            .then((res) => {
                const result = res.json();
                webix.storage.local.put("token", result.access); 
                let userId = "guest";

                if (result.user_id) {
                    userId = result.user_id;
                } else if (result.username) {
                    userId = result.username.toLowerCase();
                } else {
                    userId = data.username.toLowerCase();
                }

                webix.storage.local.put("current_user_id", userId);
                
                console.log("Saving Settings for User ID:", userId);

                webix.message({ type: "success", text: "Login Successful" });
                this.getRoot().close();

                window.location.href = "#!/settings/account";
                window.location.reload(); 
            })
            .catch((err) => {
                console.error("Login Error:", err);
                webix.message({ type: "error", text: "Invalid Username or Password" });
            });
        }
    }
    doRegister() {
        const form = this.$$("registerForm");
        if (form.validate()) {
            const data = form.getValues();
            if(data.password !== data.confirm_password){
                webix.message({type:"error", text: "Passwords do not match"});
                return;
            }
            if (this.checkPasswordStrength(data.password).css === "weak") { 
                webix.message({ type: "error", text: "Password is too weak." }); 
                return; 
            }

            webix.ajax().post("http://127.0.0.1:8000/api/settings/register/", data).then(() => {
                webix.message({ type: "success", text: "Registration Successful! Please Login." });
                this.$$("loginForm").show();
                this.$$("registerForm").hide();
                form.clear();
                this.$$("reg_feedback").setHTML(""); 
            }).fail((err) => {
                const response = err.json();
                let msg = "Registration Failed";
                if(response.username) msg = "Username: " + response.username[0];
                else if(response.email) msg = "Email: " + response.email[0];
                
                webix.message({ type: "error", text: msg });
            });
        }
    }
}