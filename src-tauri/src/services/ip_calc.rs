use crate::models::kualitas_air::KualitasAirRecord;

// Enum untuk membedakan jenis parameter
enum ParameterType {
    Direct,  // Semakin kecil semakin baik (TSS, BOD, Logam, Deviasi Suhu, dll)
    Inverse, // Semakin besar semakin baik (DO / Oksigen)
}

/// Fungsi Utama Menghitung Indeks Pencemaran (IP)
/// Sesuai Kepmen LH No. 115 Tahun 2003
/// Revisi: Logaritma Perataan & Temperatur Deviasi 3
pub fn calculate_ip(data: &KualitasAirRecord) -> (f64, String) {
    let mut ratios: Vec<f64> = Vec::new();

    // =====================================================================
    // HELPER: Transformasi Logaritma
    // =====================================================================
    // Jika C/L > 1, gunakan rumus: 1 + 5 * log10(C/L)
    // Jika C/L <= 1, gunakan nilai asli.
    let mut add_ratio = |val: Option<f64>, baku: f64, jenis: ParameterType| {
        if let Some(c) = val {
            // 1. Hitung Rasio Awal (Raw Ratio)
            let raw_ratio = match jenis {
                ParameterType::Direct => c / baku,      // Kasus Normal (C/L)
                ParameterType::Inverse => baku / c,     // Kasus Terbalik (L/C) -> Misal DO
            };

            // 2. Evaluasi Nilai Rentang (Transformasi Logaritma)
            let final_ratio = if raw_ratio <= 1.0 {
                // Memenuhi baku mutu, pakai nilai asli
                raw_ratio 
            } else {
                // Melampaui baku mutu, pakai logaritma (Smoothing)
                // Rumus: 1 + 5 * log10(R)
                1.0 + (5.0 * raw_ratio.log10())
            };

            ratios.push(final_ratio);
        }
    };

    // =====================================================================
    // GRUP 1: PARAMETER FISIKA & KIMIA (DIRECT / PENCEMAR BIASA)
    // =====================================================================
    // Logic: Semakin tinggi nilai, semakin buruk (C/L)
    
    // -- Fisika --
    add_ratio(data.tds, 1000.0, ParameterType::Direct);
    add_ratio(data.tss, 50.0, ParameterType::Direct);
    add_ratio(data.warna, 50.0, ParameterType::Direct);

    // -- Nutrient --
    add_ratio(data.amoniak, 0.2, ParameterType::Direct);
    add_ratio(data.nitrat, 10.0, ParameterType::Direct);
    add_ratio(data.nitrit, 0.06, ParameterType::Direct);
    add_ratio(data.fosfat, 0.2, ParameterType::Direct);
    add_ratio(data.deterjen, 0.2, ParameterType::Direct);

    // -- Logam Berat --
    add_ratio(data.arsen, 0.05, ParameterType::Direct);
    add_ratio(data.mangan, 0.4, ParameterType::Direct);
    add_ratio(data.tembaga, 0.02, ParameterType::Direct);
    add_ratio(data.merkuri, 0.002, ParameterType::Direct);
    
    // -- Anorganik Lain --
    add_ratio(data.sianida, 0.02, ParameterType::Direct);
    add_ratio(data.fluorida, 1.5, ParameterType::Direct);
    add_ratio(data.klorida, 300.0, ParameterType::Direct); 
    add_ratio(data.belerang, 0.002, ParameterType::Direct);

    // -- Organik --
    add_ratio(data.cod, 25.0, ParameterType::Direct);
    add_ratio(data.bod, 3.0, ParameterType::Direct);
    add_ratio(data.minyak_dan_lemak, 1.0, ParameterType::Direct);
    add_ratio(data.fenol, 0.005, ParameterType::Direct);

    // -- Mikrobiologi --
    add_ratio(data.total_coliform, 1000.0, ParameterType::Direct);


    // =====================================================================
    // GRUP 2: PARAMETER TERBALIK (INVERSE) - OKSIGEN TERLARUT (DO)
    // =====================================================================
    // Logic: Semakin tinggi nilai, semakin BAIK (L/C). 
    add_ratio(data.oksigen, 4.0, ParameterType::Inverse);


    // =====================================================================
    // GRUP 3: PARAMETER KHUSUS (TEMPERATURE & pH)
    // =====================================================================
    
    // 1. TEMPERATUR (Deviasi 3)
    // Baku Mutu: Deviasi 3 derajat dari suhu alamiah.
    // Karena belum ada input suhu alamiah, kita asumsi rata-rata tropis = 27.0 C
    if let Some(val) = data.temperatur {
        let suhu_alamiah_default = 27.0; 
        
        // Hitung selisih mutlak (Deviasi)
        let deviasi = (val - suhu_alamiah_default).abs();
        
        // Baku mutu deviasi adalah 3
        let baku_deviasi = 3.0;

        // Masukkan sebagai parameter Direct (Semakin besar deviasi, semakin buruk)
        add_ratio(Some(deviasi), baku_deviasi, ParameterType::Direct);
    }

    // 2. pH (Rentang 6 - 9)
    // Logic: Hitung jarak dari rentang terdekat.
    if let Some(val) = data.ph {
        let raw_ratio = if val < 6.0 {
            // Terlalu Asam: Baku Min / Nilai -> 6.0 / 5.0 = 1.2
            6.0 / val
        } else if val > 9.0 {
            // Terlalu Basa: Nilai / Baku Max -> 10.0 / 9.0 = 1.11
            val / 9.0
        } else {
            // Normal (Memenuhi)
            // Dalam logaritma smoothing, nilai memenuhi baku mutu (<=1) tidak di-log
            // Kita beri nilai kecil (misal 0.1) atau maksimal 1.0
            1.0 
        };
        
        // Terapkan Logaritma jika > 1.0
        if raw_ratio > 1.0 {
            ratios.push(1.0 + (5.0 * raw_ratio.log10()));
        } else {
            ratios.push(raw_ratio);
        }
    }

    // =====================================================================
    // FINAL CALCULATION (MAX & AVG)
    // =====================================================================
    
    if ratios.is_empty() {
        return (0.0, "Data Kosong".to_string());
    }

    // Cari Max & Avg dari rasio yang SUDAH DITRANSFORMASI
    // fold dipakai karena f64 tidak bisa pakai .max() langsung
    let max_r = ratios.iter().fold(0.0/0.0, |m, v| v.max(m)); 
    
    let sum_r: f64 = ratios.iter().sum();
    let avg_r = sum_r / ratios.len() as f64;

    // Rumus Akar IP (Nemerow)
    let pi_score = ((max_r.powi(2) + avg_r.powi(2)) / 2.0).sqrt();

    // Status Mutu (Kepmen LH 115/2003)
    let status = if pi_score <= 1.0 {
        "Memenuhi Baku Mutu".to_string()
    } else if pi_score <= 5.0 {
        "Cemar Ringan".to_string()
    } else if pi_score <= 10.0 {
        "Cemar Sedang".to_string()
    } else {
        "Cemar Berat".to_string()
    };

    // Return 2 desimal
    let final_score = (pi_score * 100.0).round() / 100.0;
    (final_score, status)
}