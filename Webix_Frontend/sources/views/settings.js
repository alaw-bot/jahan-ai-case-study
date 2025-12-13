import { JetView } from "webix-jet";
import AccountView from "./account";
import NotifyView from "./notifications";
import ThemeView from "./theme";
import PrivacyView from "./privacy";

export default class SettingsPage extends JetView {
    config() {
        return {
            cols: [
                {
                    view: "sidebar",
                    width: 220,
                    css: "webix_dark",
                    data: [
                        { id: "account", value: "Account", icon: "wxi-user" },
                        { id: "notifications", value: "Notifications", icon: "wxi-bell" },
                        { id: "theme", value: "Theme", icon: "wxi-pencil" },
                        { id: "privacy", value: "Privacy", icon: "wxi-lock" }
                    ],
                    on: {
                        onAfterSelect: id => {
                            this.$$("settingsViews").setValue(id);
                        }
                    }
                },

                {
                    view: "multiview",
                    id: "settingsViews",
                    animate: false,
                    cells: [
                        { id: "account", $subview: AccountView },
                        { id: "notifications", $subview: NotifyView },
                        { id: "theme", $subview: ThemeView },
                        { id: "privacy", $subview: PrivacyView }
                    ]
                }
            ]
        };
    }
}
