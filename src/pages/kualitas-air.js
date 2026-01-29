const { invoke } = window.__TAURI__.core;

export function initKualitasAir() {
    console.log("🚀 Module Kualitas Air dimuat.");
    initFlatpicker();
    
    // Listener Tombol Simpan
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) saveBtn.addEventListener('click', saveData);

    // Listener Tombol Hitung IP
    const btnHitungIP = document.getElementById('btnHitungIP');
    if (btnHitungIP) btnHitungIP.addEventListener('click', calculateIP);

    // Listener Tombol Upload
    const btnUpload = document.getElementById('btnUploadPdf');
    if (btnUpload) {
        btnUpload.addEventListener('click', handlePdfUpload);
    }
}

/**
 * Fitur: Upload PDF via Rust Native Dialog
 */
async function handlePdfUpload() {
    try {
        console.log("Meminta Rust membuka dialog file...");
        document.body.style.cursor = 'wait';

        // 1. Panggil Rust untuk baca PDF
        const data = await invoke('import_pdf');

        document.body.style.cursor = 'default';

        if (data) {
            console.log("📄 Data Diterima dari Rust:", data);
            
            // 2. Isi Form Otomatis
            fillForm(data);

            alert("✅ Data berhasil diekstrak dan dimasukkan ke form!");
        }

    } catch (error) {
        document.body.style.cursor = 'default';
        
        if (error.includes("dibatalkan")) {
            console.log("User membatalkan pemilihan file.");
            return;
        }

        console.error("PDF Error:", error);
        alert("❌ Gagal: " + error);
    }
}

/**
 * Helper: Memetakan Data Rust ke Input HTML
 */
function fillForm(data) {
    // Fungsi kecil untuk set nilai jika element ada & datanya tidak null
    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el && val !== null && val !== undefined) {
            el.value = val;
            
            // Visual feedback (opsional: kedip kuning sebentar)
            el.style.backgroundColor = "#fff3cd";
            setTimeout(() => { el.style.backgroundColor = ""; }, 1000);
        }
    };

    // --- MAPPING FIELD RUST -> HTML ID ---
    
    // A. Parameter Fisika
    setVal('temperatur', data.temperatur);
    setVal('konduktivitas', data.konduktivitas); // DHL
    setVal('kekeruhan', data.kekeruhan);
    setVal('tds', data.tds);
    setVal('tss', data.tss);
    setVal('warna', data.warna);

    // B. Parameter Kimia
    setVal('ph', data.ph);
    setVal('oksigen', data.oksigen); // DO
    setVal('bod', data.bod);
    setVal('cod', data.cod);
    setVal('amoniak', data.amoniak);
    setVal('nitrat', data.nitrat);
    setVal('nitrit', data.nitrit);
    setVal('fosfat', data.fosfat);
    setVal('deterjen', data.deterjen);
    setVal('minyakDanLemak', data.minyakDanLemak); // Perhatikan beda snake_case ke camelCase
    setVal('fenol', data.fenol);
    
    // C. Parameter Logam & Anorganik
    setVal('klorida', data.klorida);
    setVal('belerang', data.belerang);
    setVal('sianida', data.sianida);
    setVal('fluorida', data.fluorida);
    setVal('arsen', data.arsen);
    setVal('besi', data.besi);
    setVal('mangan', data.mangan);
    setVal('tembaga', data.tembaga);
    setVal('merkuri', data.merkuri);

    // D. Mikrobiologi
    setVal('totalColiform', data.totalColiform);

    // Catatan: Metadata (Nama Pos, dll) belum diekstrak oleh Rust, 
    // jadi belum kita map di sini.
}

// --- FUNGSI STANDAR LAINNYA ---

function getFormData() {
    const getVal = (id) => {
        const el = document.getElementById(id);
        if (!el) return null;
        const val = el.value.trim();
        if (val === "") return null;
        const stringFields = ['namaPos', 'das', 'wilayahSungai', 'provinsi', 'kabupaten', 'elevasiPos', 'pelaksana', 'kecamatan', 'laboratorium', 'sungai', 'desa', 'koordinatGeografis', 'sampleDate', 'sampleTime', 'statusIP', 'statusStoret'];
        if (stringFields.includes(id)) return val;
        const num = parseFloat(val.replace(',', '.'));
        return isNaN(num) ? null : num;
    };
    return {
        nama_pos: getVal('namaPos'), das: getVal('das'), wilayah_sungai: getVal('wilayahSungai'), provinsi: getVal('provinsi'), kabupaten: getVal('kabupaten'), tahun: getVal('tahun'), elevasi_pos: getVal('elevasiPos'), pelaksana: getVal('pelaksana'), kecamatan: getVal('kecamatan'), laboratorium: getVal('laboratorium'), sungai: getVal('sungai'), desa: getVal('desa'), koordinat_geografis: getVal('koordinatGeografis'),
        tanggal_sampling: getVal('sampleDate'), waktu_sampling: getVal('sampleTime'),
        temperatur: getVal('temperatur'), konduktivitas: getVal('konduktivitas'), kekeruhan: getVal('kekeruhan'), oksigen: getVal('oksigen'), ph: getVal('ph'), tds: getVal('tds'), tss: getVal('tss'), warna: getVal('warna'), klorida: getVal('klorida'), amoniak: getVal('amoniak'), nitrat: getVal('nitrat'), nitrit: getVal('nitrit'), fosfat: getVal('fosfat'), deterjen: getVal('deterjen'), arsen: getVal('arsen'), besi: getVal('besi'), mangan: getVal('mangan'), tembaga: getVal('tembaga'), merkuri: getVal('merkuri'), sianida: getVal('sianida'), fluorida: getVal('fluorida'), belerang: getVal('belerang'), cod: getVal('cod'), bod: getVal('bod'), fenol: getVal('fenol'), debit: getVal('debit'), minyakDanLemak: getVal('minyakDanLemak'), totalColiform: getVal('totalColiform'),
        nilaiIp: getVal('metodeIndeksPencemaran'), statusIp: getVal('statusIP'), nilaiStoret: getVal('metodeStoret'), statusStoret: getVal('statusStoret')
    };
}

async function calculateIP() {
    const payload = getFormData();
    try {
        const [score, status] = await invoke('calculate_ip_preview', { data: payload });
        const inputNilai = document.getElementById('metodeIndeksPencemaran');
        const inputStatus = document.getElementById('statusIP');
        if (inputNilai) inputNilai.value = score;
        if (inputStatus) inputStatus.value = status;
        if (status.includes("Baik") || status.includes("Memenuhi")) inputStatus.style.color = "green";
        else if (status.includes("Ringan")) inputStatus.style.color = "#f39c12"; 
        else inputStatus.style.color = "red";
    } catch (error) { console.error(error); alert("❌ Gagal: " + error); }
}

async function saveData() {
    const payload = getFormData();
    try {
        const response = await invoke('submit_kualitas_air', { data: payload });
        alert("✅ SUKSES: " + response);
    } catch (error) { console.error(error); alert("❌ ERROR: " + error); }
}

function initFlatpicker() {
    if (typeof flatpickr !== 'undefined') {
        flatpickr("#sampleDate", { dateFormat: "d-m-Y" });
        flatpickr("#sampleTime", { enableTime: true, noCalendar: true, dateFormat: "H:i", time_24hr: true });
    }
}