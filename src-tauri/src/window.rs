use tauri::{
    AppHandle, LogicalPosition, Result, TitleBarStyle, WebviewUrl, WebviewWindow,
    WebviewWindowBuilder,
};
use uuid::Uuid;

pub fn create_window(app_handle: &AppHandle) -> Result<WebviewWindow> {
    let uuid = Uuid::new_v4().to_string();

    WebviewWindowBuilder::new(app_handle, uuid, WebviewUrl::default())
        .hidden_title(true)
        .inner_size(800.0, 600.0)
        .title_bar_style(TitleBarStyle::Overlay)
        .traffic_light_position(LogicalPosition::new(12.0, 17.0))
        .build()
}
