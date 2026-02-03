// ===========================================================
// MODULE CETAK KUALITAS AIR
// ===========================================================
// > menangani logika pemuatan html
// > populasi data
// > export pdf atau export excel
// -----------------------------------------------------------

// ===========================================================
// initPrintSystem: mengambil template html dan injeksi ke
// dalam kontainer modal
// ===========================================================
export async function initPrintSystem(containerId) {
    try {
        console.log("📄 Loading print template...");
        const response = await fetch('./pages/cetak-kualitas-air.html');
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const html = await response.text();
        const container = document.getElementById(containerId);
        
        if (container) {
            container.innerHTML = html;
            console.log("✅ Print template loaded successfully");
        } else {
            console.error(`❌ Container with ID '${containerId}' not found`);
        }
    } catch (error) {
        console.error("❌ Failed to load print template:", error);
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `<div style="color:red; padding:20px; text-align:center;">Gagal memuat template laporan.<br>${error.message}</div>`;
        }
    }
}

/**
 * Mengisi Template Laporan dengan Data Record
 * @param {Object} record - Data raw dari database
 */
export function populatePrintTemplate(record) {
    if (!record) return;

    console.log("🖨️ Populating print template for:", record.nama_pos);

    // 1. Populate Metadata
    setVal('lap_namaPos', record.nama_pos);
    
    // Gabungkan DAS / Sungai
    const dasSungai = [record.das, record.sungai].filter(Boolean).join(' / ');
    setVal('lap_das', dasSungai);
    
    setVal('lap_wilayahSungai', record.wilayah_sungai);
    
    // Gabungkan Desa / Kecamatan
    const desaKec = [record.desa, record.kecamatan].filter(Boolean).join(' / ');
    setVal('lap_desa_kecamatan', desaKec);
    
    // Gabungkan Kab / Prov
    const kabProv = [record.kabupaten, record.provinsi].filter(Boolean).join(' / ');
    setVal('lap_kab_prov', kabProv);
    
    setVal('lap_tanggal', formatDate(record.tanggal_sampling));
    setVal('lap_waktu', record.waktu_sampling);
    
    setVal('lap_pelaksana', record.pelaksana);
    setVal('lap_laboratorium', record.laboratorium);
    setVal('lap_koordinat', record.koordinat_geografis);

    // 2. Populate Parameters
    // Fisika
    setNum('lap_temperatur', record.temperatur);
    setNum('lap_konduktivitas', record.konduktivitas);
    setNum('lap_kekeruhan', record.kekeruhan);
    setNum('lap_oksigen', record.oksigen);
    setNum('lap_ph', record.ph);
    setNum('lap_tds', record.tds);
    setNum('lap_tss', record.tss);
    setNum('lap_warna', record.warna);
    
    // Kimia & Ion
    setNum('lap_klorida', record.klorida);
    setNum('lap_amoniak', record.amoniak);
    setNum('lap_nitrat', record.nitrat);
    setNum('lap_nitrit', record.nitrit);
    setNum('lap_fosfat', record.fosfat);
    setNum('lap_deterjen', record.deterjen);
    
    // Logam Berat
    setNum('lap_arsen', record.arsen);
    setNum('lap_besi', record.besi);
    setNum('lap_mangan', record.mangan);
    setNum('lap_tembaga', record.tembaga);
    setNum('lap_merkuri', record.merkuri);
    setNum('lap_sianida', record.sianida);
    setNum('lap_fluorida', record.fluorida);
    setNum('lap_belerang', record.belerang);
    
    // Organik
    setNum('lap_cod', record.cod);
    setNum('lap_bod', record.bod);
    setNum('lap_minyakDanLemak', record.minyakDanLemak || record.minyak_dan_lemak);
    setNum('lap_fenol', record.fenol);
    
    // Mikro & Lainnya
    setNum('lap_totalColiform', record.totalColiform || record.total_coliform);
    setNum('lap_debit', record.debit);

    // 3. Hasil Perhitungan
    setNum('lap_nilaiIp', record.nilaiIp || record.nilai_ip);
    setVal('lap_statusIp', record.statusIp || record.status_ip);
}

/**
 * Eksekusi Perintah Cetak Browser dengan Delay
 * Menggunakan async/await agar rendering selesai sebelum print dialog muncul
 */
export async function executePrint() {
    console.log("⏳ Menyiapkan dokumen cetak...");
    
    // Ubah kursor jadi loading agar user tahu proses sedang berjalan
    document.body.style.cursor = 'wait';

    // Tunggu 800ms (0.8 detik) agar browser selesai me-render nilai input
    await wait(800);

    // Kembalikan kursor
    document.body.style.cursor = 'default';

    // Eksekusi print
    console.log("🖨️ Membuka dialog print...");
    window.print();
}

// ============================================
// INTERNAL HELPER FUNCTIONS
// ============================================

// Fungsi Wait (Promise-based setTimeout)
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function setVal(id, val) {
    const el = document.getElementById(id);
    if (el) {
        el.value = (val === null || val === undefined || val === '') ? '-' : val;
    }
}

function setNum(id, val) {
    const el = document.getElementById(id);
    if (el) {
        if (val === null || val === undefined || isNaN(val)) {
            el.value = '-';
        } else {
            el.value = Number(val).toFixed(2);
        }
    }
}

function formatDate(dateString) {
    if (!dateString) return '-';
    try {
        const parts = dateString.split(' ')[0].split('-');
        if (parts.length === 3 && parts[0].length === 4) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
    } catch (e) { return dateString; }
    return dateString;
}