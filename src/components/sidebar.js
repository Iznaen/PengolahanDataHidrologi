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
    
    sidebar.innerHTML = createSidebarMenu();

    handleSidebarInteractions();

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

function createSidebarMenu()
{
    /**
     * Icon-burger
     * Menu
     * ----------------------------------------------
     * Dashboard (class=sidebar-main)
     * Input Data Hidrologi (class=sidebar-main)
     * |- Kualitas Air (class=sidebar-sub)
     * |- Curah Hujan (class=sidebar-sub)
     * |- Klimatologi (class=sidebar-sub)
     * |- Debit Air (class=sidebar-sub)
     * Laporan (class=sidebar-main)
     * |- Publikasi Kualitas Air (class=sidebar-sub)
     * |- Kinerja Pegawai (class=sidebar-sub)
     * |- Inventaris Aset (class=sidebar-sub)
     * Ruang Data (class=sidebar-main)
     * |- Database (class=sidebar-sub)
     * |- Riwayat (class=sidebar-sub)
     * ----------------------------------------------
     * Icon-user
     * Nama User
     * Admin
     */

    const menuData = [
        {
            label: "Menu",
            class: "sidebar-top",
            id: "sidebarToggleBtn",
            icon: "fas fa-bars"
        },
        {
            label: "Dashboard",
            class: "sidebar-main",
            id: "dashboardBtn",
            icon: "fas fa-house"
        },
        {
            label: "Input Data Hidrologi",
            class: "sidebar-main",
            id: "inputDataBtn",
            icon: "fas fa-laptop",
            subMenu: [
                {
                    label: "Kualitas Air",
                    class: "sidebar-sub",
                    id: "kualitasAirBtn",
                    icon: "fas fa-flask"
                },
                {
                    label: "Curah Hujan",
                    class: "sidebar-sub",
                    id: "curahHujanBtn",
                    icon: "fas fa-cloud-rain"
                },
                {
                    label: "Klimatologi",
                    class: "sidebar-sub",
                    id: "klimatologiBtn",
                    icon: "fas fa-cloud-sun"
                },
                {
                    label: "Debit Air",
                    class: "sidebar-sub",
                    id: "debitAirBtn",
                    icon: "fas fa-bridge-water"
                }
            ]
        },
        {
            label: "Laporan",
            class: "sidebar-main",
            id: "laporanBtn",
            icon: "fas fa-newspaper",
            subMenu: [
                {
                    label: "Publikasi Kualitas Air",
                    class: "sidebar-sub",
                    id: "publikasiKABtn",
                    icon: "fas fa-file-circle-plus"
                },
                {
                    label: "Laporan Kinerja",
                    class: "sidebar-sub",
                    id: "laporanKinerjaBtn",
                    icon: "fas fa-briefcase"
                },
                {
                    label: "Inventaris Aset",
                    class: "sidebar-sub",
                    id: "inventarisAsetBtn",
                    icon: "fas fa-cart-flatbed"
                }
            ]
        },
        {
            label: "Ruang Data",
            class: "sidebar-main",
            id: "ruangDataBtn",
            icon: "fas fa-server",
            subMenu: [
                {
                    label: "Database",
                    class: "sidebar-sub",
                    id: "databaseBtn",
                    icon: "fas fa-database"
                },
                {
                    label: "Riwayat",
                    class: "sidebar-sub",
                    id: "riwayatBtn",
                    icon: "fas fa-clock-rotate-left"
                }
            ]
        },
        {
            label: "User Status",
            class: "sidebar-bottom",
            id: "userStatusBtn",
            icon: "fas fa-user-tie"
        }
    ];

    let html = ``;

    // loop through menuData objects
    menuData.forEach(item => {
        // Render Menu Utama
        html += `
            <div class="${item.class}" id="${item.id}">
                <i class="${item.icon}"></i>
                <span>${item.label}</span>
            </div>
        `;

        // Jika ada subMenu, render di bawahnya
        if (item.subMenu) {
            item.subMenu.forEach(sub => {
                html += `
                    <div class="${sub.class}" id="${sub.id}">
                        <i class="${sub.icon}"></i>
                        <span>${sub.label}</span>
                    </div>
                `;
            });
        }
    });

    return html;
}


