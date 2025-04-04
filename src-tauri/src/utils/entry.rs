use serde::{Deserialize, Serialize};
use std::io;
use std::path::PathBuf;
use std::{fs::Metadata, time::UNIX_EPOCH};
use tokio::fs::{metadata, read_dir};
use url::Url;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum EntryType {
    File,
    Directory,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Entry {
    pub date_created: u128,
    pub date_last_opened: u128,
    pub date_modified: u128,
    pub name: String,
    pub path: String,
    pub size: u64,
    #[serde(rename = "type")]
    pub entry_type: EntryType,
    pub url: String,
}

fn get_entry_type(metadata: &Metadata) -> Option<EntryType> {
    if metadata.is_file() {
        Some(EntryType::File)
    } else if metadata.is_dir() {
        Some(EntryType::Directory)
    } else {
        None
    }
}

pub async fn get_entry(path: &str) -> Result<Entry, io::Error> {
    let metadata = metadata(&path).await?;
    let entry_type = get_entry_type(&metadata).ok_or(io::Error::new(
        io::ErrorKind::InvalidInput,
        "Unknown entry type",
    ))?;

    let entry = Entry {
        date_created: metadata
            .created()?
            .duration_since(UNIX_EPOCH)
            .map_err(|_| io::Error::new(io::ErrorKind::InvalidInput, "Invalid file time"))?
            .as_millis(),
        date_last_opened: metadata
            .accessed()?
            .duration_since(UNIX_EPOCH)
            .map_err(|_| io::Error::new(io::ErrorKind::InvalidInput, "Invalid file time"))?
            .as_millis(),
        date_modified: metadata
            .modified()?
            .duration_since(UNIX_EPOCH)
            .map_err(|_| io::Error::new(io::ErrorKind::InvalidInput, "Invalid file time"))?
            .as_millis(),
        name: PathBuf::from(&path)
            .file_name()
            .ok_or(io::Error::new(
                io::ErrorKind::InvalidInput,
                "Invalid file name",
            ))?
            .to_string_lossy()
            .into_owned(),
        path: path.to_string(),
        size: if let EntryType::Directory = entry_type {
            0
        } else {
            metadata.len()
        },
        entry_type,
        url: Url::from_file_path(&path)
            .map_err(|_| io::Error::new(io::ErrorKind::InvalidInput, "Invalid file path"))?
            .to_string(),
    };

    Ok(entry)
}

pub async fn get_entries_for_paths(paths: Vec<&str>) -> Result<Vec<Entry>, io::Error> {
    let mut entries = Vec::new();

    for path in paths {
        if let Ok(entry) = get_entry(path).await {
            entries.push(entry);
        }
    }

    Ok(entries)
}

pub async fn get_entries(directory_path: &str) -> Result<Vec<Entry>, io::Error> {
    let mut path_strings = Vec::new();
    let mut entries = read_dir(&directory_path).await?;

    while let Some(entry) = entries.next_entry().await? {
        let path_string = entry.path().to_string_lossy().to_string();
        path_strings.push(path_string);
    }

    let paths: Vec<&str> = path_strings.iter().map(|s| s.as_str()).collect();

    get_entries_for_paths(paths).await
}
