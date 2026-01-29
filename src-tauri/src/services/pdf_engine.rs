use crate::models::kualitas_air::KualitasAirRecord;
use regex::Regex;

pub fn parse_pdf(file_path: String) -> Result<KualitasAirRecord, String> {
    println!("📂 Membaca PDF dari: {}", file_path);
    let content = pdf_extract::extract_text(&file_path)
        .map_err(|e| format!("Gagal membaca PDF: {}", e))?;

    println!("\n=== MULAI EKSTRAKSI (GLOBAL SEARCH PATTERN) ===");

    let mut data = KualitasAirRecord {
        id: None,
        nama_pos: None, das: None, wilayah_sungai: None, provinsi: None, kabupaten: None,
        tahun: None, elevasi_pos: None, pelaksana: None, kecamatan: None, laboratorium: None,
        sungai: None, desa: None, koordinat_geografis: None,
        tanggal_sampling: None, waktu_sampling: None,
        
        temperatur: None, konduktivitas: None, kekeruhan: None, oksigen: None, ph: None,
        tds: None, tss: None, warna: None, klorida: None, amoniak: None, nitrat: None,
        nitrit: None, fosfat: None, deterjen: None, arsen: None, besi: None, mangan: None,
        tembaga: None, merkuri: None, sianida: None, fluorida: None, belerang: None,
        cod: None, bod: None, minyak_dan_lemak: None, fenol: None, total_coliform: None,
        debit: None,
        
        nilai_ip: None, status_ip: None, nilai_storet: None, status_storet: None,
        created_at: None,
    };

    let lines: Vec<&str> = content.lines().collect();

    // --- STRATEGI 1: PENCARIAN METADATA GLOBAL ---
    
    for line in &lines {
        let text = line.trim();
        if text.is_empty() { continue; }

        // 1. CARI LOKASI (Keyword: "AWLR")
        if text.contains("AWLR") {
            let val = text.replace(":", "").trim().to_string();
            println!("[META] Lokasi Ditemukan: {}", val);
            data.nama_pos = Some(val);
        }

        // 2. CARI KOORDINAT (Keyword: "S:" dan "E:" dan "°")
        if text.contains("S:") && text.contains("E:") && text.contains("°") {
             // FIX: Menghapus variabel 'val' yang tidak terpakai
             let clean_coord = text.replace("Titik Koordinat", "").trim().to_string();
             println!("[META] Koordinat Ditemukan: {}", clean_coord);
             data.koordinat_geografis = Some(clean_coord);
        }

        // 3. CARI TANGGAL (Pola Regex)
        if data.tanggal_sampling.is_none() {
            let re_date = Regex::new(r"(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{4})").unwrap();
            
            if let Some(caps) = re_date.captures(text) {
                let is_sampling = text.contains("Tgl sampling");
                let is_penerimaan = text.contains("Tgl Penerimaan");
                
                if is_sampling || is_penerimaan {
                    let raw_date = caps.get(0).unwrap().as_str();
                    if let Some(formatted) = convert_indo_date(raw_date) {
                         println!("[META] Tanggal Ditemukan ({}) : {} -> {}", 
                            if is_sampling { "Sampling" } else { "Penerimaan" }, 
                            raw_date, formatted);
                         data.tanggal_sampling = Some(formatted);
                    }
                }
            }
        }
    }


    // --- STRATEGI 2: PARAMETER (LOGIKA SNI) ---
    for line in &lines {
        let text = line.trim();
        if text.is_empty() { continue; }

        if text.contains("TSS") || text.contains("Zat Padat Tersuspensi") { data.tss = extract_sni_value(text, "TSS"); }
        else if text.contains("TDS") || text.contains("Zat Padat Terlarut") { data.tds = extract_sni_value(text, "TDS"); }
        else if text.contains("Warna") { data.warna = extract_sni_value(text, "Warna"); }
        else if text.contains("Temperatur") || text.contains("Suhu") { data.temperatur = extract_sni_value(text, "Temperatur"); }

        else if text.contains("Amoniak") { data.amoniak = extract_sni_value(text, "Amoniak"); }
        else if text.contains("Nitrat") && !text.contains("Nitrit") { data.nitrat = extract_sni_value(text, "Nitrat"); }
        else if text.contains("Nitrit") { data.nitrit = extract_sni_value(text, "Nitrit"); }
        else if text.contains("COD") { data.cod = extract_sni_value(text, "COD"); }
        else if text.contains("BOD") { data.bod = extract_sni_value(text, "BOD"); }
        else if text.contains("Detergen") || text.contains("Deterjen") { data.deterjen = extract_sni_value(text, "Deterjen"); }
        else if text.contains("Minyak") && text.contains("lemak") { data.minyak_dan_lemak = extract_sni_value(text, "Minyak Lemak"); }
        else if text.contains("Fenol") { data.fenol = extract_sni_value(text, "Fenol"); }
        else if text.contains("Sianida") { data.sianida = extract_sni_value(text, "Sianida"); }
        else if text.contains("Fluorida") { data.fluorida = extract_sni_value(text, "Fluorida"); }
        else if text.contains("Klorida") { data.klorida = extract_sni_value(text, "Klorida"); }
        else if text.contains("Besi") { data.besi = extract_sni_value(text, "Besi"); }
        else if text.contains("Fosfat") { data.fosfat = extract_sni_value(text, "Fosfat"); }
        else if text.contains("Tembaga") { data.tembaga = extract_sni_value(text, "Tembaga"); }
        else if text.contains("Mangan") { data.mangan = extract_sni_value(text, "Mangan"); }
        else if text.contains("Arsen") { data.arsen = extract_sni_value(text, "Arsen"); }
        else if text.contains("Merkuri") { data.merkuri = extract_sni_value(text, "Merkuri"); }
        else if text.contains("Belerang") || text.contains("H2S") { data.belerang = extract_sni_value(text, "Belerang"); }

        else if text.contains("Total Coliform") || text.contains("Koliform") { data.total_coliform = extract_sni_value(text, "Total Coliform"); }
    }

    println!("=== SELESAI ===\n");
    Ok(data)
}

