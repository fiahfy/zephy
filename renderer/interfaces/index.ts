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
  getHomePath: () => Promise<string>
  getWindowId: () => Promise<number | undefined>
  isFullscreen: () => Promise<boolean>
  listDetailedEntries: (path: string) => Promise<DetailedEntry[]>
  listEntries: (path: string) => Promise<Entry[]>
  openPath: (path: string) => Promise<void>
  trashItem: (path: string) => Promise<void>
  contextMenu: {
    show: (
      params: ContextMenuParams,
      options: ContextMenuOption[]
    ) => Promise<void>
  }
  ffmpeg: {
    thumbnail: (path: string) => Promise<string>
    metadata: (path: string) => Promise<Metadata>
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

export type ContextMenuParams = {
  isEditable: boolean
  selectionText: string
  x: number
  y: number
}
export type ContextMenuOption =
  | {
      id: string
      path?: string
    }
  | { type: string }

export type Settings = {
  darkMode: boolean
  shouldShowHiddenFiles: boolean
}

type File = {
  name: string
  path: string
  type: 'file'
}
type Directory = {
  children?: Entry[]
  name: string
  path: string
  type: 'directory'
}
export type Entry = File | Directory
export type DetailedEntry = Entry & {
  dateCreated: number
  dateModified: number
  dateLastOpened: number
  size: number
}
export type Content = DetailedEntry & { rating: number }

export type Metadata = {
  duration?: number
  height?: number
  width?: number
}
