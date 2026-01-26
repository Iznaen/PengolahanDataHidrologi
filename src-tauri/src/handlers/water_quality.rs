use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::Json,
};
use serde_json::Value;
use sqlx::SqlitePool;
use uuid::Uuid;

use crate::models::water_quality::{WaterQualitySample, CreateWaterQualitySample};

pub async fn list_samples(
    State(pool): State<SqlitePool>,
) -> Result<Json<Vec<WaterQualitySample>>, StatusCode> {
    let samples = sqlx::query_as::<_, WaterQualitySample>(
        "SELECT * FROM water_quality_samples ORDER BY created_at DESC"
    )
    .fetch_all(&pool)
    .await
    .map_err(|e| {
        eprintln!("Database error: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(Json(samples))
}

pub async fn create_sample(
    State(pool): State<SqlitePool>,
    Json(payload): Json<CreateWaterQualitySample>,
) -> Result<(StatusCode, Json<Value>), StatusCode> {
    let id = Uuid::new_v4().to_string();
    
    sqlx::query(
        r#"
        INSERT INTO water_quality_samples (
            id, sample_date, sample_time, location_name, das, river_basin, 
            province, regency, district, year, elevation, operator, 
            laboratory, river, village, coordinates,
            temperatur, konduktivitas, kekeruhan, oksigen, ph, tds, tss, warna,
            klorida, amoniak, nitrat, nitrit, fosfat, deterjen,
            arsen, besi, mangan, tembaga, merkuri,
            sianida, fluorida, belerang,
            cod, bod, minyak_dan_lemak, fenol,
            total_coliform, debit
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#,
    )
    .bind(&id)
    .bind(&payload.sample_date)
    .bind(&payload.sample_time)
    .bind(&payload.location_name)
    .bind(&payload.das)
    .bind(&payload.river_basin)
    .bind(&payload.province)
    .bind(&payload.regency)
    .bind(&payload.district)
    .bind(&payload.year)
    .bind(&payload.elevation)
    .bind(&payload.operator)
    .bind(&payload.laboratory)
    .bind(&payload.river)
    .bind(&payload.village)
    .bind(&payload.coordinates)
    .bind(&payload.temperatur)
    .bind(&payload.konduktivitas)
    .bind(&payload.kekeruhan)
    .bind(&payload.oksigen)
    .bind(&payload.ph)
    .bind(&payload.tds)
    .bind(&payload.tss)
    .bind(&payload.warna)
    .bind(&payload.klorida)
    .bind(&payload.amoniak)
    .bind(&payload.nitrat)
    .bind(&payload.nitrit)
    .bind(&payload.fosfat)
    .bind(&payload.deterjen)
    .bind(&payload.arsen)
    .bind(&payload.besi)
    .bind(&payload.mangan)
    .bind(&payload.tembaga)
    .bind(&payload.merkuri)
    .bind(&payload.sianida)
    .bind(&payload.fluorida)
    .bind(&payload.belerang)
    .bind(&payload.cod)
    .bind(&payload.bod)
    .bind(&payload.minyak_dan_lemak)
    .bind(&payload.fenol)
    .bind(&payload.total_coliform)
    .bind(&payload.debit)
    .execute(&pool)
    .await
    .map_err(|e| {
        eprintln!("Database error: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok((StatusCode::CREATED, Json(serde_json::json!({ "id": id }))))
}

pub async fn get_sample(
    State(pool): State<SqlitePool>,
    Path(id): Path<String>,
) -> Result<Json<WaterQualitySample>, StatusCode> {
    let sample = sqlx::query_as::<_, WaterQualitySample>(
        "SELECT * FROM water_quality_samples WHERE id = ?"
    )
    .bind(&id)
    .fetch_one(&pool)
    .await
    .map_err(|e| {
        eprintln!("Database error: {}", e);
        StatusCode::NOT_FOUND
    })?;

    Ok(Json(sample))
}

pub async fn update_sample(
    State(pool): State<SqlitePool>,
    Path(id): Path<String>,
    Json(payload): Json<WaterQualitySample>,
) -> Result<Json<Value>, StatusCode> {
    sqlx::query(
        r#"
        UPDATE water_quality_samples SET
            sample_date = ?, sample_time = ?, location_name = ?, das = ?, river_basin = ?,
            province = ?, regency = ?, district = ?, year = ?, elevation = ?, operator = ?,
            laboratory = ?, river = ?, village = ?, coordinates = ?,
            temperatur = ?, konduktivitas = ?, kekeruhan = ?, oksigen = ?, ph = ?, tds = ?, 
            tss = ?, warna = ?, klorida = ?, amoniak = ?, nitrat = ?, nitrit = ?, fosfat = ?, 
            deterjen = ?, arsen = ?, besi = ?, mangan = ?, tembaga = ?, merkuri = ?,
            sianida = ?, fluorida = ?, belerang = ?, cod = ?, bod = ?, minyak_dan_lemak = ?, 
            fenol = ?, total_coliform = ?, debit = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        "#,
    )
    .bind(&payload.sample_date)
    .bind(&payload.sample_time)
    .bind(&payload.location_name)
    .bind(&payload.das)
    .bind(&payload.river_basin)
    .bind(&payload.province)
    .bind(&payload.regency)
    .bind(&payload.district)
    .bind(&payload.year)
    .bind(&payload.elevation)
    .bind(&payload.operator)
    .bind(&payload.laboratory)
    .bind(&payload.river)
    .bind(&payload.village)
    .bind(&payload.coordinates)
    .bind(&payload.temperatur)
    .bind(&payload.konduktivitas)
    .bind(&payload.kekeruhan)
    .bind(&payload.oksigen)
    .bind(&payload.ph)
    .bind(&payload.tds)
    .bind(&payload.tss)
    .bind(&payload.warna)
    .bind(&payload.klorida)
    .bind(&payload.amoniak)
    .bind(&payload.nitrat)
    .bind(&payload.nitrit)
    .bind(&payload.fosfat)
    .bind(&payload.deterjen)
    .bind(&payload.arsen)
    .bind(&payload.besi)
    .bind(&payload.mangan)
    .bind(&payload.tembaga)
    .bind(&payload.merkuri)
    .bind(&payload.sianida)
    .bind(&payload.fluorida)
    .bind(&payload.belerang)
    .bind(&payload.cod)
    .bind(&payload.bod)
    .bind(&payload.minyak_dan_lemak)
    .bind(&payload.fenol)
    .bind(&payload.total_coliform)
    .bind(&payload.debit)
    .bind(&id)
    .execute(&pool)
    .await
    .map_err(|e| {
        eprintln!("Database error: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(Json(serde_json::json!({ "message": "Sample updated successfully" })))
}

pub async fn delete_sample(
    State(pool): State<SqlitePool>,
    Path(id): Path<String>,
) -> Result<Json<Value>, StatusCode> {
    sqlx::query("DELETE FROM water_quality_samples WHERE id = ?")
        .bind(&id)
        .execute(&pool)
        .await
        .map_err(|e| {
            eprintln!("Database error: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    Ok(Json(serde_json::json!({ "message": "Sample deleted successfully" })))
}