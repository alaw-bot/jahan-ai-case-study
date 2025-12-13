
import * as webix from "webix";

// --- Configuration ---
// IMPORTANT: Replace this with your actual Django endpoint URL
const PRIVACY_API_URL = "/api/settings/privacy/"; 

export const PrivacyService = {
    // Fetches the current settings from the backend (Django)
    loadSettings: function() {
        // --- NOTE: This is currently a MOCK function since your Django API isn't ready ---
        // Once the Django API is ready, uncomment the real webix.ajax request below.

        // MOCK: Return a Promise with default/dummy data immediately
        return Promise.resolve({ 
            account_privacy: "public",
            show_activity: 1,
            personalized_recommendations: 1,
            two_factor: 0,
            two_factor_method: "mobile"
        });

        /*
        // --- REAL API IMPLEMENTATION ---
        return webix.ajax()
            .get(PRIVACY_API_URL)
            .then(res => res.json())
            .catch(err => {
                console.error("Error loading privacy settings from API:", err);
                // Throwing an error here triggers the .catch() block in the view
                throw new Error("Failed to load settings.");
            });
        */
    },

    // Saves the new settings to the backend (Django)
    saveSettings: function(data) {
        // MOCK: Simulate a successful save after a delay
        console.log("MOCK API SAVE:", data);
        return new Promise(resolve => setTimeout(resolve, 500)); 
        
        /*
        // --- REAL API IMPLEMENTATION ---
        return webix.ajax()
            .post(PRIVACY_API_URL, data)
            .then(res => res.json())
            .catch(err => {
                console.error("Error saving privacy settings to API:", err);
                throw new Error("Failed to save settings.");
            });
        */
    }
};