const { invoke } = window.__TAURI__.core;

/**
 * Fungsi inisialisasi yang dipanggil oleh main.js 
 * setelah HTML kualitas-air.html berhasil dimuat.
 */
export function initKualitasAir() {
    console.log("🚀 Module Kualitas Air dimuat.");
    initFlatpicker();
    
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveData);
    }
}

/**
 * Mengambil data dari form dan mengirimnya ke Backend Rust
 */
async function saveData() {
    // Helper: Ambil value input. Return null jika kosong.
    // Otomatis convert ke Float jika itu angka.
    const getVal = (id) => {
        const el = document.getElementById(id);
        if (!el) return null;
        const val = el.value.trim();
        if (val === "") return null;

        // Daftar ID yang BUKAN angka (tetap String)
        const stringFields = [
            'namaPos', 'das', 'wilayahSungai', 'provinsi', 'kabupaten', 
            'elevasiPos', 'pelaksana', 'kecamatan', 'laboratorium', 
            'sungai', 'desa', 'koordinatGeografis', 
            'sampleDate', 'sampleTime', 'statusIP', 'statusStoret'
        ];

        if (stringFields.includes(id)) {
            return val;
        } else {
            // Coba parse ke float
            const num = parseFloat(val);
            return isNaN(num) ? null : num;
        }
    };

    // Mapping Data JS -> Rust Struct
    // Key (kiri) = Nama field di struct Rust
    // getVal('id') = ID di HTML
    const payload = {
        // Metadata
        nama_pos: getVal('namaPos'),
        das: getVal('das'),
        wilayah_sungai: getVal('wilayahSungai'),
        provinsi: getVal('provinsi'),
        kabupaten: getVal('kabupaten'),
        tahun: getVal('tahun'), // Rust i32, JS Number oke
        elevasi_pos: getVal('elevasiPos'),
        pelaksana: getVal('pelaksana'),
        kecamatan: getVal('kecamatan'),
        laboratorium: getVal('laboratorium'),
        sungai: getVal('sungai'),
        desa: getVal('desa'),
        koordinat_geografis: getVal('koordinatGeografis'),

        // Waktu
        tanggal_sampling: getVal('sampleDate'),
        waktu_sampling: getVal('sampleTime'),

        // Parameter Fisika/Kimia
        temperatur: getVal('temperatur'),
        konduktivitas: getVal('konduktivitas'),
        kekeruhan: getVal('kekeruhan'),
        oksigen: getVal('oksigen'),
        ph: getVal('ph'),
        tds: getVal('tds'),
        tss: getVal('tss'),
        warna: getVal('warna'),
        klorida: getVal('klorida'),
        amoniak: getVal('amoniak'),
        nitrat: getVal('nitrat'),
        nitrit: getVal('nitrit'),
        fosfat: getVal('fosfat'),
        deterjen: getVal('deterjen'),
        arsen: getVal('arsen'),
        besi: getVal('besi'),
        mangan: getVal('mangan'),
        tembaga: getVal('tembaga'),
        merkuri: getVal('merkuri'),
        sianida: getVal('sianida'),
        fluorida: getVal('fluorida'),
        belerang: getVal('belerang'),
        cod: getVal('cod'),
        bod: getVal('bod'),
        fenol: getVal('fenol'),
        debit: getVal('debit'),

        // Field dengan penamaan khusus (CamelCase di JS -> SnakeCase di Rust via Serde)
        minyakDanLemak: getVal('minyakDanLemak'), 
        totalColiform: getVal('totalColiform'),

        // Hasil Kalkulasi
        nilaiIp: getVal('metodeIndeksPencemaran'),
        statusIp: getVal('statusIP'),
        nilaiStoret: getVal('metodeStoret'),
        statusStoret: getVal('statusStoret')
    };

    console.log("📤 Mengirim data:", payload);

    try {
        // Panggil command Rust 'submit_kualitas_air'
        const response = await invoke('submit_kualitas_air', { data: payload });
        alert("✅ SUKSES: " + response);
    } catch (error) {
        console.error("❌ Gagal menyimpan:", error);
        alert("❌ ERROR: " + error);
    }
}

function initFlatpicker() {
    if (typeof flatpickr !== 'undefined') {
        flatpickr("#sampleDate", { dateFormat: "d-m-Y" });
        flatpickr("#sampleTime", { 
            enableTime: true, 
            noCalendar: true, 
            dateFormat: "H:i", 
            time_24hr: true 
        });
    } else {
        console.warn("Library Flatpickr belum dimuat.");
    }
}