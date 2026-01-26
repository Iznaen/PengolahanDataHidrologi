use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize)]
pub struct WaterQualityMeasurement {
    pub id: i64,
    pub station_id: i64,
    pub sampling_date: String,
    pub sampling_time: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateMeasurement {
    pub station_data: CreateStation,
    pub sampling_date: String,
    pub sampling_time: Option<String>,
    pub parameters: HashMap<String, Option<f64>>,
    pub notes: Option<String>,
}

// Re-export CreateStation dari station module
use super::station::CreateStation;
