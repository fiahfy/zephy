mod application_menu;
mod commands;
mod utils;
mod window;

use application_menu::{build_menu, setup_menu_events};
use commands::{get_entries, get_entries_for_paths, get_entry, get_parent_entry};
use tauri::{generate_context, generate_handler, AppHandle, Builder, Manager, WindowEvent};
use window::create_main_window;

#[cfg_attr(mobile, mobile_entry_point)]
pub fn run() {
    Builder::default()
        .setup(|app| {
            create_main_window(app)?;

            let menu = build_menu(app)?;
            app.set_menu(menu)?;
            setup_menu_events(app);

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
        // see https://github.com/tauri-apps/tauri/issues/3084#issuecomment-1477675840
        .on_window_event(|window, event| match event {
            WindowEvent::CloseRequested { api, .. } => {
                #[cfg(not(target_os = "macos"))]
                {
                    event.window().hide().unwrap();
                }

                #[cfg(target_os = "macos")]
                {
                    AppHandle::hide(window.app_handle()).unwrap();
                }
                api.prevent_close();
            }
            _ => {}
        })
        .run(generate_context!())
        .expect("error while running tauri application");
}
