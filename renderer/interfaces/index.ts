// You can include shared interfaces/types in a separate file
// and then use them in any component by importing them. For
// example, to import the interface below do:
//
// import User from 'path/to/interfaces';

export interface IElectronAPI {
  basename: (path: string) => Promise<string>
  copyEntries: (paths: string[]) => Promise<void>
  createDirectory: (directoryPath: string) => Promise<DetailedEntry>
  createThumbnailUrl: (paths: string | string[]) => Promise<string>
  dirname: (path: string) => Promise<string>
  getDetailedEntries: (directoryPath: string) => Promise<DetailedEntry[]>
  getDetailedEntriesForPaths: (paths: string[]) => Promise<DetailedEntry[]>
  getDetailedEntry: (path: string) => Promise<DetailedEntry>
  getEntries: (directoryPath: string) => Promise<Entry[]>
  getEntryHierarchy: (path?: string) => Promise<Entry>
  getMetadata: (path: string) => Promise<Metadata | undefined>
  isDarwin: () => Promise<boolean>
  moveEntries: (
    paths: string[],
    directoryPath: string,
  ) => Promise<DetailedEntry[]>
  openPath: (path: string) => Promise<void>
  pasteEntries: (directoryPath: string) => Promise<void>
  renameEntry: (path: string, newName: string) => Promise<DetailedEntry>
  trashEntries: (paths: string[]) => Promise<void>
  applicationMenu: {
    update: (params: ApplicationMenuParams) => Promise<void>
  }
  contextMenu: {
    show: (params: ContextMenuParams) => Promise<void>
  }
  fullscreen: {
    addListener: (callback: (fullscreen: boolean) => void) => () => void
    isEntered: () => Promise<boolean>
  }
  message: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addListener: (callback: (message: any) => void) => () => void
  }
  watcher: {
    watch: (
      directoryPaths: string[],
      callback: (
        eventType: 'create' | 'update' | 'delete',
        directoryPath: string,
        filePath: string,
      ) => void,
    ) => Promise<void>
  }
  window: {
    restore: () => Promise<
      | { index: number; params: { directory?: string }; restored: boolean }
      | undefined
    >
    open: (params: { directory: string }) => Promise<void>
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ApplicationMenuParams = any

export type ContextMenuOption = {
  id: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any
}
export type ContextMenuParams = {
  isEditable: boolean
  selectionText: string
  x: number
  y: number
  options: ContextMenuOption[]
}

export type Settings = {
  shouldShowHiddenFiles: boolean
  theme: 'light' | 'dark' | 'system'
}

type File = {
  name: string
  path: string
  type: 'file'
  url: string
}
type Directory = {
  children?: Entry[]
  name: string
  path: string
  type: 'directory'
  url: string
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
