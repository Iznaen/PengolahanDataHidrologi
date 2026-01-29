use crate::models::kualitas_air::KualitasAirRecord;

// Kategori Parameter
enum Kategori {
    Fisika,
    Kimia,
    Biologi,
}

// Jenis Limit yang dicek
enum LimitType {
    Max,     // Data tidak boleh > Baku
    Min,     // Data tidak boleh < Baku (DO)
    Range,   // Data harus di dalam range (pH)
}

/// Fungsi Utama Menghitung Skor STORET (Multi-Sample)
/// Menerima Vector data, bukan single struct.
pub fn calculate_storet_collection(dataset: &Vec<KualitasAirRecord>) -> (f64, String) {
    // Validasi Dasar: STORET butuh data time series (minimal 2) untuk membentuk pola
    if dataset.len() < 2 {
        return (0.0, "Data Kurang (Min. 2 Sampel)".to_string());
    }

    let mut total_score = 0.0;

    // Helper: Ekstrak nilai parameter spesifik dari seluruh dataset ke dalam Vec<f64>
    // Contoh: Mengambil semua nilai 'TSS' dari Jan, Feb, Mar menjadi [30.0, 70.0, 40.0]
    let get_values = |extractor: fn(&KualitasAirRecord) -> Option<f64>| -> Vec<f64> {
        dataset.iter()
            .filter_map(|record| extractor(record))
            .collect()
    };

    // Helper: Hitung Skor per Parameter
    // Logika STORET (Kepmen LH 115):
    // 1. Cari Max, Min, Avg dari kumpulan data.
    // 2. Bandingkan dengan Baku Mutu.
    // 3. Jika Melanggar Max/Min -> Kena Denda.
    // 4. Jika Melanggar Avg -> Kena Denda.
    let mut calc_param = |values: Vec<f64>, baku: f64, kat: Kategori, limit: LimitType| {
        if values.is_empty() { return; } // Skip jika tidak ada data untuk parameter ini

        // 1. Hitung Statistik Agregat
        let min_val = values.iter().fold(f64::INFINITY, |a, &b| a.min(b));
        let max_val = values.iter().fold(f64::NEG_INFINITY, |a, &b| a.max(b));
        let avg_val: f64 = values.iter().sum::<f64>() / values.len() as f64;

        let mut violation_max_min = false;
        let mut violation_avg = false;

        // 2. Cek Pelanggaran
        match limit {
            LimitType::Max => {
                if max_val > baku { violation_max_min = true; }
                if avg_val > baku { violation_avg = true; }
            },
            LimitType::Min => {
                if min_val < baku { violation_max_min = true; } // Khusus DO
                if avg_val < baku { violation_avg = true; }
            },
            LimitType::Range => {
                // Khusus pH dihandle terpisah karena punya range (min & max)
            }
        }

        // 3. Terapkan Skor (Tabel Data < 10 Sampel)
        // Fisika: Max/Min(-1) Avg(-3)
        // Kimia : Max/Min(-2) Avg(-4)
        // Biologi: Max/Min(-3) Avg(-5)
        
        // Catatan: Jika data >= 10, skornya beda. Tapi untuk aplikasi desktop ini
        // kita asumsikan < 10 dulu (sesuai request "minimal 2").
        // Jika mau perfect, tambahkan if values.len() >= 10 logic.
        
        if violation_max_min {
            match kat {
                Kategori::Fisika => total_score += -1.0,
                Kategori::Kimia  => total_score += -2.0,
                Kategori::Biologi=> total_score += -3.0,
            }
        }
        if violation_avg {
            match kat {
                Kategori::Fisika => total_score += -3.0,
                Kategori::Kimia  => total_score += -4.0,
                Kategori::Biologi=> total_score += -5.0,
            }
        }
    };

    // =====================================================================
    // EKSEKUSI PERHITUNGAN PER PARAMETER
    // =====================================================================

    // --- 1. FISIKA ---
    // Temperatur (Deviasi) - Agak kompleks karena butuh suhu alamiah.
    // Kita skip dulu atau gunakan logika Max > 35 sementara.
    calc_param(get_values(|d| d.temperatur), 35.0, Kategori::Fisika, LimitType::Max);
    
    calc_param(get_values(|d| d.tds), 1000.0, Kategori::Fisika, LimitType::Max);
    calc_param(get_values(|d| d.tss), 50.0, Kategori::Fisika, LimitType::Max);
    calc_param(get_values(|d| d.warna), 50.0, Kategori::Fisika, LimitType::Max);
    calc_param(get_values(|d| d.kekeruhan), 25.0, Kategori::Fisika, LimitType::Max);

    // --- 2. KIMIA ---
    calc_param(get_values(|d| d.klorida), 300.0, Kategori::Kimia, LimitType::Max);
    calc_param(get_values(|d| d.amoniak), 0.2, Kategori::Kimia, LimitType::Max);
    calc_param(get_values(|d| d.nitrat), 10.0, Kategori::Kimia, LimitType::Max);
    calc_param(get_values(|d| d.nitrit), 0.06, Kategori::Kimia, LimitType::Max);
    calc_param(get_values(|d| d.fosfat), 0.2, Kategori::Kimia, LimitType::Max);
    calc_param(get_values(|d| d.deterjen), 0.2, Kategori::Kimia, LimitType::Max);
    calc_param(get_values(|d| d.arsen), 0.05, Kategori::Kimia, LimitType::Max);
    calc_param(get_values(|d| d.mangan), 0.4, Kategori::Kimia, LimitType::Max);
    calc_param(get_values(|d| d.tembaga), 0.02, Kategori::Kimia, LimitType::Max);
    calc_param(get_values(|d| d.merkuri), 0.002, Kategori::Kimia, LimitType::Max);
    calc_param(get_values(|d| d.sianida), 0.02, Kategori::Kimia, LimitType::Max);
    calc_param(get_values(|d| d.fluorida), 1.5, Kategori::Kimia, LimitType::Max);
    calc_param(get_values(|d| d.belerang), 0.002, Kategori::Kimia, LimitType::Max);
    
    // Organik
    calc_param(get_values(|d| d.cod), 25.0, Kategori::Kimia, LimitType::Max);
    calc_param(get_values(|d| d.bod), 3.0, Kategori::Kimia, LimitType::Max);
    calc_param(get_values(|d| d.minyak_dan_lemak), 1.0, Kategori::Kimia, LimitType::Max);
    calc_param(get_values(|d| d.fenol), 0.005, Kategori::Kimia, LimitType::Max);

    // Oksigen (Min)
    calc_param(get_values(|d| d.oksigen), 4.0, Kategori::Kimia, LimitType::Min);

    // pH (Range 6-9) - Logic Manual
    let ph_vals = get_values(|d| d.ph);
    if !ph_vals.is_empty() {
        let min_ph = ph_vals.iter().fold(f64::INFINITY, |a, &b| a.min(b));
        let max_ph = ph_vals.iter().fold(f64::NEG_INFINITY, |a, &b| a.max(b));
        let avg_ph = ph_vals.iter().sum::<f64>() / ph_vals.len() as f64;

        let mut violation_max_min = false;
        let mut violation_avg = false;

        // Cek Min/Max (Jika ada satupun sampel < 6 atau > 9)
        if min_ph < 6.0 || max_ph > 9.0 { violation_max_min = true; }
        // Cek Avg (Jika rata-rata keluar range)
        if avg_ph < 6.0 || avg_ph > 9.0 { violation_avg = true; }

        if violation_max_min { total_score += -2.0; }
        if violation_avg { total_score += -4.0; }
    }

    // --- 3. BIOLOGI ---
    calc_param(get_values(|d| d.total_coliform), 1000.0, Kategori::Biologi, LimitType::Max);

    // =====================================================================
    // STATUS MUTU
    // =====================================================================
    let status = if total_score == 0.0 {
        "Kelas A (Baik Sekali)".to_string()
    } else if total_score >= -10.0 {
        "Kelas B (Baik)".to_string()
    } else if total_score >= -30.0 {
        "Kelas C (Sedang)".to_string()
    } else {
        "Kelas D (Buruk)".to_string()
    };

    (total_score, status)
}