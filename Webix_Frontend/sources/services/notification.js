import * as webix from "webix";

const NOTIFICATION_API_URL = "/api/settings/notifications/"; 

export const NotificationService = {
    loadSettings: function() {
        return Promise.resolve({ 
            email_enabled: 1,
            security_alerts: 1,
            system_notif: 1,
            messages: 0,
            post_updates: 0,
            frequency: "instant",
            sound_enabled: 1,
            sound_file: "chime",
            volume: 50 
        });

    },

    saveSettings: function(data) {
        console.log("MOCK API SAVE (Notifications):", data);
        return new Promise(resolve => setTimeout(resolve, 500)); 
        
    }
};