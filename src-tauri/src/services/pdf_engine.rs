use crate::models::kualitas_air::KualitasAirRecord;

/// Fungsi Utama Parsing PDF
pub fn parse_pdf(file_path: String) -> Result<KualitasAirRecord, String> {
    // 1. Baca File
    println!("📂 Membaca PDF dari: {}", file_path);
    let content = pdf_extract::extract_text(&file_path)
        .map_err(|e| format!("Gagal membaca PDF: {}", e))?;

    println!("\n=== MULAI EKSTRAKSI DATA ===");

    // 2. Inisialisasi Struct Kosong
    let mut data = KualitasAirRecord {
        id: None,
        // Metadata
        nama_pos: None, das: None, wilayah_sungai: None, provinsi: None, kabupaten: None,
        tahun: None, elevasi_pos: None, pelaksana: None, kecamatan: None, laboratorium: None,
        sungai: None, desa: None, koordinat_geografis: None,
        tanggal_sampling: None, waktu_sampling: None,
        // Parameter
        temperatur: None, konduktivitas: None, kekeruhan: None, oksigen: None, ph: None,
        tds: None, tss: None, warna: None, klorida: None, amoniak: None, nitrat: None,
        nitrit: None, fosfat: None, deterjen: None, arsen: None, besi: None, mangan: None,
        tembaga: None, merkuri: None, sianida: None, fluorida: None, belerang: None,
        cod: None, bod: None, minyak_dan_lemak: None, fenol: None, total_coliform: None,
        debit: None,
        // Hasil
        nilai_ip: None, status_ip: None, nilai_storet: None, status_storet: None,
        created_at: None,
    };

    // 3. Iterasi Per Baris
    for line in content.lines() {
        let text = line.trim();
        if text.is_empty() { continue; }

        // --- FISIKA ---
        if text.contains("TSS") || text.contains("Zat Padat Tersuspensi") {
            data.tss = extract_sni_value(text, "TSS");
        }
        else if text.contains("TDS") || text.contains("Zat Padat Terlarut") {
            data.tds = extract_sni_value(text, "TDS");
        }
        else if text.contains("Warna") {
            data.warna = extract_sni_value(text, "Warna");
        }
        else if text.contains("Temperatur") || text.contains("Suhu") {
            data.temperatur = extract_sni_value(text, "Temperatur");
        }

        // --- KIMIA ---
        else if text.contains("Amoniak") {
            data.amoniak = extract_sni_value(text, "Amoniak");
        }
        else if text.contains("Nitrat") && !text.contains("Nitrit") { 
            data.nitrat = extract_sni_value(text, "Nitrat");
        }
        else if text.contains("Nitrit") {
            data.nitrit = extract_sni_value(text, "Nitrit");
        }
        else if text.contains("COD") {
            data.cod = extract_sni_value(text, "COD");
        }
        else if text.contains("BOD") {
            data.bod = extract_sni_value(text, "BOD");
        }
        else if text.contains("Detergen") || text.contains("Deterjen") {
            data.deterjen = extract_sni_value(text, "Deterjen");
        }
        else if text.contains("Minyak") && text.contains("lemak") {
            data.minyak_dan_lemak = extract_sni_value(text, "Minyak Lemak");
        }
        else if text.contains("Fenol") {
            data.fenol = extract_sni_value(text, "Fenol");
        }
        else if text.contains("Sianida") {
            data.sianida = extract_sni_value(text, "Sianida");
        }
        else if text.contains("Fluorida") {
            data.fluorida = extract_sni_value(text, "Fluorida");
        }
        else if text.contains("Klorida") {
            data.klorida = extract_sni_value(text, "Klorida");
        }
        else if text.contains("Besi") {
            data.besi = extract_sni_value(text, "Besi");
        }
        else if text.contains("Fosfat") {
            data.fosfat = extract_sni_value(text, "Fosfat");
        }
        else if text.contains("Tembaga") {
            data.tembaga = extract_sni_value(text, "Tembaga");
        }
        else if text.contains("Mangan") {
            data.mangan = extract_sni_value(text, "Mangan");
        }
        else if text.contains("Arsen") {
            data.arsen = extract_sni_value(text, "Arsen");
        }
        else if text.contains("Merkuri") {
            data.merkuri = extract_sni_value(text, "Merkuri");
        }
        else if text.contains("Belerang") || text.contains("H2S") {
            data.belerang = extract_sni_value(text, "Belerang");
        }

        // --- MIKROBIOLOGI ---
        else if text.contains("Total Coliform") || text.contains("Koliform") {
            data.total_coliform = extract_sni_value(text, "Total Coliform");
        }
    }

    println!("=== SELESAI ===\n");
    Ok(data)
}

/// Helper: Logika Jangkar SNI + Limit Deteksi (Mendeteksi '<' yang terpisah spasi)
fn extract_sni_value(raw_line: &str, param_name: &str) -> Option<f64> {
    // 1. Cek keberadaan "SNI"
    let split_idx = raw_line.to_uppercase().find("SNI");

    match split_idx {
        Some(idx) => {
            // 2. Ambil Bagian KIRI dari SNI
            let left_part = &raw_line[..idx].trim();
            
            // 3. Pecah berdasarkan Spasi
            let parts: Vec<&str> = left_part.split_whitespace().collect();

            // 4. Ambil Elemen TERAKHIR (Angka Potensial)
            if let Some(last_word) = parts.last() {
                
                // --- LOGIKA DETEKSI TANDA KURANG DARI (<) ---
                let mut is_less_than = last_word.contains('<'); // Cek jika menempel (<0,01)

                // Cek jika terpisah spasi (elemen sebelumnya adalah <)
                if !is_less_than && parts.len() >= 2 {
                    if let Some(prev_word) = parts.get(parts.len() - 2) {
                        if prev_word.contains('<') {
                            is_less_than = true;
                        }
                    }
                }
                
                // Bersihkan string (hapus koma, hapus tanda <, >)
                let clean_str = last_word.replace(',', ".").replace("<", "").replace(">", "");
                
                // Parse ke Float
                match clean_str.parse::<f64>() {
                    Ok(mut val) => {
                        // Jika terdeteksi Limit (<), turunkan nilai (x 0.99)
                        if is_less_than {
                            val = val * 0.99;
                        }

                        // Log Simpel: Nama Parameter -> Nilai Akhir
                        println!("[OK] {}: {}", param_name, val);
                        return Some(val);
                    },
                    Err(_) => {
                        // Silent fail jika bukan angka
                    }
                }
            }
        },
        None => {
            // Skip baris tanpa SNI
        }
    }
    None
}