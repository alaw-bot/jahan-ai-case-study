import {JetView} from "webix-jet";
import * as webix from "webix";
import { NotificationService } from "../services/notification";

export default class NotificationSettingsView extends JetView {
    STORAGE_KEY = "user_notification_settings";
    currentAudio = null;
    
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
                                rows:[
                                    { template: "Notification Settings", type: "header", borderless: true, css: "webix_header_l" },
                                    { 
                                        template: "Manage how and when you receive notifications", 
                                        height: 35, 
                                        borderless: true, 
                                        css: "webix_el_label", 
                                        style: "color: #888;" 
                                    }
                                ]
                            },
                            { height: 20 },
                            
                            { template: "EMAIL NOTIFICATIONS", type: "section", css: { "text-align": "center", "font-size": "18px" } },
                            { 
                                view: "switch", 
                                label: "Enable Email Notifications", 
                                name: "email_enabled", 
                                value: 1,
                                on: {
                                    onChange: (newValue) => this.toggleSection("email_group", newValue)
                                }
                            },
                            {
                                localId: "email_group",
                                padding: { left: 20 },
                                rows: [
                                    { view: "checkbox", label: "Security alerts (important account changes)", name: "security_alerts", labelWidth: 320, value: 1 },
                                    { view: "checkbox", label: "System notifications", name: "system_notif", labelWidth: 320, value: 1 },
                                    { view: "checkbox", label: "Messages", name: "messeges", labelWidth: 320 },
                                    { view: "checkbox", label: "Post updates", name: "post_updates", labelWidth: 320 }
                                ]
                            },

                            { height: 10 },
                            { template: "NOTIFICATION FREQUENCY", type: "section", css: { "text-align": "center", "font-size": "18px" } },
                            { 
                                view: "radio", 
                                name: "frequency", 
                                vertical: true, 
                                value: "instant",
                                options: [
                                    { id: "instant", value: "Instant (as they happen)" },
                                    { id: "daily",   value: "Daily Notifications" },
                                    { id: "do not disturb",   value: "Do not Disturb (Silent)" }
                                ]
                            },

                            { height: 10 },
                            { template: "NOTIFICATION SOUND", type: "section", css: { "text-align": "center", "font-size": "18px" } },
                            { 
                                view: "switch", 
                                label: "Play sound for notifications", 
                                name: "sound_enabled", 
                                value: 1,
                                on: {
                                    onChange: (newValue) => {
                                        this.toggleSection("sound_group", newValue);
                                    }
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
                                            { id: "chime",   value: "🎵 Chime (Default)" },
                                            { id: "bell",    value: "🔔 Bell Alert" },
                                            { id: "pop",     value: "🎶 Subtle Pop" },
                                            { id: "arcade",  value: "👾 Arcade Blip" }
                                        ],
                                        on: {
                                            onChange: (newId) => this.playSound(newId)
                                        }
                                    },
                                    {
                                        view: "slider",
                                        localId: "volume_slider",
                                        name: "volume", 
                                        label: "Volume",
                                        min: 0,
                                        max: 100,
                                        value: 50,
                                        step: 5,
                                        labelWidth: 120,
                                        on: {
                                            onChange: (v) => {
                                                const selectedTone = this.$$("sound_selector").getValue();
                                                if (selectedTone) {
                                                    this.playSound(selectedTone);
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
                                    { 
                                        view: "button", 
                                        value: "Reset", 
                                        width: 100, 
                                        click: () => this.resetForm() 
                                    },
                                    { 
                                        view: "button", 
                                        value: "Save Changes", 
                                        css: "webix_primary", 
                                        width: 140, 
                                        click: () => this.saveSettings() 
                                    }
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
        const storedData = webix.storage.local.get(this.STORAGE_KEY);
        
        if (storedData) {
            form.setValues(storedData);
        } else {
            this.loadFromAPI(form);
        }
        this.updateControlStates(form.getValues());
    }
    
    loadFromAPI(form) {
        NotificationService.loadSettings()
            .then(data => {
                form.setValues(data);
                webix.storage.local.put(this.STORAGE_KEY, data); 
                this.updateControlStates(data);
            })
            .catch(() => {
                webix.message({ type: "warning", text: "Could not load settings. Using defaults." });
                this.resetForm();
            });
    }
    
    updateControlStates(data) {
        this.toggleSection("email_group", data.email_enabled);

        this.toggleSection("sound_group", data.sound_enabled);
    }

    toggleSection(groupId, enabled) {
        const container = this.$$(groupId);
        enabled ? container.enable() : container.disable();
    }

    playSound(soundId) {
        const soundUrls = {
            chime:  "https://assets.mixkit.co/active_storage/sfx/2357/2357-preview.mp3",
            bell:   "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3",
            pop:    "https://assets.mixkit.co/active_storage/sfx/2356/2356-preview.mp3",
            arcade: "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
        };

        const url = soundUrls[soundId];
        if (url) {
            if (this.currentAudio) {
                this.currentAudio.pause();
                this.currentAudio.currentTime = 0;
            }

            this.currentAudio = new Audio(url);

            const slider = this.$$("volume_slider");
            this.currentAudio.volume = slider ? slider.getValue() / 100 : 0.5; 

            this.currentAudio.play().catch(e => console.warn("Audio blocked or failed:", e));
        }
    }

    saveSettings() {
        const form = this.$$("notifyForm");
        const values = form.getValues();

        NotificationService.saveSettings(values)
            .then(() => {
                webix.storage.local.put(this.STORAGE_KEY, values);
                webix.message({ type: "success", text: "Notification settings saved!" });
            })
            .catch(() => {
                 webix.message({ type: "error", text: "Failed to save settings to server. Check API." });
            });
    }

    resetForm(){
        const form = this.$$("notifyForm");
        const defaultValues = {
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
        
        form.setValues(defaultValues);
        this.updateControlStates(defaultValues); 

        webix.storage.local.remove(this.STORAGE_KEY);
        
        webix.message("Settings reset to default");
    }
}