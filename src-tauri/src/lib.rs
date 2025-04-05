mod application_menu;
mod commands;
mod utils;
mod window;

use application_menu::{build_menu, setup_menu_events};
use commands::{get_entries, get_entries_for_paths, get_entry, get_parent_entry};
use window::create_main_window;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            create_main_window(app)?;

            let menu = build_menu(app)?;
            app.set_menu(menu)?;
            setup_menu_events(app);

            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            get_entry,
            get_entries_for_paths,
            get_entries,
            get_parent_entry
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
