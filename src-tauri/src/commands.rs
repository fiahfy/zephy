use std::path::Path;
use tauri::command;

use crate::utils::entry;

#[command]
pub async fn get_entry(path: &str) -> Result<entry::Entry, String> {
    entry::get_entry(path).await.map_err(|e| e.to_string())
}

#[command]
pub async fn get_entries_for_paths(paths: Vec<&str>) -> Result<Vec<entry::Entry>, String> {
    entry::get_entries_for_paths(paths)
        .await
        .map_err(|e| e.to_string())
}

#[command]
pub async fn get_entries(directory_path: &str) -> Result<Vec<entry::Entry>, String> {
    entry::get_entries(directory_path)
        .await
        .map_err(|e| e.to_string())
}

#[command]
pub async fn get_parent_entry(path: &str) -> Result<entry::Entry, String> {
    let parent_path = Path::new(path)
        .parent()
        .ok_or("Parent not found")?
        .to_string_lossy()
        .to_string();
    entry::get_entry(&parent_path)
        .await
        .map_err(|e| e.to_string())
}
