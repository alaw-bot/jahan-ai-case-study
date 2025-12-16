import { JetView, plugins } from "webix-jet";
import "webix/webix.css";         
import "../styles/settings.css";    

export default class SettingsPage extends JetView {
    
    config() {
        return {
            cols: [
                {
                    width: 220,
                    css: "sidebar-custom",
                    rows: [
                        {
                            height: 80,
                            borderless: true,
                            template: `
                                <div class="app-logo">
                                    <img 
                                      src="https://upload.wikimedia.org/wikipedia/commons/a/ab/Logo_TV_2015.png" 
                                      class="app-logo-image"
                                    />
                                    <span class="app-logo-text">MyApp</span>
                                </div>
                            `
                        },

                        // MAIN MENU
                        {
                            view: "sidebar",
                            localId: "sideMenu",
                            select: true,
                            data: [
                                { id: "account", value: "Account", icon: "wxi-user" },
                                { id: "notifications", value: "Notifications", icon: "wxi-bell" },
                                { id: "theme", value: "Theme", icon: "wxi-pencil" },
                                { id: "privacy", value: "Privacy", icon: "wxi-theif" }
                            ],
                            on: {
                                onAfterSelect: id => this.show(id)
                            }
                        },
                        {
                            view: "template",
                            css: "logout-item",
                            height: 60,
                            template: `
                                <div class="logout-content">
                                    <span class="webix_icon wxi-logout"></span>
                                    <span>Logout</span>
                                </div>
                            `,
                            onClick: {
                                "logout-content": () => this.logout()
                            }
                        }
                    ]
                },

                // CONTENT
                {
                    $subview: true
                }
            ]
        };
    }

    init() {
        this.use(plugins.Menu, "sideMenu");
    }

    ready() {
        const segment = this.getUrl()[1];
        if (segment) {
            this.$$("sideMenu").select(segment.page);
        }
    }

    logout() {
        webix.confirm({
            title: "Logout",
            text: "Are you sure you want to logout?",
            ok: "Yes",
            cancel: "No"
        }).then(() => {
            webix.storage.local.remove("token");
            webix.storage.local.remove("current_user_id");

            window.location.href = "#!/login";
            window.location.reload();
        });
    }
}