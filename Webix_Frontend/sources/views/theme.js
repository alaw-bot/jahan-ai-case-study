import {JetView} from "webix-jet";

export default class ThemeSettingsView extends JetView {
    config() {
        return {
            view: "scrollview",
            localId: "theme_scrollview",
            scroll: "y",
            body: {
                cols: [
                    {},
                    {
                        view: "form",
                        localId: "themeForm",
                        width: 600,
                        borderless: true,
                        elementsConfig: {
                            labelWidth: 220,
                            bottomPadding: 18
                        },
                        elements: [
                            {
                                rows:[
                                    { template: "Theme Settings", type: "header", borderless: true, css: "webix_header_l" },
                                    { 
                                        template: "Customize the appearance of your application", 
                                        height: 35, 
                                        borderless: true, 
                                        css: "webix_el_label", 
                                        style: "color: #888;" 
                                    }
                                ]
                            },
                            { height: 20 },
                            { template: "APPEARANCE", type: "section" },
                            {
                                rows: [
                                    { 
                                        view: "template", 
                                        template: "Choose how the app looks to you.", 
                                        height: 30, borderless: true, css: "webix_el_label", style: "font-size: 13px; color: #666;" 
                                    },
                                    { 
                                        view: "segmented", 
                                        name: "theme_mode",
                                        value: "light",
                                        height: 50,
                                        options: [
                                            { id: "light", value: "☀️ Light" },
                                            { id: "dark",  value: "🌙 Dark" },
                                            { id: "auto",  value: "🔄 Auto" }
                                        ],
                                        on: {
                                            onChange: (mode) => this.toggleDarkMode(mode)
                                        }
                                    }
                                ]
                            },

                            { height: 10 },
                            { template: "TYPOGRAPHY", type: "section" },
                            {
                                cols: [
                                    {
                                        rows: [
                                            { view: "label", label: "Font Size" },
                                            { 
                                                view: "template", 
                                                template: "Adjust text size for better readability.", 
                                                height: 40, borderless: true, css: "webix_el_label", style: "font-size: 12px; color: #888;" 
                                            }
                                        ]
                                    },
                                    {
                                        view: "slider",
                                        name: "font_size",
                                        min: 12,
                                        max: 24,
                                        value: 14,
                                        step: 1,
                                        title: "#value#px",
                                        on: {
                                            onSliderDrag: (v) => this.updateFontSize(v),
                                            onChange: (v) => this.updateFontSize(v)
                                        }
                                    },
                                    { 
                                        view: "label", 
                                        localId: "size_label", 
                                        label: "14px", 
                                        width: 60, 
                                        align: "right" 
                                    }
                                ]
                            },

                            { height: 10 },
                            {
                                view: "richselect",
                                label: "Font Style",
                                name: "font_family",
                                value: "default",
                                options: [
                                    { id: "default", value: "System Default" },
                                    { id: "sans",    value: "Sans-serif (Arial)" },
                                    { id: "serif",   value: "Serif (Georgia)" },
                                    { id: "mono",    value: "Monospace (Courier)" }
                                ],
                                on: {
                                    onChange: (font) => this.updateFontFamily(font)
                                }
                            },

                            { height: 10 },
                            { template: "ACCENT COLOR", type: "section" },
                            {
                                cols: [
                                    {
                                        rows: [
                                            { view: "label", label: "Accent Color", height: 25 },
                                            { 
                                                view: "template", 
                                                template: "Personalize the look of buttons.", 
                                                height: 40, borderless: true, css: "webix_el_label", style: "font-size: 12px; color: #888;" 
                                            }
                                        ]
                                    },
                                    {
                                        view: "colorpicker",
                                        name: "accent_color",
                                        value: "#1CA1C1",
                                        width: 150,
                                        editable: true,
                                        on: {
                                            onChange: (color) => this.updateAccentColor(color)
                                        }
                                    }
                                ]
                            },
                            { height: 10 },
                            { template: "ACCESSIBILITY", type: "section" },
                            {
                                cols: [
                                    {
                                        rows: [
                                            { view: "label", label: "High Contrast Mode" },
                                            { 
                                                view: "template", 
                                                template: "Enable high contrast for better visibility.", 
                                                height: 30, borderless: true, css: "webix_el_label", style: "font-size: 12px; color: #888;" 
                                            }
                                        ]
                                    },
                                    { 
                                        view: "switch", 
                                        name: "high_contrast", 
                                        value: 0,
                                        width: 60,
                                        on: {
                                            onChange: (val) => this.toggleHighContrast(val)
                                        }
                                    }
                                ]
                            },

                            { height: 30 },
                            { 
                                cols: [
                                    {}, 
                                    { 
                                        view: "button", 
                                        value: "Reset Defaults", 
                                        width: 130, 
                                        click: () => this.resetTheme() 
                                    },
                                    { 
                                        view: "button", 
                                        localId: "save_btn", 
                                        value: "Save Theme", 
                                        css: "webix_primary", 
                                        width: 130, 
                                        click: () => webix.message("Theme Saved Successfully!")
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

    toggleDarkMode(mode) {
        const mainView = this.$$("theme_scrollview");
        
        webix.html.removeCss(mainView.getNode(), "webix_dark");

        if (mode === "dark") {
            webix.html.addCss(mainView.getNode(), "webix_dark");
            
            document.body.style.backgroundColor = "#2b2b2b";
        } else {
            document.body.style.backgroundColor = "#ffffff";
        }
    }

    updateFontSize(size) {
        this.$$("size_label").setValue(`${size}px`);
        this.$$("theme_scrollview").getNode().style.fontSize = `${size}px`;
    }

    updateFontFamily(type) {
        let fontStack = "Roboto, sans-serif";
        if (type === "serif") fontStack = "Georgia, serif";
        if (type === "mono")  fontStack = "'Courier New', monospace";
        if (type === "sans")  fontStack = "Arial, sans-serif";

        this.$$("theme_scrollview").getNode().style.fontFamily = fontStack;
    }

    updateAccentColor(color) {
        const btn = this.$$("save_btn");
        const btnNode = btn.$view.querySelector(".webix_button");
        if (btnNode) {
            btnNode.style.backgroundColor = color;
            btnNode.style.borderColor = color;
        }
    }

    toggleHighContrast(enabled) {
        const node = this.$$("theme_scrollview").getNode();
        if (enabled) {
            node.style.filter = "contrast(150%) brightness(90%)";
        } else {
            node.style.filter = "none";
        }
    }

    resetTheme() {
        this.$$("themeForm").setValues({
            theme_mode: "light",
            font_size: 14,
            font_family: "default",
            accent_color: "#1CA1C1",
            high_contrast: 0
        });


        this.toggleDarkMode("light");
        this.updateFontSize(14);
        this.updateFontFamily("default");
        this.updateAccentColor("#1CA1C1");
        this.toggleHighContrast(0);

        webix.message("Restored default theme");
    }
}