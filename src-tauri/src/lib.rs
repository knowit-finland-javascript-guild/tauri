// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn generate_header_text(operating_system: &str) -> String {
    format!("System info for {}", operating_system)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder
        ::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![generate_header_text])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
