use tauri::{State, command};
use sqlx::SqlitePool;
use crate::models::kualitas_air::KualitasAirRecord;

// Command ini akan dipanggil dari JS dengan nama: submit_kualitas_air
#[command]
pub async fn submit_kualitas_air(
    pool: State<'_, SqlitePool>, 
    data: KualitasAirRecord
) -> Result<String, String> {
    
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

    sqlx::query(sql)
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
        .await
        .map_err(|e| format!("Gagal menyimpan data ke database: {}", e))?;

    Ok("Data berhasil disimpan ke database Local!".to_string())
}