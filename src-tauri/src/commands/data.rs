use tauri::State;
use crate::{
    database::Database, 
    models::{CreateMeasurement, WaterQualityMeasurement, Station},
    services::DataService
};

#[tauri::command]
pub async fn save_measurement(
    db: State<'_, Database>,
    data: CreateMeasurement,
) -> std::result::Result<i64, String> {
    let service = DataService::new(&db);
    service.save_measurement(data)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_measurements(
    db: State<'_, Database>,
    limit: Option<i64>,
) -> std::result::Result<Vec<WaterQualityMeasurement>, String> {
    let service = DataService::new(&db);
    service.get_measurements(limit)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_stations(
    db: State<'_, Database>,
) -> std::result::Result<Vec<Station>, String> {
    let service = DataService::new(&db);
    service.get_stations()
        .map_err(|e| e.to_string())
}