use sqlx::{sqlite::SqliteQueryResult, Sqlite, SqlitePool, migrate::MigrateDatabase};
use std::fs;
use tauri::{Manager, AppHandle};

// Nama file database
const DB_FILENAME: &str = "data_hidrologi.db";

/// Inisialisasi Database: Cek file, buat jika tidak ada, dan lakukan migrasi tabel
pub async fn init_db(app_handle: &AppHandle) -> Result<SqlitePool, String> {
    // 1. Tentukan lokasi penyimpanan (AppLocalData)
    let app_dir = app_handle.path().app_local_data_dir()
        .map_err(|e| format!("Gagal mendapatkan direktori app: {}", e))?;

    // Pastikan folder ada
    if !app_dir.exists() {
        fs::create_dir_all(&app_dir)
            .map_err(|e| format!("Gagal membuat direktori: {}", e))?;
    }

    let db_path = app_dir.join(DB_FILENAME);
    let db_url = format!("sqlite://{}", db_path.to_str().unwrap());

    // 2. Buat file DB jika belum ada
    if !Sqlite::database_exists(&db_url).await.unwrap_or(false) {
        Sqlite::create_database(&db_url).await
            .map_err(|e| format!("Gagal membuat database file: {}", e))?;
    }

    // 3. Koneksi ke Database
    let pool = SqlitePool::connect(&db_url).await
        .map_err(|e| format!("Gagal koneksi ke database: {}", e))?;

    // 4. Jalankan Migrasi (Buat Tabel)
    create_tables(&pool).await
        .map_err(|e| format!("Gagal membuat tabel: {}", e))?;

    println!("Database terhubung di: {:?}", db_path);
    Ok(pool)
}

/// Fungsi untuk membuat struktur tabel
async fn create_tables(pool: &SqlitePool) -> Result<SqliteQueryResult, sqlx::Error> {
    // Query ini HARUS cocok dengan struct KualitasAirRecord di models/kualitas_air.rs
    let query = "
    CREATE TABLE IF NOT EXISTS kualitas_air (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        
        -- Metadata Header
        nama_pos TEXT,
        das TEXT,
        wilayah_sungai TEXT,
        provinsi TEXT,
        kabupaten TEXT,
        tahun INTEGER,
        elevasi_pos TEXT,
        pelaksana TEXT,
        kecamatan TEXT,
        laboratorium TEXT,
        sungai TEXT,
        desa TEXT,
        koordinat_geografis TEXT,

        -- Waktu
        tanggal_sampling TEXT,
        waktu_sampling TEXT,

        -- Parameter Fisika & Umum
        temperatur REAL,
        konduktivitas REAL,
        kekeruhan REAL,
        oksigen REAL,
        ph REAL,
        tds REAL,
        tss REAL,
        warna REAL,

        -- Major Ion
        klorida REAL,

        -- Nutrient
        amoniak REAL,
        nitrat REAL,
        nitrit REAL,
        fosfat REAL,
        deterjen REAL,

        -- Logam Berat
        arsen REAL,
        besi REAL,
        mangan REAL,
        tembaga REAL,
        merkuri REAL,

        -- Anorganik Lain
        sianida REAL,
        fluorida REAL,
        belerang REAL,

        -- Organik
        cod REAL,
        bod REAL,
        minyak_dan_lemak REAL,
        fenol REAL,

        -- Mikrobiologi
        total_coliform REAL,

        -- Lain-lain
        debit REAL,

        -- HASIL KALKULASI (OUTPUT)
        nilai_ip REAL,
        status_ip TEXT,
        nilai_storet REAL,
        status_storet TEXT,

        -- System
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    ";

    sqlx::query(query).execute(pool).await
}