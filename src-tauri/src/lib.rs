use tauri::Manager;

mod commands;
mod models;
mod database;
mod services;
mod errors;

pub use commands::*;
pub use errors::{AppError, Result};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // Initialize database
            let db = database::Database::new(&app.handle())
                .expect("Gagal menginisialisasi database");
            app.manage(db);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::data::save_measurement,
            commands::data::get_measurements,
            commands::data::get_stations,
            commands::file::save_to_file,
            commands::file::load_from_file,
            greet, // Keep existing greet command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Halo, {}! Selamat datang di Aplikasi Data Hidrologi!", name)
}
