export function kualitasAirPage()
{
    let kualitasAirHTML = `
    <div class="wrapper-kualitas-air" id="wrapperKualitasAir">
        ${createHeader()}
        ${createTable()}
        ${createFooter()}
    </div>
    `;

    return kualitasAirHTML;
}

export function kualitasAirEvents()
{

    initFlatpicker();
}


function createHeader()
{
    let html = `
    <!-- -------------------------------------------------- -->
    <!-- FORM TITLE --------------------------------------- -->
    <!-- -------------------------------------------------- -->
    <div id="formTitle">
        <h2>DATA KUALITAS AIR</h2>
    </div>
    <!-- -------------------------------------------------- -->
    <!-- FORM DATE ---------------------------------------- -->
    <!-- -------------------------------------------------- -->
    <div class="form-date-container">    
        <div class="form-date-group" id="formDate">
            <button id="datePickerBtn">
                <i class="fas fa-calendar"></i>
            </button>
            <label for="sampleDate">Tanggal:</label>
            <input type="text" name="tanggal_sampel" id="sampleDate">
        </div>

        <div class="form-date-group" id="formTime">
            <button id="timePickerBtn">
                <i class="fas fa-clock"></i>
            </button>
            <label for="sampleTime">Waktu:</label>
            <input type="text" name="waktu_sampel" id="sampleTime">
        </div>
    </div>
    <!-- -------------------------------------------------- -->
    <!-- FORM HEADER TOP ---------------------------------- -->
    <!-- -------------------------------------------------- -->
    <div class="form-header">    
        <div class="form-header-left" id="formHeaderLeft">
            <div class="form-header-field">
                <label for="namaPos">Nama Pos:</label>
                <input type="text" name="nama_pos" id="namaPos">
            </div>

            <div class="form-header-field">
                <label for="das">DAS:</label>
                <input type="text" name="das" id="das">
            </div>

            <div class="form-header-field">
                <label for="wilayahSungai">Wilayah Sungai:</label>
                <input type="text" name="wilayah_sungai" id="wilayahSungai">
            </div>

            <div class="form-header-field">
                <label for="provinsi">Provinsi:</label>
                <input type="text" name="provinsi" id="provinsi">
            </div>

            <div class="form-header-field">
                <label for="kabupaten">Kabupaten:</label>
                <input type="text" name="kabupaten" id="kabupaten">
            </div>
        </div>

        <div class="form-header-right" id="formHeaderRight">
            <div class="form-header-field">
                <label for="tahun">Tahun:</label>
                <input type="number" name="tahun" id="tahun">
            </div>

            <div class="form-header-field">
                <label for="elevasiPos">Elevasi Pos:</label>
                <input type="text" name="elevasi_pos" id="elevasiPos">
            </div>

            <div class="form-header-field">
                <label for="pelaksana">Pelaksana:</label>
                <input type="text" name="pelaksana" id="pelaksana">
            </div>
            
            <div class="form-header-field">
                <label for="kecamatan">Kecamatan:</label>
                <input type="text" name="kecamatan" id="kecamatan">
            </div>

            <div class="form-header-field">
                <label for="laboratorium">Laboratorium:</label>
                <input type="text" name="laboratorium" id="laboratorium">
            </div>
        </div>

        <div class="form-header-bottom" id="formHeaderBottom">
            <div id="formBakuMutu">
                <b>Baku Mutu Berdasarkan: PP No. 22 TAHUN 2022</b>
            </div>

            <div class="form-header-bottom-grid">
                <div class="form-header-bottom-item">
                    <label for="sungai">Sungai:</label>
                    <input type="text" name="sungai" id="sungai">
                </div>

                <div class="form-header-bottom-item">
                    <label for="desa">Desa:</label>
                    <input type="text" name="desa" id="desa">
                </div>

                <div class="form-header-bottom-item">
                    <label for="koordinatGeografis">Koordinat Geografis:</label>
                    <input type="text" name="koordinat_geografis" id="koordinatGeografis">
                </div>
            </div>
        </div>
    </div>
    `;

    return html;
}


