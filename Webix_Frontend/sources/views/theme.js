import {JetView} from "webix-jet";

export default class ThemeView extends JetView {
    config() {
        return {
            view: "form",
            scroll: true,
            elements: [
                { template: "Look & Feel", type: "section" },
                { 
                    view: "segmented", label: "Density", labelPosition: "top", 
                    options: ["Compact", "Comfortable"], value: "Comfortable" 
                },
                { view: "colorpicker", label: "Accent Color", value: "#3498db" },
                { view: "button", value: "Apply", css: "webix_primary", click: () => webix.message("Applied") }
            ]
        };
    }
}