// You can include shared interfaces/types in a separate file
// and then use them in any component by importing them. For
// example, to import the interface below do:
//
// import User from 'path/to/interfaces';

export interface IElectronAPI {
  basename: (path: string) => Promise<string>
  darwin: () => Promise<boolean>
  dirname: (path: string) => Promise<string>
  getHomePath: () => Promise<string>
  getWindowId: () => Promise<number | undefined>
  isFullscreen: () => Promise<boolean>
  openPath: (path: string) => Promise<void>
  trashItem: (path: string) => Promise<void>
  getDetailedEntries: (path: string) => Promise<DetailedEntry[]>
  getEntries: (path: string) => Promise<Entry[]>
  getEntryHierarchy: (path: string) => Promise<Entry>
  createThumbnail: (path: string) => Promise<string>
  getMetadata: (path: string) => Promise<Metadata>
  contextMenu: {
    show: (
      params: ContextMenuParams,
      options: ContextMenuOption[]
    ) => Promise<void>
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
    sidebarHidden: (
      callback: (variant: 'primary' | 'secondary', hidden: boolean) => void
    ) => () => void
    sort: (callback: (orderBy: keyof Content) => void) => () => void
    viewMode: (callback: (viewMode: 'list' | 'thumbnail') => void) => () => void
  }
}

export type ContextMenuParams = {
  isEditable: boolean
  selectionText: string
  x: number
  y: number
}
export type ContextMenuOption = {
  id: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any
}

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
