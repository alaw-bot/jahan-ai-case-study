import {JetView} from "webix-jet";
import AccountView from "./account";
import NotifyView from "./notifications";
import ThemeView from "./theme";
import PrivacyView from "./privacy";

export default class SettingsPage extends JetView {
    config() {
        return {
            type: "clean",
            padding: 10,
            rows: [
                { template: "User Preferences", type: "header", css: "webix_header" },
                {
                    view: "tabview",
                    tabbar: { optionWidth: 150 }, 
                    multiview: { animate: false },
                    cells: [
                        { header: "Account", body: AccountView },
                        { header: "Notifications", body: NotifyView },
                        { header: "Theme", body: ThemeView },
                        { header: "Privacy", body: PrivacyView }
                    ]
                }
            ]
        };
    }
}