// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Import backend modules
mod db;
mod handlers;
mod models;
mod utils;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize database
    let pool = db::init_db().await?;
    
    // Start HTTP server in background
    let pool_clone = pool.clone();
    tokio::spawn(async move {
        start_http_server(pool_clone).await.expect("Failed to start HTTP server");
    });

    // Run Tauri application (this will show desktop window)
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, get_water_quality_samples, create_water_quality_command])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    Ok(())
}

async fn start_http_server(pool: sqlx::SqlitePool) -> anyhow::Result<()> {
    use axum::{
        http::Method,
        routing::{get, post},
        Router,
    };
    use std::net::SocketAddr;
    use tower_http::cors::{Any, CorsLayer};

    // Configure CORS
    let cors = CorsLayer::new()
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE, Method::PATCH])
        .allow_headers(Any)
        .allow_origin(Any);

    // Build our application with routes
    let app = Router::new()
        .route("/", get(root))
        .route("/api/v1/water-quality", get(handlers::water_quality::list_samples))
        .route("/api/v1/water-quality", post(handlers::water_quality::create_sample))
        .route("/api/v1/water-quality/:id", get(handlers::water_quality::get_sample))
        .layer(cors)
        .with_state(pool);

    // Run HTTP server
    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    println!("🚀 Backend API server running on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

async fn root() -> &'static str {
    "Data Hidrologi Backend API - Water Quality Management System"
}

// Tauri commands for desktop integration
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn get_water_quality_samples() -> Result<Vec<models::water_quality::WaterQualitySample>, String> {
    // This is a simplified version that creates a new connection
    let pool = db::init_db().await.map_err(|e| format!("Database error: {}", e))?;
    
    let samples = sqlx::query_as::<_, models::water_quality::WaterQualitySample>(
        "SELECT * FROM water_quality_samples ORDER BY created_at DESC"
    )
    .fetch_all(&pool)
    .await
    .map_err(|e| format!("Database error: {}", e))?;

    Ok(samples)
}

#[tauri::command]
async fn create_water_quality_command(
    data: models::water_quality::CreateWaterQualitySample,
) -> Result<String, String> {
    use uuid::Uuid;
    
    let pool = db::init_db().await.map_err(|e| format!("Database error: {}", e))?;
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
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#,
    )
    .bind(&id)
    .bind(&data.sample_date)
    .bind(&data.sample_time)
    .bind(&data.location_name)
    .bind(&data.das)
    .bind(&data.river_basin)
    .bind(&data.province)
    .bind(&data.regency)
    .bind(&data.district)
    .bind(&data.year)
    .bind(&data.elevation)
    .bind(&data.operator)
    .bind(&data.laboratory)
    .bind(&data.river)
    .bind(&data.village)
    .bind(&data.coordinates)
    .bind(&data.temperatur)
    .bind(&data.konduktivitas)
    .bind(&data.kekeruhan)
    .bind(&data.oksigen)
    .bind(&data.ph)
    .bind(&data.tds)
    .bind(&data.tss)
    .bind(&data.warna)
    .bind(&data.klorida)
    .bind(&data.amoniak)
    .bind(&data.nitrat)
    .bind(&data.nitrit)
    .bind(&data.fosfat)
    .bind(&data.deterjen)
    .bind(&data.arsen)
    .bind(&data.besi)
    .bind(&data.mangan)
    .bind(&data.tembaga)
    .bind(&data.merkuri)
    .bind(&data.sianida)
    .bind(&data.fluorida)
    .bind(&data.belerang)
    .bind(&data.cod)
    .bind(&data.bod)
    .bind(&data.minyak_dan_lemak)
    .bind(&data.fenol)
    .bind(&data.total_coliform)
    .bind(&data.debit)
    .execute(&pool)
    .await
    .map_err(|e| format!("Database error: {}", e))?;

    Ok(id)
}