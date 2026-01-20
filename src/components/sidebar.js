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

    const sidebarHTML = `
    <div class="sidebar-temp">SIDEBAR</div>
    <button id="dashboardBtn">Dashboard</button>
    <button id="kualitasAirBtn">Kualitas Air</button>
    `;

    sidebar.innerHTML = sidebarHTML;

    // temp test ----------------------------------------------
    const listMenu = [
        {menu: 'Input Data Hidrologi', submenu: 'Kualitas Air'},
        {menu: 'Laporan', submenu: 'Laporan Kinerja'}
    ];

    let newHTML = ``;

    for (let i = 0; i < listMenu.length; i++)
    {
        const data = listMenu[i];

        newHTML += `
        <div class="menu-group">
            <button class="menu-parent">${data.menu}</button>
            <button class="menu-child">${data.submenu}</button>
        </div>
        `;
    }

    sidebar.innerHTML += newHTML;
    // temp test ----------------------------------------------

    relayPageToWorkdesk();
}


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