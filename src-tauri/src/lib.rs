// Import modul
pub mod commands;
pub mod models;
pub mod services;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let handle = app.handle().clone();
            
            tauri::async_runtime::block_on(async move {
                match services::db_service::init_db(&handle).await {
                    Ok(pool) => {
                        handle.manage(pool);
                        println!("✅ Database berhasil diinisialisasi dan disimpan ke State.");
                    }
                    Err(e) => {
                        panic!("❌ Gagal inisialisasi database: {}", e);
                    }
                }
            });

            Ok(())
        })
        // PERHATIKAN BAGIAN INI:
        .invoke_handler(tauri::generate_handler![
            commands::kualitas_air::submit_kualitas_air
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}