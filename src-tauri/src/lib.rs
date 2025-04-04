mod commands;
mod utils;

use commands::{get_entries, get_entries_for_paths, get_entry, get_parent_entry};
use tauri::{LogicalPosition, TitleBarStyle, WebviewUrl, WebviewWindowBuilder};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .setup(|app| {
            let win_builder = WebviewWindowBuilder::new(app, "main", WebviewUrl::default())
                .hidden_title(true)
                .inner_size(800.0, 600.0)
                .traffic_light_position(LogicalPosition::new(12.0, 17.0));

            #[cfg(target_os = "macos")]
            let win_builder = win_builder.title_bar_style(TitleBarStyle::Overlay);

            win_builder.build().unwrap();

            Ok(())
        })
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
