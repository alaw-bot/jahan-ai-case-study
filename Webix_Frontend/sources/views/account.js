import {JetView} from "webix-jet";
import * as webix from "webix";

export default class AccountView extends JetView {
    config() {
        return {
            view: "form",
            localId: "accForm",
            scroll: true,
            padding: 20,
            elements: [
                //SECTION 1: PROFILE PICTURE
                {
                    cols: [
                        { 
                            view: "template", 
                            localId: "avatar_preview",
                            borderless: true,
                            css: "avatar_container",
                            width: 120, height: 120,
                       
                            template: (obj) => `<img src="${obj.src || 'https://docs.webix.com/samples/20_multiview/images/avatar.png'}" style="width:100px; height:100px; border-radius:50%; object-fit:cover;">`
                        },
                        {
                            rows: [
                                {},
                                { 
                                    view: "uploader", 
                                    value: "Upload New Photo", 
                                    autosend: false, 
                                    accept: "image/png, image/gif, image/jpeg",
                                    multiple: false,
                                    css: "webix_primary",
                                    on: {
                                        onBeforeFileAdd: (upload) => {
                                            
                                            var reader = new FileReader();
                                            reader.onload = (event) => {
                                                this.$$("avatar_preview").setValues({ src: event.target.result });
                                            };
                                            reader.readAsDataURL(upload.file);
                                            return false;
                                        }
                                    }
                                },
                                { view: "label", label: "Allowed: JPG, GIF or PNG. Max size of 800K", css: "webix_el_label" },
                                {}
                            ]
                        }
                    ]
                },
                
                //SECTION 2: PERSONAL INFO 
                { view: "fieldset", label: "Personal Information", body: {
                    rows: [
                        {
                            cols: [
                                { view: "text", label: "Full Name", name: "fullname", labelPosition: "top", invalidMessage: "Name is required" },
                                { view: "text", label: "Job Title", name: "job", labelPosition: "top" }
                            ]
                        },
                        {
                            cols: [
                                { view: "text", label: "Phone", name: "phone", labelPosition: "top" },
                                { view: "text", label: "Location", name: "address", labelPosition: "top" }
                            ]
                        },
                        { view: "text", label: "Email Address", name: "email", labelPosition: "top", invalidMessage: "Invalid Email" },
                        { view: "textarea", label: "Bio / About Me", name: "bio", height: 100, labelPosition: "top" }
                    ]
                }},

                //SECTION 3: CHANGE PASSWORD
                { view: "fieldset", label: "Change Password", body: {
                    rows: [
                        { view: "text", type: "password", label: "Current Password", name: "old_pass", labelWidth: 150 },
                        { view: "text", type: "password", label: "New Password", name: "new_pass", labelWidth: 150 },
                        { view: "text", type: "password", label: "Confirm Password", name: "confirm_pass", labelWidth: 150, invalidMessage: "Passwords must match" }
                    ]
                }},

   
                { margin: 20, cols: [
                    { view: "button", value: "Save Changes", css: "webix_primary", width: 150, click: () => this.save() },
                    {}
                ]}
            ],

            rules: {
                "fullname": webix.rules.isNotEmpty,
                "email": webix.rules.isEmail,
                "confirm_pass": function(value, obj) {

                    if (obj.new_pass && value !== obj.new_pass) return false;
                    return true;
                }
            }
        };
    }

    init(){
        // Pre-load some dummy data (simulate fetching from server)
        this.$$("accForm").setValues({
            fullname: "Jahan AI User",
            email: "user@jahan.ai",
            job: "Software Engineer",
            src: "" 
        });
    }

    save(){
        const form = this.$$("accForm");
        if(form.validate()){
            const data = form.getValues();
          
            webix.message({ type:"success", text:"Profile updated successfully!" });
            
          
            console.log("Saving User Data:", data);
        } else {
            webix.message({ type:"error", text:"Please check the form for errors" });
        }
    }
}