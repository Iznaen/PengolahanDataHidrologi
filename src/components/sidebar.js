// ------------------------------------------------------------
// sidebar.js RELAY PAGES TO WORKDESK
// ------------------------------------------------------------

// import *.js from ./pages to be displayed inside workdesk.js
import { dashboardPage, dashboardEvents } from "../pages/dashboard.js";
import { kualitasAirPage, kualitasAirEvents } from "../pages/kualitas-air.js";

// communicate with workdesk.js
import { initPage } from "./workdesk.js";

export function initSidebar()
{
    const sidebar = document.getElementById('sidebar');
    let sidebarHTML = ``;
    
    sidebar.innerHTML = sidebarHTML;
    // temp test ----------------------------------------------
    // temp test ----------------------------------------------

    if (sidebar)
    {
        relayPageToWorkdesk();
    }
    else
    {
        return;
    }
}


// call initPage() based on 'click' of the menu <button>
function relayPageToWorkdesk()
{
    const dashboardBtn = document.getElementById('dashboardBtn');
    const kualitasAirBtn = document.getElementById('kualitasAirBtn');

    dashboardBtn.addEventListener('click', () => {
        initPage(dashboardPage, dashboardEvents);
    });

    kualitasAirBtn.addEventListener('click', () => {
        initPage(kualitasAirPage, kualitasAirEvents);
    });
}