use tauri::{
    menu::{CheckMenuItem, Menu, MenuBuilder, MenuItem, Submenu, SubmenuBuilder},
    AppHandle, Result, Wry,
};

use crate::window::create_window;

fn build_app_menu(app_handle: &AppHandle) -> Result<Submenu<Wry>> {
    let settings = MenuItem::with_id(app_handle, "settings", "Settings...", true, Some("Cmd+,"))?;

    SubmenuBuilder::new(app_handle, "App")
        .about(None)
        .separator()
        .item(&settings)
        .separator()
        .services()
        .separator()
        .hide()
        .hide_others()
        .show_all()
        .separator()
        .quit()
        .separator()
        .build()
}

fn build_file_menu(app_handle: &AppHandle) -> Result<Submenu<Wry>> {
    let new_window =
        MenuItem::with_id(app_handle, "new_window", "New Window", true, Some("Cmd+N"))?;
    let new_tab = MenuItem::with_id(app_handle, "new_tab", "New Tab", true, Some("Cmd+T"))?;
    let close_window = MenuItem::with_id(
        app_handle,
        "close_window",
        "Close Window",
        true,
        Some("Cmd+Shift+W"),
    )?;
    let close_tab = MenuItem::with_id(app_handle, "close_tab", "Close Tab", true, Some("Cmd+W"))?;

    let open = MenuItem::with_id(app_handle, "open", "Open", true, Some("Cmd+O"))?;
    let rename = MenuItem::with_id(app_handle, "rename", "Rename", true, None::<&str>)?;
    let move_to_trash = MenuItem::with_id(
        app_handle,
        "move_to_trash",
        "Move to Trash",
        true,
        Some("Cmd+Backspace"),
    )?;

    SubmenuBuilder::new(app_handle, "File")
        .item(&new_window)
        .item(&new_tab)
        .item(&close_window)
        .item(&close_tab)
        .separator()
        .item(&open)
        .item(&rename)
        .item(&move_to_trash)
        .build()
}

fn build_edit_menu(app_handle: &AppHandle) -> Result<Submenu<Wry>> {
    let cut = MenuItem::with_id(app_handle, "cut", "Cut", true, Some("Cmd+X"))?;
    let copy = MenuItem::with_id(app_handle, "copy", "Copy", true, Some("Cmd+C"))?;
    let paste = MenuItem::with_id(app_handle, "paste", "Paste", true, Some("Cmd+V"))?;
    let select_all =
        MenuItem::with_id(app_handle, "select_all", "Select All", true, Some("Cmd+A"))?;
    let find = MenuItem::with_id(app_handle, "find", "Find", true, Some("Cmd+F"))?;

    SubmenuBuilder::new(app_handle, "Edit")
        .undo()
        .redo()
        .separator()
        .item(&cut)
        .item(&copy)
        .item(&paste)
        .item(&select_all)
        .separator()
        .item(&find)
        .build()
}