fn convert_indo_date(raw_date: &str) -> Option<String> {
    let parts: Vec<&str> = raw_date.split_whitespace().collect();
    if parts.len() < 3 { return None; }

    let day = parts[0];
    let month_str = parts[1].to_lowercase();
    let year = parts[2];

    let month_num = match month_str.as_str() {
        "januari" | "jan" => "01",
        "februari" | "feb" => "02",
        "maret" | "mar" => "03",
        "april" | "apr" => "04",
        "mei" | "may" => "05",
        "juni" | "jun" => "06",
        "juli" | "jul" => "07",
        "agustus" | "agu" | "aug" => "08",
        "september" | "sep" => "09",
        "oktober" | "okt" | "oct" => "10",
        "november" | "nov" => "11",
        "desember" | "des" | "dec" => "12",
        _ => return None, 
    };
    Some(format!("{}-{}-{}", day, month_num, year))
}

fn extract_sni_value(raw_line: &str, param_name: &str) -> Option<f64> {
    let split_idx = raw_line.to_uppercase().find("SNI");
    match split_idx {
        Some(idx) => {
            let left_part = &raw_line[..idx].trim();
            let parts: Vec<&str> = left_part.split_whitespace().collect();
            if let Some(last_word) = parts.last() {
                let mut is_less_than = last_word.contains('<');
                if !is_less_than && parts.len() >= 2 {
                    if let Some(prev_word) = parts.get(parts.len() - 2) {
                        if prev_word.contains('<') { is_less_than = true; }
                    }
                }
                let clean_str = last_word.replace(',', ".").replace("<", "").replace(">", "");
                match clean_str.parse::<f64>() {
                    Ok(mut val) => {
                        if is_less_than { val = val * 0.99; }
                        println!("[OK] {}: {}", param_name, val);
                        return Some(val);
                    },
                    Err(_) => {}
                }
            }
        },
        None => {}
    }
    None
}