function createTable()
{
    const tableData = [
        {
            kind: "header",
            content: ["No", "Parameter", "Satuan", "Hasil", "Baku Mutu"]
        },
        {
            category: "Variabel Umum",
            kind: "body",
            content: [
                { no: "1", label: "Temperatur", id: "temperatur", keywords: ["Suhu", "Temp"], satuan: "°C", baku: "15-35" },
                { no: "2", label: "Konduktivitas (DHL)", id: "dhl", keywords: ["Conductivity", "EC"], satuan: "umhos", baku: "-" },
                { no: "3", label: "Kekeruhan (Turbidity)", id: "kekeruhan", keywords: ["Turbidity"], satuan: "mg/l", baku: "-" },
                { no: "4", label: "Oksigen Terlarut (DO)", id: "do", keywords: ["Dissolved Oxygen"], satuan: "mg/l", baku: "1.7-19" },
                { no: "5", label: "pH", id: "ph", keywords: ["Keasaman"], satuan: "-", baku: "0-14" },
                { no: "6", label: "Zat Terlarut (TDS)", id: "tds", keywords: ["Total Dissolved Solids"], satuan: "mg/l", baku: "1000-2000" },
                { no: "7", label: "Zat Tersuspensi (TSS)", id: "tss", keywords: ["Total Suspended Solids"], satuan: "mg/l", baku: "100-400" },
                { no: "8", label: "Warna", id: "warna", keywords: ["Color"], satuan: "Pt-Co Unit", baku: "100" }
            ]
        },
        {
            category: "Major Ion",
            kind: "body",
            content: [
                { no: "9", label: "Klorida (Cl)", id: "klorida", keywords: ["Chloride Klorida"], satuan: "mg/l", baku: "300" }
            ]
        },
        {
            category: "Nutrient",
            kind: "body",
            content: [
                { no: "10", label: "Amoniak", id: "amoniak", keywords: ["Ammonia", "NH3"], satuan: "mg/l", baku: "0.5" },
                { no: "11", label: "Nitrat (NO3)", id: "nitrat", keywords: ["Nitrate"], satuan: "mg/l", baku: "20.0" },
                { no: "12", label: "Nitrit (NO2)", id: "nitrit", keywords: ["Nitrite"], satuan: "mg/l", baku: "0.06" },
                { no: "13", label: "Deterjen", id: "deterjen", keywords: ["Surfactant", "MBAS"], satuan: "mg/l", baku: "0.2" }
            ]
        },
        {
            category: "Unsur Mikro",
            kind: "body",
            content: [
                { no: "14", label: "Arsen", id: "arsen", keywords: ["As"], satuan: "mg/l", baku: "0.05-0.1" },
                { no: "15", label: "Besi Terlarut (Fe)", id: "besi", keywords: ["Iron"], satuan: "mg/l", baku: "-" },
                { no: "16", label: "Mangan", id: "mangan", keywords: ["Mn"], satuan: "mg/l", baku: "-" },
                { no: "17", label: "Tembaga", id: "tembaga", keywords: ["Cu", "Copper"], satuan: "mg/l", baku: "0.02-0.2" },
                { no: "18", label: "Merkuri (Hg)", id: "merkuri", keywords: ["Mercury"], satuan: "mg/l", baku: "0.002" }
            ]
        },
        {
            category: "Anorganik",
            kind: "body",
            content: [
                { no: "19", label: "Cianida", id: "cianida", keywords: ["Cyanide", "CN"], satuan: "mg/l", baku: "0.02" },
                { no: "20", label: "Fluorida", id: "fluorida", keywords: ["Fluoride", "F"], satuan: "mg/l", baku: "1.5" }
            ]
        },
        {
            category: "Organik",
            kind: "body",
            content: [
                { no: "21", label: "COD", id: "cod", keywords: ["Chemical Oxygen Demand"], satuan: "mg/l", baku: "40-80" },
                { no: "22", label: "BOD", id: "bod", keywords: ["Biochemical Oxygen Demand"], satuan: "mg/l", baku: "6-12" }
            ]
        },
        {
            category: "Kontaminan Organik",
            kind: "body",
            content: [
                { no: "23", label: "Minyak dan Lemak", id: "minyak_lemak", keywords: ["Oil", "Grease"], satuan: "mg/l", baku: "1-10" },
                { no: "24", label: "Fenol", id: "fenol", keywords: ["Phenol"], satuan: "mg/l", baku: "0.01-0.02" },
                { no: "25", label: "Belerang (H2S)", id: "belerang", keywords: ["Sulfide", "H2S"], satuan: "mg/l", baku: "-" }
            ]
        },
        {
            category: "Ion",
            kind: "body",
            content: [
                { no: "26", label: "Sulfida", id: "sulfida", keywords: ["Sulphide"], satuan: "mg/l", baku: "0.002" }
            ]
        },
        {
            category: "Mikrobiologi",
            kind: "body",
            content: [
                { no: "27", label: "Total Coliform", id: "total_coliform", keywords: ["Coliform"], satuan: "MPN/100ml", baku: "1.000" }
            ]
        },
        {
            category: "Lain-lain",
            kind: "body",
            content: [
                { no: "28", label: "Debit", id: "debit", keywords: ["Flow", "Discharge"], satuan: "m3/dt", baku: "-" }
            ]
        }
    ];

    let html = `<table class="kualitas-air-table">`;

    tableData.forEach(section => {
        if (section.kind === "header") {
            html += `<thead><tr>`;
            section.content.forEach(head => html += `<th>${head}</th>`);
            html += `</tr></thead><tbody>`;
        } else {
            // Baris Judul Kategori
            html += `<tr class="table-category-row"><td colspan="5">${section.category}</td></tr>`;
            
            // Baris Data
            section.content.forEach(item => {
                html += `
                <tr>
                    <td class="text-center">${item.no}</td>
                    <td>${item.label}</td>
                    <td class="text-center">${item.satuan}</td>
                    <td>
                        <input type="text" 
                               name="${item.id}" 
                               id="${item.id}" 
                               class="table-input-hasil" 
                               placeholder="...">
                    </td>
                    <td class="text-center">${item.baku}</td>
                </tr>`;
            });
        }
    });

    html += `</tbody></table>`;
    return html;
}


