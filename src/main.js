// import from ./components
import { initHeader } from "./components/header.js";
import { initSidebar } from "./components/sidebar.js";
import { initPage } from "./components/workdesk.js";

// import for default view of workspace
// changing pages to pages handled by sidebar.js
import { dashboardPage, dashboardEvents } from "./pages/dashboard.js";

function startApp()
{
    initHeader();
    initSidebar();

    // tampilan default adalah 'dashboardpage'
    initPage(dashboardPage, dashboardEvents);
}

document.addEventListener('DOMContentLoaded', startApp);