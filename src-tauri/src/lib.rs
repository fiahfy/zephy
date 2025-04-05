mod application_menu;
mod commands;
mod utils;
mod window;

use application_menu::{build_menu, setup_menu_events};
use commands::{get_entries, get_entries_for_paths, get_entry, get_parent_entry};
use tauri::{generate_context, generate_handler, Builder, Manager, RunEvent};
use window::create_window;

#[cfg_attr(mobile, mobile_entry_point)]
pub fn run() {
    let app = Builder::default()
        .setup(|app| {
            create_window(app.app_handle())?;

            let menu = build_menu(app.app_handle())?;
            app.set_menu(menu)?;
            setup_menu_events(app.app_handle());

            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .invoke_handler(generate_handler![
            get_entry,
            get_entries_for_paths,
            get_entries,
            get_parent_entry
        ])
        .build(generate_context!())
        .expect("error while running tauri application");

    // TODO: new window when app is activated
    // see https://github.com/tauri-apps/tao/issues/218
    // see https://github.com/tauri-apps/tauri/issues/9063
    app.run(|_app_handle, event| match event {
        RunEvent::ExitRequested { api, .. } => {
            api.prevent_exit();
        }
        _ => {}
    });
}
