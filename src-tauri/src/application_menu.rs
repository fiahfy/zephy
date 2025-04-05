use tauri::{
    menu::{CheckMenuItem, Menu, MenuBuilder, MenuItem, Submenu, SubmenuBuilder},
    App, Result, Wry,
};

fn build_app_menu(app: &App) -> Result<Submenu<Wry>> {
    let settings = MenuItem::with_id(app, "settings", "Settings...", true, Some("Cmd+,"))?;

    SubmenuBuilder::new(app, "App")
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

fn build_file_menu(app: &App) -> Result<Submenu<Wry>> {
    let new_window = MenuItem::with_id(app, "new_window", "New Window", true, Some("Cmd+N"))?;
    let new_tab = MenuItem::with_id(app, "new_tab", "New Tab", true, Some("Cmd+T"))?;
    let close_window = MenuItem::with_id(
        app,
        "close_window",
        "Close Window",
        true,
        Some("Cmd+Shift+W"),
    )?;
    let close_tab = MenuItem::with_id(app, "close_tab", "Close Tab", true, Some("Cmd+W"))?;

    let open = MenuItem::with_id(app, "open", "Open", true, Some("Cmd+O"))?;
    let rename = MenuItem::with_id(app, "rename", "Rename", true, None::<&str>)?;
    let move_to_trash = MenuItem::with_id(
        app,
        "move_to_trash",
        "Move to Trash",
        true,
        Some("Cmd+Backspace"),
    )?;

    SubmenuBuilder::new(app, "File")
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

fn build_edit_menu(app: &App) -> Result<Submenu<Wry>> {
    let cut = MenuItem::with_id(app, "cut", "Cut", true, Some("Cmd+X"))?;
    let copy = MenuItem::with_id(app, "copy", "Copy", true, Some("Cmd+C"))?;
    let paste = MenuItem::with_id(app, "paste", "Paste", true, Some("Cmd+V"))?;
    let select_all = MenuItem::with_id(app, "select_all", "Select All", true, Some("Cmd+A"))?;
    let find = MenuItem::with_id(app, "find", "Find", true, Some("Cmd+F"))?;

    SubmenuBuilder::new(app, "Edit")
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

fn build_view_menu(app: &App) -> Result<Submenu<Wry>> {
    let view_as_list =
        CheckMenuItem::with_id(app, "view_as_list", "as List", true, false, Some("Cmd+1"))?;
    let view_as_thumbnail = CheckMenuItem::with_id(
        app,
        "view_as_thumbnail",
        "as Thumbnail",
        true,
        false,
        Some("Cmd+2"),
    )?;
    let view_as_gallery = CheckMenuItem::with_id(
        app,
        "view_as_gallery",
        "as Gallery",
        true,
        false,
        Some("Cmd+3"),
    )?;

    let toggle_navigator = MenuItem::with_id(
        app,
        "toggle_navigator",
        "Toggle Navigator",
        true,
        None::<&str>,
    )?;
    let toggle_inspector = MenuItem::with_id(
        app,
        "toggle_inspector",
        "Toggle Inspector",
        true,
        None::<&str>,
    )?;

    let refresh = MenuItem::with_id(app, "refresh", "Refresh", true, Some("Cmd+R"))?;
    let force_reload = MenuItem::with_id(
        app,
        "force_reload",
        "Force Reload",
        true,
        Some("Cmd+Shift+R"),
    )?;
    let toggle_developer_tools = MenuItem::with_id(
        app,
        "toggle_developer_tools",
        "Toggle Developer Tools",
        true,
        Some("Cmd+Option+I"),
    )?;

    let sort_by_name =
        CheckMenuItem::with_id(app, "sort_by_name", "Name", true, false, None::<&str>)?;
    let sort_by_date_created = CheckMenuItem::with_id(
        app,
        "sort_by_date_created",
        "Date Created",
        true,
        false,
        None::<&str>,
    )?;
    let sort_by_date_modified = CheckMenuItem::with_id(
        app,
        "sort_by_date_modified",
        "Date Modified",
        true,
        false,
        None::<&str>,
    )?;
    let sort_by_date_last_opened = CheckMenuItem::with_id(
        app,
        "sort_by_date_last_opened",
        "Date Opened",
        true,
        false,
        None::<&str>,
    )?;
    let sort_by_size =
        CheckMenuItem::with_id(app, "sort_by_size", "Size", true, false, None::<&str>)?;
    let sort_by_rating =
        CheckMenuItem::with_id(app, "sort_by_rating", "Rating", true, false, None::<&str>)?;
    let sort_menu = SubmenuBuilder::new(app, "Sort By")
        .items(&[
            &sort_by_name,
            &sort_by_date_created,
            &sort_by_date_modified,
            &sort_by_date_last_opened,
            &sort_by_size,
            &sort_by_rating,
        ])
        .build()?;

    SubmenuBuilder::new(app, "View")
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

fn build_go_menu(app: &App) -> Result<Submenu<Wry>> {
    let back = MenuItem::with_id(app, "back", "Back", true, Some("Cmd+["))?;
    let forward = MenuItem::with_id(app, "forward", "Forward", true, Some("Cmd+]"))?;

    SubmenuBuilder::new(app, "Go")
        .item(&back)
        .item(&forward)
        .build()
}

fn build_window_menu(app: &App) -> Result<Submenu<Wry>> {
    SubmenuBuilder::new(app, "Window")
        .minimize()
        // TODO: zoom, front, window
        .build()
}

pub fn build_menu(app: &App) -> Result<Menu<Wry>> {
    let app_menu = build_app_menu(app)?;
    let file_menu = build_file_menu(app)?;
    let edit_menu = build_edit_menu(app)?;
    let view_menu = build_view_menu(app)?;
    let go_menu = build_go_menu(app)?;
    let window_menu = build_window_menu(app)?;
    // TODO: help

    MenuBuilder::new(app)
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

pub fn setup_menu_events(app: &App) {
    app.on_menu_event(move |_app_handle, event| {
        println!("menu event: {:?}", event.id());

        match event.id().0.as_str() {
            "open" => {
                println!("open event");
            }
            "close" => {
                println!("close event");
            }
            _ => {
                println!("unexpected menu event");
            }
        }
    });
}
