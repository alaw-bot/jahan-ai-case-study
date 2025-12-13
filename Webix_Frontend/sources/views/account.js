import {JetView} from "webix-jet";
import * as webix from "webix";
import "../styles/account.css";

export default class SettingsView extends JetView {
    config() {
       
        const countries = [
            { id: "LK", value: "Sri Lanka" },
            { id: "US", value: "United States" },
            { id: "IN", value: "India" }
        ];

        // SECTION 1: PROFILE CONTENT 
        const profileElements = [

            {
                rows: [
                    { view: "label", label: "Profile Settings", css: "section_header" },
                    { view: "label", label: "View and manage your account details", css: "section_subtitle" }
                ]
            },
            { height: 20 },

            {
                cols: [
                    {
                        view: "template",
                        localId: "avatar_preview",
                        borderless: true,
                        width: 180, height: 180,
                        css: "avatar_circle",
                        template: (obj) => {
                            if(obj.src) return `<img src="${obj.src}" class="avatar_img">`;
                            return `<div class="avatar_placeholder">U</div>`;
                        }
                    },
                    { width: 200 },
                    {
                        rows: [
                            {
                                view: "uploader",
                                value: "Edit Photo",
                                localId: "photo_uploader",
                                autosend: false,
                                accept: "image/*",
                                width: 120,
                                css: "webix_primary",
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
                                view: "button",
                                value: "Remove",
                                width: 120,
                                css: "webix_transparent remove_btn",
                                click: () => {
                                    this.$$("avatar_preview").setValues({ src: "" });
                                    webix.message("Photo removed");
                                }
                            }
                        ]
                    }
                ]
            },
            { height: 20 },


            { view: "label", label: "Basic Information", css: "subsection_header" },
            { view: "text", label: "Full Name", name: "fullname", placeholder: "Enter your full name", labelWidth: 150 },
            { view: "combo", label: "Country", name: "country", options: countries, placeholder: "Select country", labelWidth: 150 },
            

            { view: "label", label: "Contact Information", css: "subsection_header" },
            { view: "text", label: "Email", name: "email_contact", placeholder: "email@example.com", labelWidth: 150 },
            { view: "text", label: "Phone Number", name: "phone_contact", placeholder: "+94 77 123 4567", labelWidth: 150 },

            { view: "label", label: "Personal Details", css: "subsection_header" },
            { 
                view: "datepicker", 
                label: "Date of Birth", 
                name: "dob", 
                placeholder: "Select date",
                labelWidth: 150
            },
            { 
                view: "radio", 
                label: "Gender", 
                name: "gender", 
                options: [
                    { id: "Male", value: "Male" },
                    { id: "Female", value: "Female" },
                    { id: "Other", value: "Prefer not to say" }
                ],
                value: "Male",
                labelWidth: 150
            },
            { height: 20 },
            { 
                cols: [
                    {},
                    { 
                        view: "button", 
                        value: "Save Profile Changes", 
                        css: "webix_primary", 
                        width: 200,
                        click: () => webix.message("Profile Saved")
                    }
                ]
            }
        ];

        // SECTION 2: ACCOUNT CONTENT 
        const accountElements = [
            { view: "label", label: "Account Settings", css: "section_header" },
            { height: 15 },
            {
                view: "text",
                label: "Login Email",
                value: "user@example.com",
                readonly: true,
                css: "read_only_field",
                labelWidth: 150
            },
            { height: 10 },
            {
                cols: [
                    { 
                        view: "text", 
                        type: "password", 
                        label: "Current Password", 
                        placeholder: "********", 
                        labelWidth: 150
                    },
                    { width: 15 },
                    { 
                        view: "button", 
                        value: "Change Password", 
                        css: "webix_secondary", 
                        width: 160, 
                        align: "bottom" 
                    }
                ]
            }
        ];

        //MAIN CONFIGURATION 
        return {
            view: "scrollview",
            scroll: "y",
            body: {
                
                cols: [
                    {}, 
                    {
                        view: "form",
                        localId: "mainForm",
                        width: 600, 
                        borderless: true,
                        padding: 0,
                        elementsConfig: {
                            labelPosition: "left", 
                            bottomPadding: 15
                        },
                        elements: [
                       
                            { 
                                view: "label", 
                                label: "Settings", 
                                css: "main_title",
                                height: 50
                            },
                            { height: 10 },
                            
                            
                            ...profileElements,

                            { height: 40 },
                            { view: "template", template: " ", height: 1, css: "separator_line", borderless: true },
                            { height: 40 },

                        
                            ...accountElements,

                            { height: 50 }
                        ]
                    },
                    {}
                ]
            }
        };
    }


}