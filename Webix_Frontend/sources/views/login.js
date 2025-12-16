import {JetView} from "webix-jet";
import * as webix from "webix";
import "../styles/login.css"; 

export default class LoginView extends JetView {

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
        const loginForm = {
            view: "form", localId: "loginForm",
            padding: 0, borderless: true,
            rules: { "username": webix.rules.isNotEmpty, "password": webix.rules.isNotEmpty },
            elements: [
                { template: "<span class='header_title'>Sign in</span>", height: 50, borderless: true },
                { template: "<span class='sub_title'>Welcome back to MyApp</span>", height: 30, borderless: true },
                { height: 30 },
                { 
                    view: "text", label: "Username or Email", name: "username", 
                    labelPosition: "top", placeholder: "Enter your username", 
                    invalidMessage: "Required", css: "modern_input", height: 90 
                },
                { 
                    view: "text", type: "password", label: "Password", name: "password", 
                    labelPosition: "top", placeholder: "••••••••", 
                    invalidMessage: "Required", css: "modern_input", height: 90 
                },
                { template: "<a href='#' class='forgot_link'>Forgot password?</a>", height: 20, borderless: true, css: "text_right" },
                { height: 20 },
                { view: "button", value: "Sign in", css: "webix_primary teal_button", height: 50, click: () => this.doLogin() },
                { height: 20 },
                { template: "Don't have an account? <span class='switch_link'>Create now</span>", height: 30, borderless: true, css: "text_center switch_text", onClick: { "switch_link": () => this.toggleForm("register") } }
            ]
        };

        const registerForm = {
            view: "form", localId: "registerForm",
            hidden: true, padding: 0, borderless: true,
            rules: { "username": webix.rules.isNotEmpty, "email": webix.rules.isEmail, "password": webix.rules.isNotEmpty, "confirm_password": webix.rules.isNotEmpty },
            elements: [
                { template: "<span class='header_title'>Create Account</span>", height: 50, borderless: true },
                { template: "<span class='sub_title'>Start your journey with us</span>", height: 30, borderless: true },
                { height: 20 },
                { view: "text", label: "Username", name: "username", labelPosition: "top", placeholder: "Choose a username", invalidMessage: "Required", css: "modern_input", height: 90 },
                { view: "text", label: "Email", name: "email", labelPosition: "top", placeholder: "name@company.com", invalidMessage: "Invalid Email", css: "modern_input", height: 90 },
                { 
                    view: "text", type: "password", label: "Password", name: "password", labelPosition: "top", placeholder: "Strong password", invalidMessage: "Required", css: "modern_input", height: 90,
                    localId: "reg_pass",
                    on: { onTimedKeyPress: () => { 
                        const form = this.$$("registerForm"); const val = form.queryView({ localId: "reg_pass" }).getValue(); 
                        const strength = this.checkPasswordStrength(val); const reqsHTML = this.getRequirementsHTML(val); 
                        const html = `<div class="strength_text ${strength.css}">${strength.text}</div><div class="strength_bar ${strength.css}"></div>${reqsHTML}`; 
                        const feedback = form.queryView({ localId: "reg_feedback" }); if(feedback) feedback.setHTML(html); 
                    } }
                },
                { view: "template", localId: "reg_feedback", height: 90, borderless: true, css: "strength_container", template: "" },
                { view: "text", type: "password", label: "Confirm Password", name: "confirm_password", labelPosition: "top", placeholder: "Repeat password", invalidMessage: "Required", css: "modern_input", height: 90 },
                { height: 10 },
                { view: "button", value: "Register", css: "webix_primary teal_button", height: 50, click: () => this.doRegister() },
                { height: 20 },
                { template: "Already have an account? <span class='switch_link'>Sign in</span>", height: 30, borderless: true, css: "text_center switch_text", onClick: { "switch_link": () => this.toggleForm("login") } }
            ]
        };


        return {
            css: "login_page_bg",
            cols: [
                {
                    css: "left_panel_white",
                    gravity: 0.8,
                    rows: [
                        {}, 
                        {
                            cols: [
                                {}, 
                                {
                                    width: 420, 
                                    rows: [
                                        { template: "<span class='brand_logo'>@MyApp</span>", height: 60, borderless: true },
                                        loginForm,
                                        registerForm
                                    ]
                                },
                                {} 
                            ]
                        },
                        {} 
                    ]
                },
                {
                    css: "right_panel_teal",
                    template: `
                        <div class="promo_container_full">
                            <div class="promo_content_centered">
                                <h2 class="promo_header_large">Reach your financial goals.</h2>
                                <p class="promo_text_large">
                                    Manage your income, track expenses, and save for the future with our intuitive tools.
                                </p>
                                <div class="glass_card_large">
                                    <div class="card_icon"></div>
                                    <span>Total Balance</span>
                                    <h3>$14,290.40</h3>
                                    <div class="card_chip">•••• 4829</div>
                                </div>
                            </div>
                        </div>
                    `
                }
            ]
        };
    }

    init(){ this.getRoot().show(); }

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
            
            webix.ajax()
                .headers({ "Content-Type": "application/json" })
                .post("http://127.0.0.1:8000/api/settings/login/", JSON.stringify(data))
                .then((res) => {
                    const result = res.json();
                    webix.storage.local.put("token", result.access); 

                    let userId = "guest";
                    if (result.user_id) userId = result.user_id;
                    else if (result.username) userId = result.username.toLowerCase();
                    else userId = data.username.toLowerCase();

                    webix.storage.local.put("current_user_id", userId);
                    webix.message({ type: "success", text: "Login Successful" });

                    window.location.href = "#!/settings/account";
                    window.location.reload(); 
                })
                .catch((err) => {
                    let msg = "Invalid Username or Password";
                    try {
                        if (err.response) {
                            const json = JSON.parse(err.response);
                            if (json.detail) msg = json.detail;
                        }
                    } catch(e) {}
                    
                    webix.alert({
                        type: "alert-error",
                        title: "Login Failed",
                        text: msg,
                        ok: "Try Again"
                    });
                });
        }
    }

    doRegister() { 
        const form = this.$$("registerForm");
        if (form.validate()) {
            const data = form.getValues();
            if(data.password !== data.confirm_password){ 
                webix.alert({ type:"alert-error", title: "Error", text: "Passwords do not match" }); 
                return; 
            }
            if (this.checkPasswordStrength(data.password).css === "weak") { 
                webix.alert({ type: "alert-error", title: "Weak Password", text: "Password is too weak." }); 
                return; 
            }
            
            webix.ajax()
                .headers({ "Content-Type": "application/json" })
                .post("http://127.0.0.1:8000/api/settings/register/", JSON.stringify(data))
                .then(() => {
                    webix.alert({ 
                        title: "Success", 
                        text: "Registration Successful! Please Login.", 
                        type: "alert-success",
                        callback: () => {
                            this.$$("loginForm").show();
                            this.$$("registerForm").hide();
                            form.clear();
                            this.$$("reg_feedback").setHTML(""); 
                        }
                    });
                })
                .fail((err) => {
                    let response = {};
                    try { response = JSON.parse(err.response); } catch(e) { console.error(err); }

                    let msg = "Registration Failed";
                    if(response.username) msg = response.username[0];
                    else if(response.email) msg = response.email[0];
                    else if(response.detail) msg = response.detail;
                    
                    webix.alert({
                        type: "alert-error",
                        title: "Registration Error",
                        text: msg,
                        ok: "Close"
                    });
                });
        }
    }
}