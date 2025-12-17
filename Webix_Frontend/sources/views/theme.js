import {JetView} from "webix-jet";
import * as webix from "webix";

export default class ThemeSettingsView extends JetView {
    getStorageKey() {
        const userId = webix.storage.local.get("current_user_id") || "guest";
        return `app_settings_${userId}`;
    }

    init() {
        // 2. Define Defaults
        const defaults = {
            theme_mode: "light",
            font_size: 14,
            font_family: "default",
            accent_color: "#1CA1C1",
            high_contrast: 0
        };

        const key = this.getStorageKey();
        const saved = JSON.parse(localStorage.getItem(key)) || {};

        const settings = { ...defaults, ...saved };

        this.$$("themeForm").setValues(settings);
        this.toggleDarkMode(settings.theme_mode);
        this.updateFontSize(settings.font_size);
        this.updateFontFamily(settings.font_family);
        this.updateAccentColor(settings.accent_color);
        this.toggleHighContrast(settings.high_contrast);
    }

    config() {
        return {
            view: "scrollview",
            localId: "theme_scrollview",
            scroll: "y",
            body: {
                view: "form",
                localId: "themeForm",
                borderless: true,
                padding: { top: 20, left: 30, right: 30, bottom: 20 }, 
                elementsConfig: {
                    labelWidth: 200,
                    labelPosition: "top",
                    bottomPadding: 18
                },
                elements: [
                    {
                        rows:[
                            { template: "Theme Settings", type: "header", borderless: true, css: "webix_header_l" },
                            { template: "Customize the appearance of your application", height: 35, borderless: true, css: "description_text" }
                        ]
                    },
                    { height: 20 },
                    { template: "APPEARANCE", type: "header" },
                    {
                        paddingY: 10,
                        rows: [
                            { view: "template", template: "Choose how the app looks to you.", height: 30, borderless: true, css: "description_text" },
                            { 
                                view: "segmented", 
                                name: "theme_mode",
                                height: 50,
                                options: [
                                    { id: "light", value: "☀️ Light" },
                                    { id: "dark",  value: "🌙 Dark" },
                                    { id: "auto",  value: "🔄 Auto" }
                                ],
                                on: {
                                    onChange: (mode) => {
                                        this.toggleDarkMode(mode);
                                        this.autoSave();
                                    }
                                }
                            }
                        ]
                    },

                    { height: 10 },
                    { template: "TYPOGRAPHY", type: "header" },
                    {
                        cols: [
                            {
                                rows: [
                                    { view: "label", label: "Font Size" },
                                    { view: "template", template: "Adjust text size for better readability.", height: 40, borderless: true, css: "description_text" }
                                ]
                            },
                            {
                                view: "slider",
                                name: "font_size",
                                min: 12, max: 24, step: 1,
                                title: "#value#px",
                                on: {
                                    onSliderDrag: (v) => this.updateFontSize(v),
                                    onChange: (v) => {
                                        this.updateFontSize(v); 
                                        this.autoSave();
                                    }
                                }
                            },
                            { view: "label", localId: "size_label", width: 50, align: "right", css: "value_label", label: "14px" }
                        ]
                    },
                    { height: 15 },
                    {
                        view: "richselect",
                        label: "Font Style",
                        labelPosition: "top",
                        name: "font_family",
                        options: [
                            { id: "default", value: "System Default" },
                            { id: "sans",    value: "Sans-serif (Arial)" },
                            { id: "serif",   value: "Serif (Georgia)" },
                            { id: "mono",    value: "Monospace (Courier)" }
                        ],
                        on: {
                            onChange: (val) => {
                                this.updateFontFamily(val);
                                this.autoSave();
                            }
                        }
                    },
                    { height: 20 },
                    { template: "ACCENT COLOR", type: "header" },
                    {
                        cols: [
                            {
                                rows: [
                                    { view: "label", label: "Accent Color" },
                                    { view: "template", template: "Personalize the look of buttons.", height: 40, borderless: true, css: "description_text" }
                                ]
                            },
                            {
                                view: "colorpicker",
                                name: "accent_color",
                                width: 150, 
                                editable: true,
                                on: {
                                    onChange: (color) => {
                                        this.updateAccentColor(color);
                                        this.autoSave();
                                    }
                                }
                            }
                        ]
                    },
                    { height: 10 },
                    { template: "ACCESSIBILITY", type: "header" },
                    {
                        cols: [
                            {
                                rows: [
                                    { view: "label", label: "High Contrast Mode" },
                                    { view: "template", template: "Enable high contrast for better visibility.", height: 30, borderless: true, css: "description_text" }
                                ]
                            },
                            { 
                                view: "checkbox", 
                                name: "high_contrast", 
                                width: 60,
                                on: {
                                    onChange: (val) => {
                                        this.toggleHighContrast(val);
                                        this.autoSave();
                                    }
                                }
                            }
                        ]
                    },

                    { height: 40 },
                    { 
                        cols: [
                            {}, 
                            { 
                                view: "button", 
                                value: "Reset to Defaults", 
                                width: 150, 
                                click: () => this.resetTheme() 
                            }
                        ]
                    },
                    { height: 50 }
                ]
            }
        };
    }

    autoSave() {
        const values = this.$$("themeForm").getValues();
        const key = this.getStorageKey();
        localStorage.setItem(key, JSON.stringify(values));
    }

    toggleDarkMode(mode) {
        if (this._themeListener) {
            window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', this._themeListener);
            this._themeListener = null;
        }
        const applyTheme = (isDark) => {
            isDark ? webix.html.addCss(document.body, "webix_dark") : webix.html.removeCss(document.body, "webix_dark");
        };
        if (mode === "auto") {
            const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            applyTheme(systemDark);
            this._themeListener = (e) => applyTheme(e.matches);
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', this._themeListener);
        } else {
            applyTheme(mode === "dark");
        }
    }

    updateSizeLabel(size) {
        if(this.$$("size_label")) this.$$("size_label").setValue(`${size}px`);
    }

    updateFontSize(size) {
        this.updateSizeLabel(size);
        document.documentElement.style.setProperty('--app-font-size', size + "px");
    }

    updateFontFamily(type) {
        let fontStack = "Roboto, sans-serif";
        if (type === "serif") fontStack = "Georgia, serif";
        if (type === "mono")  fontStack = "'Courier New', monospace";
        if (type === "sans")  fontStack = "Arial, sans-serif";
        
        document.documentElement.style.setProperty('--app-font-family', fontStack);
    }

    updateAccentColor(color) {
        document.documentElement.style.setProperty('--app-accent-color', color);
    }

    toggleHighContrast(enabled) {
        document.body.style.filter = "none";

        if (enabled) {
            webix.html.addCss(document.body, "hc_mode");
        } else {
            webix.html.removeCss(document.body, "hc_mode");
        }
    }

    resetTheme() {
        const defaults = {
            theme_mode: "light",
            font_size: 14,
            font_family: "default",
            accent_color: "#1CA1C1", 
            high_contrast: 0
        };

        this.$$("themeForm").setValues(defaults);
        this.toggleDarkMode("light");
        this.updateFontSize(14);
        this.updateFontFamily("default");
        this.updateAccentColor("#1CA1C1");
        this.toggleHighContrast(0);
        
        this.autoSave(); 
        webix.message("Restored default theme");
    }
}