use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct WaterQualitySample {
    pub id: String,
    pub sample_date: String,
    pub sample_time: String,
    pub location_name: String,
    pub das: String,
    pub river_basin: String,
    pub province: String,
    pub regency: String,
    pub district: String,
    pub year: i32,
    pub elevation: Option<String>,
    pub operator: String,
    pub laboratory: String,
    pub river: String,
    pub village: String,
    pub coordinates: Option<String>,

    // Variabel Umum
    pub temperatur: Option<String>,
    pub konduktivitas: Option<String>,
    pub kekeruhan: Option<String>,
    pub oksigen: Option<String>,
    pub ph: Option<String>,
    pub tds: Option<String>,
    pub tss: Option<String>,
    pub warna: Option<String>,

    // Major Ion
    pub klorida: Option<String>,

    // Nutrient
    pub amoniak: Option<String>,
    pub nitrat: Option<String>,
    pub nitrit: Option<String>,
    pub fosfat: Option<String>,
    pub deterjen: Option<String>,

    // Kontaminan Logam Berat
    pub arsen: Option<String>,
    pub besi: Option<String>,
    pub mangan: Option<String>,
    pub tembaga: Option<String>,
    pub merkuri: Option<String>,

    // Kontaminan Anorganik
    pub sianida: Option<String>,
    pub fluorida: Option<String>,
    pub belerang: Option<String>,

    // Kontaminan Organik
    pub cod: Option<String>,
    pub bod: Option<String>,
    pub minyak_dan_lemak: Option<String>,
    pub fenol: Option<String>,

    // Mikrobiologi
    pub total_coliform: Option<String>,

    // Lain-lain
    pub debit: Option<String>,

    // Timestamps
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateWaterQualitySample {
    pub sample_date: String,
    pub sample_time: String,
    pub location_name: String,
    pub das: String,
    pub river_basin: String,
    pub province: String,
    pub regency: String,
    pub district: String,
    pub year: i32,
    pub elevation: Option<String>,
    pub operator: String,
    pub laboratory: String,
    pub river: String,
    pub village: String,
    pub coordinates: Option<String>,

    // Variabel Umum
    pub temperatur: Option<String>,
    pub konduktivitas: Option<String>,
    pub kekeruhan: Option<String>,
    pub oksigen: Option<String>,
    pub ph: Option<String>,
    pub tds: Option<String>,
    pub tss: Option<String>,
    pub warna: Option<String>,

    // Major Ion
    pub klorida: Option<String>,

    // Nutrient
    pub amoniak: Option<String>,
    pub nitrat: Option<String>,
    pub nitrit: Option<String>,
    pub fosfat: Option<String>,
    pub deterjen: Option<String>,

    // Kontaminan Logam Berat
    pub arsen: Option<String>,
    pub besi: Option<String>,
    pub mangan: Option<String>,
    pub tembaga: Option<String>,
    pub merkuri: Option<String>,

    // Kontaminan Anorganik
    pub sianida: Option<String>,
    pub fluorida: Option<String>,
    pub belerang: Option<String>,

    // Kontaminan Organik
    pub cod: Option<String>,
    pub bod: Option<String>,
    pub minyak_dan_lemak: Option<String>,
    pub fenol: Option<String>,

    // Mikrobiologi
    pub total_coliform: Option<String>,

    // Lain-lain
    pub debit: Option<String>,
}
