export function initHeader()
{
    const header = document.getElementById('header');
    let headerHTML = ``;

    headerHTML = `
    <div id="headerWrapper">
    <div class="header-left" id="headerLeft">
        <h3>PENGOLAHAN DATA HIDROLOGI</h3>
        <p>Unit Kerja Hidrologi dan Kualitas Air</p>
    </div>


    <div class="header-center" id="headerCenter">
        <span>[Dokumen Aktif]</span>
    </div>


    <div class="header-right" id="headerRight">
        <button id="helpBtn" title="Bantuan">
            <i class="fas fa-circle-question"></i>
        </button>
        <button id="settingsBtn" title="Pengaturan">
            <i class="fas fa-gear"></i>
        </button>
        <button id="profileBtn" title="Profil">
            <i class="fas fa-circle-user"></i>
        </button>
    </div>
    </div>
    `;

    header.innerHTML = headerHTML;
}