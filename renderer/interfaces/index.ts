// You can include shared interfaces/types in a separate file
// and then use them in any component by importing them. For
// example, to import the interface below do:
//
// import User from 'path/to/interfaces';

export interface IElectronAPI {
  basename: (path: string) => Promise<string>
  darwin: () => Promise<boolean>
  dirname: (path: string) => Promise<string>
  getEntryTree: (path: string) => Promise<Entry>
  getWindowId: () => Promise<number | undefined>
  getHomePath: () => Promise<string>
  isFullscreen: () => Promise<boolean>
  listContents: (path: string) => Promise<Content[]>
  listEntries: (path: string) => Promise<Entry[]>
  openPath: (path: string) => Promise<void>
  trashItem: (path: string) => Promise<void>
  contextMenu: {
    send: (params?: unknown) => Promise<void>
  }
  ffmpeg: {
    thumbnail: (path: string) => Promise<string>
  }
  subscription: {
    entry: (
      callback: (
        path: string,
        operation:
          | 'move'
          | 'moveToTrash'
          | 'newFolder'
          | 'addToFavorites'
          | 'removeFromFavorites'
      ) => void
    ) => () => void
    fullscreen: (callback: (fullscreen: boolean) => void) => () => void
    search: (callback: () => void) => () => void
    settings: (callback: () => void) => () => void
  }
}

export type Settings = {
  darkMode: boolean
}

type EntryBase = {
  name: string
  path: string
}
type FileEntry = EntryBase & {
  type: 'file'
}
type DirectoryEntry = EntryBase & {
  type: 'directory'
  children?: Entry[]
}
type OtherEntry = EntryBase & {
  type: 'other'
}
export type Entry = FileEntry | DirectoryEntry | OtherEntry
export type Content = Entry & { dateModified: number }
export type ExplorerContent = Content & { rating: number }
