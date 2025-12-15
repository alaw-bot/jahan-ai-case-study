import "./styles/app.css";
import "./styles/theme.css"; 
import {JetApp, EmptyRouter, HashRouter, plugins } from "webix-jet";

const modules = import.meta.glob("./views/**/*.js");
const views = name => modules[`./views/${name}.js`]().then(x => x.default);
const locales = import.meta.glob("./locales/*.js");
const words = name => locales[`./locales/${name}.js`]().then(x => x.default);

export default class MyApp extends JetApp {
    constructor(config){
        const defaults = {
            id      : import.meta.env.VITE_APPNAME,
            version : import.meta.env.VITE_VERSION,
            router  : import.meta.env.VITE_BUILD_AS_MODULE ? EmptyRouter : HashRouter,
            debug   : !import.meta.env.PROD,
            start   : "/settings", // where the app starts
            views
        };
        super({ ...defaults, ...config });
        this.use(plugins.Locale, { path: words, storage: this.webix.storage.session });
    }

    render() {
        this.restoreGlobalTheme(); 
        return super.render();
    }

    restoreGlobalTheme() {
        try {
            const saved = JSON.parse(localStorage.getItem("app_settings"));
            
            if (saved) {
                document.body.style.filter = "none"; 
                
                if (saved.high_contrast) {
                    webix.html.addCss(document.body, "hc_mode");
                } else {
                    webix.html.removeCss(document.body, "hc_mode");
                }
                if (saved.theme_mode === "dark") {
                    webix.html.addCss(document.body, "webix_dark");
                } else if (saved.theme_mode === "auto") {
                    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                        webix.html.addCss(document.body, "webix_dark");
                    }
                } else {
                    webix.html.removeCss(document.body, "webix_dark");
                }

                if (saved.font_size) {
                    document.documentElement.style.setProperty('--app-font-size', saved.font_size + "px");
                }
                if (saved.font_family) {
                    let fontStack = "Roboto, sans-serif";
                    if (saved.font_family === "serif") fontStack = "Georgia, serif";
                    if (saved.font_family === "mono")  fontStack = "'Courier New', monospace";
                    if (saved.font_family === "sans")  fontStack = "Arial, sans-serif";
                    document.documentElement.style.setProperty('--app-font-family', fontStack);
                }
            }
        } catch (e) {
            console.error("Error restoring theme:", e);
        }
    }
}

if (!import.meta.env.VITE_BUILD_AS_MODULE){
    webix.ready(() => new MyApp().render() );
}