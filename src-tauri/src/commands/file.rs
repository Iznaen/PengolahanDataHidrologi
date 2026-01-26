use tauri::State;
use crate::database::Database;

#[tauri::command]
pub async fn save_to_file(
    _db: State<'_, Database>,
    _path: String,
) -> std::result::Result<String, String> {
    // TODO: Implement file saving logic
    Ok("File saved".to_string())
}

#[tauri::command]
pub async fn load_from_file(
    _db: State<'_, Database>,
    _path: String,
) -> std::result::Result<String, String> {
    // TODO: Implement file loading logic
    Ok("File loaded".to_string())
}