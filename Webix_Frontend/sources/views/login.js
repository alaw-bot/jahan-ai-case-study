import {JetView} from "webix-jet";
import * as webix from "webix";

export default class LoginView extends JetView {
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
                { view: "text", type: "password", label: "Password", name: "password", invalidMessage: "Required", labelWidth: 120 },
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
                webix.message({ type: "success", text: "Login Successful" });
                this.getRoot().close();

                try {
                    this.app.show("/settings/account"); 
                } catch(e) {
                    console.error("Navigation Error:", e);
                    webix.message({ type:"error", text: "Login worked, but could not load Settings page." });
                }
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

            webix.ajax().post("http://127.0.0.1:8000/api/settings/register/", data).then(() => {
                webix.message({ type: "success", text: "Registration Successful! Please Login." });
                this.$$("loginForm").show();
                this.$$("registerForm").hide();
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