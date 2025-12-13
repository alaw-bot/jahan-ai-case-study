import {JetView} from "webix-jet";

export default class PrivacyView extends JetView {
    config() {
        return {
            view: "form",
            scroll: true,
            elements: [
                { template: "Data Control", type: "section" },
                { 
                    view: "radio", label: "Visibility", labelPosition: "top", 
                    options: ["Public", "Private"], value: "private" 
                },
                { view: "button", value: "Update", css: "webix_primary", click: () => webix.message("Updated") }
            ]
        };
    }
}