function createFooter() {
    let html = `
    <div class="form-footer" id="formFooter">
        <div class="calculation-grid">
            <div class="footer-card" id="mipContainer">
                <div class="card-header">
                    <i class="fas fa-bacterium"></i>
                    <span>Metode Indeks Pencemaran (IP)</span>
                </div>
                <div class="card-body">
                    <div class="input-group">
                        <input type="text" id="metodeIndeksPencemaran" readonly placeholder="Nilai IP">
                        <button id="generateIPBtn" class="btn-calculate">
                            <i class="fas fa-calculator"></i> Hitung IP
                        </button>
                    </div>
                    <div id="statusIP" class="status-label">Status: -</div>
                </div>
            </div>

            <div class="footer-card" id="storetContainer">
                <div class="card-header">
                    <i class="fas fa-chart-column"></i>
                    <span>Metode STORET</span>
                </div>
                <div class="card-body">
                    <div class="input-group">
                        <input type="text" id="metodeStoret" readonly placeholder="Skor STORET">
                        <button id="generateStoretBtn" class="btn-calculate">
                            <i class="fas fa-calculator"></i> Hitung Storet
                        </button>
                    </div>
                    <div id="statusStoret" class="status-label">Status: -</div>
                </div>
            </div>
        </div>

        <div class="action-buttons">
            <button id="saveBtn" class="btn-main btn-save">
                <i class="fas fa-save"></i> Simpan Data
            </button>
            <button id="exportPdfBtn" class="btn-main btn-pdf">
                <i class="fas fa-file-pdf"></i> Cetak PDF
            </button>
            <button id="exportExcelBtn" class="btn-main btn-excel">
                <i class="fas fa-file-excel"></i> Export Excel
            </button>
        </div>
    </div>
    `;
    return html;
}


// library untuk pengambilan waktu dan tanggal disinkronkan
// dengan id tag tanggal dan id tag waktu
function initFlatpicker()
{
    flatpickr("#sampleDate", {
        dateFormat: "d-m-Y"
    });

    flatpickr("#sampleTime", {
        enableTime: true,
        noCalendar: true,
        dateFormat: "H:i",
        time_24hr: true,
        allowInput: true
    });
}