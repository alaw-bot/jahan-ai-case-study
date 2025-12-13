
import * as webix from "webix";
const PRIVACY_API_URL = "/api/settings/privacy/"; 

export const PrivacyService = {
    loadSettings: function() {
        return Promise.resolve({ 
            account_privacy: "public",
            show_activity: 1,
            personalized_recommendations: 1,
            two_factor: 0,
            two_factor_method: "mobile"
        });

    },


    saveSettings: function(data) {

        console.log("MOCK API SAVE:", data);
        return new Promise(resolve => setTimeout(resolve, 500)); 
        

    }
};