export function kualitasAirPage()
{
    let kualitasAirHTML = `
    <div class="wrapper-kualitas-air" id="wrapperKualitasAir">
        ${createHeader()}
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
                <label for="kecamatanKab">Kecamatan/Kab:</label>
                <input type="text" name="kecamatan_kab" id="kecamatanKab">
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
                <label for="koordinat">Koordinat:</label>
                <input type="text" name="koordinat" id="koordinat">
            </div>

            <div class="form-header-field">
                <label for="laboratorium">Laboratorium:</label>
                <input type="text" name="laboratorium" id="laboratorium">
            </div>
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