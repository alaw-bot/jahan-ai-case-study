import {JetView} from "webix-jet";

export default class NotificationSettingsView extends JetView {
    config() {
        return {
            view: "scrollview",
            scroll: "y",
            body: {

                cols: [
                    {
                        view: "form",
                        localId: "notifyForm",
                        width: 0, 
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
                            
                            
                            { template: "EMAIL NOTIFICATIONS", type: "section", css: { "text-align": "center", "font-size": "18px", } },
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
                                    { view: "checkbox", localId: "security", label: "Security alerts (important account changes)", name: "security_alerts", labelWidth: 320, value: 1 },
                                    { view: "checkbox", localId: "system", label: "System notifications", name: "system_notif", labelWidth: 320, value: 1 },
                                    { view: "checkbox", localId: "activity", label: "Activity updates", name: "activity_updates", labelWidth: 320 }
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
                                    { id: "daily",   value: "Daily digest" },
                                    { id: "never",   value: "Never (pause all notifications)" }
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
                                        const selector = this.$$("sound_selector");
                                        newValue ? selector.enable() : selector.disable();
                                    }
                                }
                            },
                            {
                                view: "richselect", 
                                localId: "sound_selector",
                                name: "sound_file",
                                label: "Select Tone",
                                value: "chime", 
                                options: [
                                    { id: "chime",   value: "🎵 Chime (Default)" },
                                    { id: "bell",    value: "🔔 Bell Alert" },
                                    { id: "pop",     value: "🎶 Subtle Pop" },
                                    { id: "arcade",  value: "👾 Arcade Blip" }
                                ],
                                on: {
                                    onChange: (newId) => this.playSound(newId)
                                }
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

    toggleSection(groupId, enabled) {
        const container = this.$$(groupId);
        if (enabled) {
            container.enable();
        } else {
            container.disable();
        }
    }


    playSound(soundId) {
        const soundUrls = {
            chime:  "https://assets.mixkit.co/active_storage/sfx/2357/2357-preview.mp3",
            bell:   "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3",
            pop:    "https://assets.mixkit.co/active_storage/sfx/2356/2356-preview.mp3",
            arcade: "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
        };

        const url = soundUrls[soundId];
        if (url) {
            if (this.currentAudio) {
                this.currentAudio.pause();
                this.currentAudio.currentTime = 0;
            }
            
            this.currentAudio = new Audio(url);
            this.currentAudio.volume = 0.5;
            this.currentAudio.play().catch(e => console.warn("Audio blocked or failed:", e));
        }
    }

    resetForm(){
        const form = this.$$("notifyForm");
        form.setValues({
            email_enabled: 1,
            security_alerts: 1,
            system_notif: 1,
            frequency: "instant",
            sound_enabled: 1,
            sound_file: "chime"
        });
        webix.message("Settings reset to default");
    }


    saveSettings() {
        const form = this.$$("notifyForm");
        const values = form.getValues();
        
    }
}