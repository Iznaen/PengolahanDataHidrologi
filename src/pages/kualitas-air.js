const { invoke } = window.__TAURI__.core;

export function initKualitasAir() {
    console.log("🚀 Module Kualitas Air dimuat.");
    initFlatpicker();
    
    // Listener Tombol Simpan
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveData);
    }

    // Listener Tombol Hitung IP (Baru)
    const btnHitungIP = document.getElementById('btnHitungIP');
    if (btnHitungIP) {
        btnHitungIP.addEventListener('click', calculateIP);
    }
}

/**
 * Fungsi Helper: Mengambil semua data dari form menjadi Object JSON
 * Digunakan oleh Hitung IP dan Simpan Data
 */
function getFormData() {
    const getVal = (id) => {
        const el = document.getElementById(id);
        if (!el) return null;
        const val = el.value.trim();
        if (val === "") return null;

        const stringFields = [
            'namaPos', 'das', 'wilayahSungai', 'provinsi', 'kabupaten', 
            'elevasiPos', 'pelaksana', 'kecamatan', 'laboratorium', 
            'sungai', 'desa', 'koordinatGeografis', 
            'sampleDate', 'sampleTime', 'statusIP', 'statusStoret'
        ];

        if (stringFields.includes(id)) {
            return val;
        } else {
            const num = parseFloat(val.replace(',', '.')); // Handle koma desimal indo
            return isNaN(num) ? null : num;
        }
    };

    return {
        // Metadata
        nama_pos: getVal('namaPos'),
        das: getVal('das'),
        wilayah_sungai: getVal('wilayahSungai'),
        provinsi: getVal('provinsi'),
        kabupaten: getVal('kabupaten'),
        tahun: getVal('tahun'), 
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

        // Parameter
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
        minyakDanLemak: getVal('minyakDanLemak'), 
        totalColiform: getVal('totalColiform'),

        // Hasil Kalkulasi (Ambil dari field readonly jika ada isinya)
        nilaiIp: getVal('metodeIndeksPencemaran'),
        statusIp: getVal('statusIP'),
        nilaiStoret: getVal('metodeStoret'),
        statusStoret: getVal('statusStoret')
    };
}

/**
 * Fitur 1: Hitung IP (Preview)
 */
async function calculateIP() {
    console.log("🔄 Menghitung IP...");
    const payload = getFormData();

    try {
        // Panggil command Rust 'calculate_ip_preview'
        // Return tuple: [Score, Status]
        const [score, status] = await invoke('calculate_ip_preview', { data: payload });
        
        // Tampilkan ke UI
        const inputNilai = document.getElementById('metodeIndeksPencemaran');
        const inputStatus = document.getElementById('statusIP');
        
        if (inputNilai) inputNilai.value = score;
        if (inputStatus) inputStatus.value = status;

        // Visual Feedback (Warna status)
        if (status.includes("Baik") || status.includes("Memenuhi")) {
            inputStatus.style.color = "green";
        } else if (status.includes("Ringan")) {
            inputStatus.style.color = "#f39c12"; // Orange
        } else {
            inputStatus.style.color = "red";
        }

        // alert(`✅ Hasil IP: ${score} (${status})`); // Opsional
    } catch (error) {
        console.error("Gagal menghitung:", error);
        alert("❌ Gagal menghitung IP: " + error);
    }
}

/**
 * Fitur 2: Simpan Data
 */
async function saveData() {
    // Pastikan user menghitung IP dulu (Opsional, atau bisa auto-calc)
    // Di sini kita ambil data TERBARU dari form (termasuk hasil hitung IP jika sudah diisi fieldnya)
    const payload = getFormData();

    console.log("📤 Mengirim data simpan:", payload);

    try {
        const response = await invoke('submit_kualitas_air', { data: payload });
        alert("✅ SUKSES: " + response);
    } catch (error) {
        console.error("Gagal menyimpan:", error);
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
    }
}