fn build_view_menu(app_handle: &AppHandle) -> Result<Submenu<Wry>> {
    let view_as_list = CheckMenuItem::with_id(
        app_handle,
        "view_as_list",
        "as List",
        true,
        false,
        Some("Cmd+1"),
    )?;
    let view_as_thumbnail = CheckMenuItem::with_id(
        app_handle,
        "view_as_thumbnail",
        "as Thumbnail",
        true,
        false,
        Some("Cmd+2"),
    )?;
    let view_as_gallery = CheckMenuItem::with_id(
        app_handle,
        "view_as_gallery",
        "as Gallery",
        true,
        false,
        Some("Cmd+3"),
    )?;

    let toggle_navigator = MenuItem::with_id(
        app_handle,
        "toggle_navigator",
        "Toggle Navigator",
        true,
        None::<&str>,
    )?;
    let toggle_inspector = MenuItem::with_id(
        app_handle,
        "toggle_inspector",
        "Toggle Inspector",
        true,
        None::<&str>,
    )?;

    let refresh = MenuItem::with_id(app_handle, "refresh", "Refresh", true, Some("Cmd+R"))?;
    let force_reload = MenuItem::with_id(
        app_handle,
        "force_reload",
        "Force Reload",
        true,
        Some("Cmd+Shift+R"),
    )?;
    let toggle_developer_tools = MenuItem::with_id(
        app_handle,
        "toggle_developer_tools",
        "Toggle Developer Tools",
        true,
        Some("Cmd+Option+I"),
    )?;

    let sort_by_name = CheckMenuItem::with_id(
        app_handle,
        "sort_by_name",
        "Name",
        true,
        false,
        None::<&str>,
    )?;
    let sort_by_date_created = CheckMenuItem::with_id(
        app_handle,
        "sort_by_date_created",
        "Date Created",
        true,
        false,
        None::<&str>,
    )?;
    let sort_by_date_modified = CheckMenuItem::with_id(
        app_handle,
        "sort_by_date_modified",
        "Date Modified",
        true,
        false,
        None::<&str>,
    )?;
    let sort_by_date_last_opened = CheckMenuItem::with_id(
        app_handle,
        "sort_by_date_last_opened",
        "Date Opened",
        true,
        false,
        None::<&str>,
    )?;
    let sort_by_size = CheckMenuItem::with_id(
        app_handle,
        "sort_by_size",
        "Size",
        true,
        false,
        None::<&str>,
    )?;
    let sort_by_rating = CheckMenuItem::with_id(
        app_handle,
        "sort_by_rating",
        "Rating",
        true,
        false,
        None::<&str>,
    )?;
    let sort_menu = SubmenuBuilder::new(app_handle, "Sort By")
        .items(&[
            &sort_by_name,
            &sort_by_date_created,
            &sort_by_date_modified,
            &sort_by_date_last_opened,
            &sort_by_size,
            &sort_by_rating,
        ])
        .build()?;

    SubmenuBuilder::new(app_handle, "View")
        .item(&view_as_list)
        .item(&view_as_thumbnail)
        .item(&view_as_gallery)
        .separator()
        .item(&sort_menu)
        .separator()
        .item(&toggle_navigator)
        .item(&toggle_inspector)
        .separator()
        .item(&refresh)
        .separator()
        // TODO: force reload, devtools
        .item(&force_reload)
        .item(&toggle_developer_tools)
        .separator()
        .fullscreen()
        .build()
}

fn build_go_menu(app_handle: &AppHandle) -> Result<Submenu<Wry>> {
    let back = MenuItem::with_id(app_handle, "back", "Back", true, Some("Cmd+["))?;
    let forward = MenuItem::with_id(app_handle, "forward", "Forward", true, Some("Cmd+]"))?;

    SubmenuBuilder::new(app_handle, "Go")
        .item(&back)
        .item(&forward)
        .build()
}

fn build_window_menu(app_handle: &AppHandle) -> Result<Submenu<Wry>> {
    SubmenuBuilder::new(app_handle, "Window")
        .minimize()
        // TODO: zoom, front, window
        .build()
}

pub fn build_menu(app_handle: &AppHandle) -> Result<Menu<Wry>> {
    let app_menu = build_app_menu(app_handle)?;
    let file_menu = build_file_menu(app_handle)?;
    let edit_menu = build_edit_menu(app_handle)?;
    let view_menu = build_view_menu(app_handle)?;
    let go_menu = build_go_menu(app_handle)?;
    let window_menu = build_window_menu(app_handle)?;
    // TODO: help

    MenuBuilder::new(app_handle)
        .items(&[
            &app_menu,
            &file_menu,
            &edit_menu,
            &view_menu,
            &go_menu,
            &window_menu,
        ])
        .build()
}

pub fn setup_menu_events(app_handle: &AppHandle) {
    app_handle.on_menu_event(move |app_handle, event| {
        println!("menu event: {:?}", event.id());

        match event.id().as_ref() {
            "new_window" => {
                let _ = create_window(app_handle);
            }
            _ => {
                println!("unexpected menu event");
            }
        }
    });
}
