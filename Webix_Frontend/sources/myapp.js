import "./styles/app.css";
import "./styles/theme.css"; 
import {JetApp, EmptyRouter, HashRouter, plugins } from "webix-jet";
import * as webix from "webix";

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
            start   : "/login", // Default start page
            views
        };
        super({ ...defaults, ...config });
        this.use(plugins.Locale, { path: words, storage: webix.storage.session });

        this.attachEvent("app:guard", function(url, point, nav){
            const token = webix.storage.local.get("token");
            // console.log("GUARD CHECK: -> Target URL:", url);
       
            if (url !== "/login" && !token) {
                // console.log(" -> BLOCKING: Redirecting to login");
                nav.redirect = "/login"; 
            }
       });
    }

    render(...args) {
        this.restoreGlobalTheme(); 
        return super.render(...args);
    }

    restoreGlobalTheme() {
        try {
            let userId = "guest";
            try {
                const storedId = webix.storage.local.get("current_user_id");
                if (storedId) userId = storedId;
            } catch(e) { console.error(e); }

            const key = `app_settings_${userId}`;
            
            console.log("🎨 Restoring Theme...");
            console.log("   -> User ID:", userId);
            console.log("   -> LocalStorage Key:", key);
            
            let saved = JSON.parse(localStorage.getItem(key));
            console.log("   -> Found Settings?", !!saved);

            if (!saved) {
                saved = {
                    accent_color: "#1CA1C1",
                    font_size: 14,
                    font_family: "default",
                    theme_mode: "light",
                    high_contrast: 0
                };
            }

            if (saved) {
                if (saved.accent_color) document.documentElement.style.setProperty('--app-accent-color', saved.accent_color);
                if (saved.font_size) document.documentElement.style.setProperty('--app-font-size', saved.font_size + "px");

                if (saved.font_family) {
                    let fontStack = "Roboto, sans-serif";
                    if (saved.font_family === "serif") fontStack = "Georgia, serif";
                    if (saved.font_family === "mono")  fontStack = "'Courier New', monospace";
                    if (saved.font_family === "sans")  fontStack = "Arial, sans-serif";
                    document.documentElement.style.setProperty('--app-font-family', fontStack);
                }
                
                webix.html.removeCss(document.body, "webix_dark");
                if (saved.theme_mode === "dark") {
                    webix.html.addCss(document.body, "webix_dark");
                } else if (saved.theme_mode === "auto") {
                    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                        webix.html.addCss(document.body, "webix_dark");
                    }
                }

                document.body.style.filter = "none";
                if (saved.high_contrast) {
                    webix.html.addCss(document.body, "hc_mode");
                } else {
                    webix.html.removeCss(document.body, "hc_mode");
                }
            }
        } catch (e) {
            console.error("Error restoring theme:", e);
        }
    }
}

webix.attachEvent("onBeforeAjax", function(mode, url, data, request, headers){
    const token = webix.storage.local.get("token");
    if (token) {
        headers["Authorization"] = "Bearer " + token;
    }
});

webix.attachEvent("onAjaxError", function(xhr){
    if (xhr.status === 401) {
        webix.storage.local.remove("token");
        window.location.href = "#!/login"; 
    }
});

if (!import.meta.env.VITE_BUILD_AS_MODULE){
    webix.ready(() => new MyApp().render() );
}