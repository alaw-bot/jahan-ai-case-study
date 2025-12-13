import * as webix from 'webix';
import { mainView } from './views/main';
import { APP_NAME } from './config';

webix.ready(() => {
    // Determine the browser title
    document.title = APP_NAME;

    // Render the main view
    webix.ui(mainView);
});