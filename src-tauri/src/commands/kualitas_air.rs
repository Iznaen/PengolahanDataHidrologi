use tauri::{State, command, AppHandle}; 
use sqlx::SqlitePool;
use crate::models::kualitas_air::KualitasAirRecord;
use crate::services;
use tauri_plugin_dialog::DialogExt; 

// --- COMMAND 1: SIMPAN DATA (DENGAN DEBUGGING LENGKAP) ---
#[command]
pub async fn submit_kualitas_air(
    pool: State<'_, SqlitePool>, 
    data: KualitasAirRecord
) -> Result<String, String> {

    // 1. Log Start (Mata-mata Backend)
    println!("🦀 [RUST] 1. Request Diterima. Mulai proses SQL...");
    println!("      -> Nama Pos: {:?}", data.nama_pos);
    
    // 2. Definisi SQL
    let sql = "
        INSERT INTO kualitas_air (
            nama_pos, das, wilayah_sungai, provinsi, kabupaten, tahun,
            elevasi_pos, pelaksana, kecamatan, laboratorium, sungai, desa, koordinat_geografis,
            tanggal_sampling, waktu_sampling,
            temperatur, konduktivitas, kekeruhan, oksigen, ph, tds, tss, warna,
            klorida, amoniak, nitrat, nitrit, fosfat, deterjen,
            arsen, besi, mangan, tembaga, merkuri,
            sianida, fluorida, belerang,
            cod, bod, minyak_dan_lemak, fenol,
            total_coliform, debit,
            nilai_ip, status_ip, nilai_storet, status_storet
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
            $14, $15,
            $16, $17, $18, $19, $20, $21, $22, $23,
            $24, $25, $26, $27, $28, $29,
            $30, $31, $32, $33, $34,
            $35, $36, $37,
            $38, $39, $40, $41,
            $42, $43,
            $44, $45, $46, $47
        )
    ";

    // 3. Eksekusi Query dengan Penanganan Error Eksplisit (Match Block)
    let result = sqlx::query(sql)
        .bind(&data.nama_pos)
        .bind(&data.das)
        .bind(&data.wilayah_sungai)
        .bind(&data.provinsi)
        .bind(&data.kabupaten)
        .bind(&data.tahun)
        .bind(&data.elevasi_pos)
        .bind(&data.pelaksana)
        .bind(&data.kecamatan)
        .bind(&data.laboratorium)
        .bind(&data.sungai)
        .bind(&data.desa)
        .bind(&data.koordinat_geografis)
        // Waktu
        .bind(&data.tanggal_sampling)
        .bind(&data.waktu_sampling)
        // Fisika
        .bind(&data.temperatur)
        .bind(&data.konduktivitas)
        .bind(&data.kekeruhan)
        .bind(&data.oksigen)
        .bind(&data.ph)
        .bind(&data.tds)
        .bind(&data.tss)
        .bind(&data.warna)
        // Ion
        .bind(&data.klorida)
        // Nutrient
        .bind(&data.amoniak)
        .bind(&data.nitrat)
        .bind(&data.nitrit)
        .bind(&data.fosfat)
        .bind(&data.deterjen)
        // Logam
        .bind(&data.arsen)
        .bind(&data.besi)
        .bind(&data.mangan)
        .bind(&data.tembaga)
        .bind(&data.merkuri)
        // Anorganik
        .bind(&data.sianida)
        .bind(&data.fluorida)
        .bind(&data.belerang)
        // Organik
        .bind(&data.cod)
        .bind(&data.bod)
        .bind(&data.minyak_dan_lemak)
        .bind(&data.fenol)
        // Mikro
        .bind(&data.total_coliform)
        // Lain
        .bind(&data.debit)
        // Hasil Hitung
        .bind(&data.nilai_ip)
        .bind(&data.status_ip)
        .bind(&data.nilai_storet)
        .bind(&data.status_storet)
        .execute(pool.inner())
        .await;

    // 4. Cek Hasil dan Lapor ke Terminal
    match result {
        Ok(_) => {
            println!("✅ [RUST] 2. Query Berhasil! Data tersimpan.");
            Ok("Data berhasil disimpan ke database Local!".to_string())
        }
        Err(e) => {
            println!("❌ [RUST] 2. QUERY GAGAL: {:?}", e);
            // Kembalikan error detail agar bisa dibaca di frontend
            Err(format!("Gagal menyimpan data: {}", e))
        }
    }
}


// --- COMMAND 2: HITUNG IP (TETAP ADA) ---
#[command]
pub async fn calculate_ip_preview(data: KualitasAirRecord) -> Result<(f64, String), String> {
    let result = services::ip_calc::calculate_ip(&data);
    Ok(result)
}


// --- COMMAND 3: IMPORT PDF (TETAP ADA) ---
#[command]
pub async fn import_pdf(app: AppHandle) -> Result<KualitasAirRecord, String> {
    // 1. Buka Dialog Native
    let file_path = app.dialog()
        .file()
        .add_filter("PDF Files", &["pdf"])
        .blocking_pick_file();

    // 2. Cek Hasil Pilihan
    match file_path {
        Some(path) => {
            let path_str = path.to_string();
            // Panggil service pdf_engine
            let result = services::pdf_engine::parse_pdf(path_str)?;
            Ok(result)
        },
        None => {
            Err("Pemilihan file dibatalkan".to_string())
        }
    }
}


// --- COMMAND 4: AMBIL SEMUA DATA (BARU) ---
#[command]
pub async fn get_all_kualitas_air(pool: State<'_, SqlitePool>) -> Result<Vec<KualitasAirRecord>, String> {
    let sql = "SELECT * FROM kualitas_air ORDER BY id DESC";
    
    let rows = sqlx::query_as::<_, KualitasAirRecord>(sql)
        .fetch_all(pool.inner())
        .await
        .map_err(|e| format!("Gagal mengambil data: {}", e))?;

    Ok(rows)
}