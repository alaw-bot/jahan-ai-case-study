import { UserDataService } from '../services';

// We define the UI as a JSON object
export const mainView = {
    rows: [
        { 
            view: "toolbar", 
            elements: [
                { view: "label", label: "Webix Frontend Architecture" }, 
                { view: "button", value: "Refresh", width: 100, click: function(){
                    $$("user_table").clearAll();
                    $$("user_table").load(UserDataService.getUsers());
                }}
            ]
        },
        {
            cols: [
                { 
                    view: "list", width: 200, 
                    data: ["Dashboard", "Users", "Settings", "Logs"],
                    select: true,
                    on: {
                        onAfterSelect: function(id) {
                            webix.message(`Selected: ${id}`);
                        }
                    }
                },
                { 
                    view: "datatable", 
                    id: "user_table",
                    autoConfig: true, // Automatically creates columns based on data
                    url: UserDataService.getUsers() // Loads data from our service
                }
            ]
        }
    ]
};