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
    const sidebarHTML = ``;

    // sidebarHTML = `
    // <div class="sidebar-temp">SIDEBAR</div>
    // <button id="dashboardBtn">Dashboard</button>
    // <button id="kualitasAirBtn">Kualitas Air</button>
    // `;

    
    sidebar.innerHTML = sidebarHTML;

    // temp test ----------------------------------------------
    // temp test ----------------------------------------------

    relayPageToWorkdesk();
}


function relayPageToWorkdesk()
{
    const dashboardBtn = document.getElementById('dashboardBtn');
    const kualitasAirBtn = document.getElementById('kualitasAirBtn');

    // optional chaining [?] before [.addEventListener] to check
    // if dashboardBtn exist before listening to it
    dashboardBtn?.addEventListener('click', () => {
        initPage(dashboardPage, dashboardEvents);
    });

    kualitasAirBtn?.addEventListener('click', () => {
        initPage(kualitasAirPage, kualitasAirEvents);
    });
}