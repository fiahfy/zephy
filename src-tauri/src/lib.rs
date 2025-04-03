mod commands;
mod utils;

use commands::{get_entries, get_entries_for_paths, get_entry, get_parent_entry};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            get_entry,
            get_entries_for_paths,
            get_entries,
            get_parent_entry
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
