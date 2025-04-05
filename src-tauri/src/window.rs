use tauri::{
    AppHandle, LogicalPosition, Result, TitleBarStyle, WebviewUrl, WebviewWindow,
    WebviewWindowBuilder,
};

pub fn create_main_window(app_handle: &AppHandle) -> Result<WebviewWindow> {
    WebviewWindowBuilder::new(app_handle, "main", WebviewUrl::default())
        .hidden_title(true)
        .inner_size(800.0, 600.0)
        .title_bar_style(TitleBarStyle::Overlay)
        .traffic_light_position(LogicalPosition::new(12.0, 17.0))
        .build()
}
