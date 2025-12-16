import { JetView } from "webix-jet";
import * as webix from "webix";
import { NotificationService } from "../services/notification";

export default class NotificationSettingsView extends JetView {
    STORAGE_KEY = "user_notification_settings";
    currentAudio = null;

    isInitializing = true;

    config() {
        return {
            view: "scrollview",
            scroll: "y",
            body: {
                rows: [
                    {
                        view: "form",
                        localId: "notifyForm",
                        fillspace: true,
                        borderless: true,
                        elementsConfig: {
                            labelWidth: 250,
                            bottomPadding: 18
                        },
                        elements: [

                            {
                                rows: [
                                    { template: "Notification Settings", type: "header", borderless: true, css: "webix_header_l" },
                                    {
                                        template: "Manage how and when you receive notifications",
                                        height: 35,
                                        borderless: true,
                                        css: "webix_el_label",
                                        style: "color:#888;"
                                    }
                                ]
                            },
                            { height: 20 },

                            { template: "EMAIL NOTIFICATIONS", type: "header", css: { "text-align": "left", "font-size": "18px" } },
                            {
                                view: "checkbox",
                                label: "Enable Email Notifications",
                                name: "email_enabled",
                                value: 1,
                                on: {
                                    onChange: v => this.toggleSection("email_group", v)
                                }
                            },
                            {
                                localId: "email_group",
                                padding: { left: 20 },
                                rows: [
                                    { view: "checkbox", label: "Security alerts", name: "security_alerts", labelWidth: 320, value: 1 },
                                    { view: "checkbox", label: "System notifications", name: "system_notif", labelWidth: 320, value: 1 },
                                    { view: "checkbox", label: "Messages", name: "messages", labelWidth: 320 },
                                    { view: "checkbox", label: "Post updates", name: "post_updates", labelWidth: 320 }
                                ]
                            },

                            { height: 10 },
                            { template: "NOTIFICATION FREQUENCY", type: "header", css: { "text-align": "left", "font-size": "18px" } },
                            {
                                view: "radio",
                                name: "frequency",
                                vertical: true,
                                value: "instant",
                                options: [
                                    { id: "instant", value: "Instant (as they happen)" },
                                    { id: "daily", value: "Daily Notifications" },
                                    { id: "dnd", value: "Do not Disturb (Silent)" }
                                ]
                            },

                            { height: 10 },
                            { template: "NOTIFICATION SOUND", type: "header", css: { "text-align": "left", "font-size": "18px" } },
                            {
                                view: "checkbox",
                                label: "Play sound for notifications",
                                name: "sound_enabled",
                                value: 1,
                                on: {
                                    onChange: v => this.toggleSection("sound_group", v)
                                }
                            },
                            {
                                localId: "sound_group",
                                rows: [
                                    {
                                        view: "richselect",
                                        localId: "sound_selector",
                                        name: "sound_file",
                                        label: "Select Tone",
                                        value: "chime",
                                        options: [
                                            { id: "chime", value: "🎵 Chime" },
                                            { id: "bell", value: "🔔 Bell" },
                                            { id: "pop", value: "🎶 Pop" },
                                            { id: "arcade", value: "👾 Arcade" }
                                        ],
                                        on: {
                                            onChange: id => {
                                                if (!this.isInitializing) {
                                                    this.playSound(id);
                                                }
                                            }
                                        }
                                    },
                                    {
                                        view: "slider",
                                        localId: "volume_slider",
                                        name: "volume",
                                        label: "Volume",
                                        min: 0,
                                        max: 100,
                                        step: 5,
                                        value: 50,
                                        labelWidth: 120,
                                        on: {
                                            onChange: () => {
                                                if (!this.isInitializing) {
                                                    const tone = this.$$("sound_selector").getValue();
                                                    this.playSound(tone);
                                                }
                                            }
                                        }
                                    }
                                ]
                            },

                            { height: 30 },
                            {
                                cols: [
                                    {},
                                    { view: "button", value: "Reset", width: 100, click: () => this.resetForm() },
                                    { view: "button", value: "Save Changes", css: "webix_primary", width: 140, click: () => this.saveSettings() }
                                ]
                            },

                            { height: 50 }
                        ]
                    }
                ]
            }
        };
    }
    init() {
        const form = this.$$("notifyForm");
        const stored = webix.storage.local.get(this.STORAGE_KEY);

        if (stored) {
            form.setValues(stored);
            this.updateControlStates(stored);
        } else {
            this.loadFromAPI(form);
        }
        this.isInitializing = false;
    }

    loadFromAPI(form) {
        NotificationService.loadSettings()
            .then(data => {
                form.setValues(data);
                webix.storage.local.put(this.STORAGE_KEY, data);
                this.updateControlStates(data);
                this.isInitializing = false;
            })
            .catch(() => {
                webix.message("Using default settings");
                this.resetForm();
            });
    }

    updateControlStates(data) {
        this.toggleSection("email_group", data.email_enabled);
        this.toggleSection("sound_group", data.sound_enabled);
    }

    toggleSection(id, enabled) {
        const ui = this.$$(id);
        enabled ? ui.enable() : ui.disable();
    }
    playSound(soundId) {
        if (!soundId) return;

        const sounds = {
            chime: "https://assets.mixkit.co/active_storage/sfx/2357/2357-preview.mp3",
            bell: "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3",
            pop: "https://assets.mixkit.co/active_storage/sfx/2356/2356-preview.mp3",
            arcade: "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
        };

        const url = sounds[soundId];
        if (!url) return;

        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
        }

        this.currentAudio = new Audio(url);

        const volume = this.$$("volume_slider").getValue();
        this.currentAudio.volume = volume / 100;

        this.currentAudio.play().catch(() => {});
    }

    saveSettings() {
        const values = this.$$("notifyForm").getValues();

        NotificationService.saveSettings(values)
            .then(() => {
                webix.storage.local.put(this.STORAGE_KEY, values);
                webix.message("Settings saved");
            })
            .catch(() => webix.message("Save failed"));
    }

    resetForm() {
        const defaults = {
            email_enabled: 1,
            security_alerts: 1,
            system_notif: 1,
            messages: 0,
            post_updates: 0,
            frequency: "instant",
            sound_enabled: 1,
            sound_file: "chime",
            volume: 50
        };

        this.isInitializing = true; 
        this.$$("notifyForm").setValues(defaults);
        this.updateControlStates(defaults);
        this.isInitializing = false;

        webix.storage.local.remove(this.STORAGE_KEY);
        webix.message("Settings reset");
    }
}