function handleSidebarInteractions()
{
    const sidebar = document.getElementById('sidebar');
    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    const allMenuItems = document.querySelectorAll('.sidebar-main, .sidebar-sub');
    const mainMenuItemsWithSub = document.querySelectorAll('.sidebar-main:has(+ .sidebar-sub)');

    // 1. Toggle Sidebar Collapse/Expand
    sidebarToggleBtn?.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        
        // Update icon based on state
        const icon = sidebarToggleBtn.querySelector('i');
        if (sidebar.classList.contains('collapsed')) {
            icon.className = 'fas fa-bars';
            // Add tooltip attributes for collapsed state
            allMenuItems.forEach(item => {
                const label = item.querySelector('span')?.textContent || '';
                item.setAttribute('data-tooltip', label);
            });
        } else {
            icon.className = 'fas fa-times';
            // Remove tooltip attributes for expanded state
            allMenuItems.forEach(item => {
                item.removeAttribute('data-tooltip');
            });
        }
    });

    // 2. Handle Active State for Menu Items
    allMenuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Remove active class from all menu items
            allMenuItems.forEach(el => {
                el.classList.remove('active');
            });
            
            // Add active class to clicked item
            item.classList.add('active');
            
            // If clicking a main menu item with submenu, also highlight first submenu
            if (item.classList.contains('sidebar-main') && item.nextElementSibling?.classList.contains('sidebar-sub')) {
                const firstSubItem = item.nextElementSibling;
                if (firstSubItem && !firstSubItem.classList.contains('active')) {
                    firstSubItem.classList.add('active');
                }
            }
            
            // Prevent event bubbling for submenu items
            if (item.classList.contains('sidebar-sub')) {
                const parentMainItem = findParentMainItem(item);
                if (parentMainItem) {
                    parentMainItem.classList.add('active');
                }
                e.stopPropagation();
            }
        });
    });

    // 3. Handle Expand/Collapse for Main Menu with Submenus
    mainMenuItemsWithSub.forEach(mainItem => {
        // Add expand/collapse indicator
        const indicator = document.createElement('i');
        indicator.className = 'fas fa-chevron-down sidebar-expand-icon';
        mainItem.appendChild(indicator);
        
        // Get all subitems for this main item
        const subItems = [];
        let nextSibling = mainItem.nextElementSibling;
        while (nextSibling && nextSibling.classList.contains('sidebar-sub')) {
            subItems.push(nextSibling);
            nextSibling = nextSibling.nextElementSibling;
        }
        
        // Initialize all subitems as visible
        subItems.forEach(subItem => {
            subItem.classList.add('visible');
        });
        
        // Toggle submenu visibility on main item click
        mainItem.addEventListener('click', (e) => {
            // If sidebar is collapsed, don't toggle submenu
            if (sidebar.classList.contains('collapsed')) {
                return;
            }
            
            const isExpanded = subItems[0]?.classList.contains('visible');
            
            if (isExpanded) {
                // Collapse submenu
                subItems.forEach(subItem => {
                    subItem.classList.remove('visible');
                    subItem.style.display = 'none';
                });
                indicator.className = 'fas fa-chevron-right sidebar-expand-icon';
            } else {
                // Expand submenu
                subItems.forEach(subItem => {
                    subItem.classList.add('visible');
                    subItem.style.display = 'flex';
                });
                indicator.className = 'fas fa-chevron-down sidebar-expand-icon';
            }
            
            // Don't prevent default if we want the page to load
            // e.stopPropagation();
        });
    });

    // 4. Handle User Status Click
    const userStatusBtn = document.getElementById('userStatusBtn');
    userStatusBtn?.addEventListener('click', () => {
        console.log('User status clicked');
        // TODO: Implement user status modal or dropdown
        alert('Fitur profil pengguna akan segera tersedia');
    });

    // 5. Keyboard Navigation Support
    sidebar.addEventListener('keydown', (e) => {
        const items = Array.from(allMenuItems);
        const currentIndex = items.indexOf(document.activeElement);
        
        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (currentIndex < items.length - 1) {
                    items[currentIndex + 1]?.focus();
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (currentIndex > 0) {
                    items[currentIndex - 1]?.focus();
                }
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                document.activeElement?.click();
                break;
            case 'Home':
                e.preventDefault();
                items[0]?.focus();
                break;
            case 'End':
                e.preventDefault();
                items[items.length - 1]?.focus();
                break;
        }
    });

    // 6. Make menu items focusable for keyboard navigation
    allMenuItems.forEach(item => {
        item.setAttribute('tabindex', '0');
    });

    // 7. Auto-collapse on mobile by default
    const checkMobileView = () => {
        if (window.innerWidth <= 768 && !sidebar.classList.contains('collapsed')) {
            sidebar.classList.add('collapsed');
            // Add tooltip attributes
            allMenuItems.forEach(item => {
                const label = item.querySelector('span')?.textContent || '';
                item.setAttribute('data-tooltip', label);
            });
        }
    };

    // Check on load
    checkMobileView();
    
    // Check on resize
    window.addEventListener('resize', checkMobileView);
}


// Helper function to find parent main menu item
function findParentMainItem(subItem) {
    let prevSibling = subItem.previousElementSibling;
    while (prevSibling) {
        if (prevSibling.classList.contains('sidebar-main')) {
            return prevSibling;
        }
        prevSibling = prevSibling.previousElementSibling;
    }
    return null;
}