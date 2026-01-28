use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::NaiveDateTime;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct KualitasAirRecord {
    pub id: Option<i64>,
    
    // --- METADATA HEADER ---
    pub nama_pos: Option<String>,
    pub das: Option<String>,
    pub wilayah_sungai: Option<String>,
    pub provinsi: Option<String>,
    pub kabupaten: Option<String>,
    pub tahun: Option<i32>,
    pub elevasi_pos: Option<String>,
    pub pelaksana: Option<String>,
    pub kecamatan: Option<String>,
    pub laboratorium: Option<String>,
    pub sungai: Option<String>,
    pub desa: Option<String>,
    pub koordinat_geografis: Option<String>,

    // --- WAKTU SAMPLING ---
    pub tanggal_sampling: Option<String>,
    pub waktu_sampling: Option<String>,
    
    // --- PARAMETER KUALITAS AIR ---
    // 1. Variabel Umum
    pub temperatur: Option<f64>,
    pub konduktivitas: Option<f64>,
    pub kekeruhan: Option<f64>,
    pub oksigen: Option<f64>, // DO
    pub ph: Option<f64>,
    pub tds: Option<f64>,
    pub tss: Option<f64>,
    pub warna: Option<f64>,

    // 2. Major Ion
    pub klorida: Option<f64>,

    // 3. Nutrient
    pub amoniak: Option<f64>,
    pub nitrat: Option<f64>,
    pub nitrit: Option<f64>,
    pub fosfat: Option<f64>,
    pub deterjen: Option<f64>,

    // 4. Logam Berat
    pub arsen: Option<f64>,
    pub besi: Option<f64>,
    pub mangan: Option<f64>,
    pub tembaga: Option<f64>,
    pub merkuri: Option<f64>,

    // 5. Anorganik Lain
    pub sianida: Option<f64>,
    pub fluorida: Option<f64>,
    pub belerang: Option<f64>,

    // 6. Organik
    pub cod: Option<f64>,
    pub bod: Option<f64>,
    
    #[serde(rename = "minyakDanLemak")]
    #[sqlx(rename = "minyak_dan_lemak")] 
    pub minyak_dan_lemak: Option<f64>,

    pub fenol: Option<f64>,

    // 7. Mikrobiologi
    #[serde(rename = "totalColiform")]
    #[sqlx(rename = "total_coliform")]
    pub total_coliform: Option<f64>,

    // 8. Lain-lain
    pub debit: Option<f64>,

    // --- HASIL KALKULASI (OUTPUT) ---
    // Kita simpan agar bisa di-query & report tanpa hitung ulang
    
    #[sqlx(rename = "nilai_ip")]
    #[serde(rename = "nilaiIp")]
    pub nilai_ip: Option<f64>, // Contoh: 5.2

    #[sqlx(rename = "status_ip")]
    #[serde(rename = "statusIp")]
    pub status_ip: Option<String>, // Contoh: "Cemar Sedang"

    #[sqlx(rename = "nilai_storet")]
    #[serde(rename = "nilaiStoret")]
    pub nilai_storet: Option<f64>, // Contoh: -18.0

    #[sqlx(rename = "status_storet")]
    #[serde(rename = "statusStoret")]
    pub status_storet: Option<String>, // Contoh: "Kelas C"

    // --- SYSTEM METADATA ---
    pub created_at: Option<NaiveDateTime>,
}