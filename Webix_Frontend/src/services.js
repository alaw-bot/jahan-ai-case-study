import * as webix from 'webix';  // <--- ADD THIS LINE
import { API_URL } from './config';

export const UserDataService = {
    getUsers: function() {
        // Now 'webix' is defined and this will work
        return webix.ajax().get(API_URL);
    }
};