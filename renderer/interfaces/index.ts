// You can include shared interfaces/types in a separate file
// and then use them in any component by importing them. For
// example, to import the interface below do:
//
// import User from 'path/to/interfaces';

export interface IElectronAPI {
  createDirectory: (directoryPath: string) => Promise<DetailedEntry>
  createThumbnail: (path: string) => Promise<string>
  createVideoThumbnails: (path: string) => Promise<string[]>
  getDetailedEntries: (directoryPath: string) => Promise<DetailedEntry[]>
  getDetailedEntriesForPaths: (paths: string[]) => Promise<DetailedEntry[]>
  getDetailedEntry: (path: string) => Promise<DetailedEntry>
  getDirectoryPath: (path: string) => Promise<string>
  getEntries: (directoryPath: string) => Promise<Entry[]>
  getEntryHierarchy: (path?: string) => Promise<Entry>
  getMetadata: (path: string) => Promise<Metadata>
  isDarwin: () => Promise<boolean>
  moveEntries: (
    paths: string[],
    directoryPath: string,
  ) => Promise<DetailedEntry[]>
  openPath: (path: string) => Promise<void>
  renameEntry: (path: string, newName: string) => Promise<DetailedEntry>
  trashItems: (paths: string[]) => Promise<void>
  applicationMenu: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addListener: (callback: (message: any) => void) => () => void
    select: (paths: string[]) => Promise<void>
  }
  contextMenu: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addListener: (callback: (message: any) => void) => () => void
    show: (
      params: ContextMenuParams,
      options: ContextMenuOption[],
    ) => Promise<void>
  }
  fullscreen: {
    addListener: (callback: (fullscreen: boolean) => void) => () => void
    isFullscreen: () => Promise<boolean>
  }
  watcher: {
    watch: (
      directoryPaths: string[],
      callback: (
        eventType: 'create' | 'delete',
        directoryPath: string,
        filePath: string,
      ) => void,
    ) => Promise<void>
  }
  windowState: {
    getIndex: () => Promise<number | undefined>
    getParams: () => Promise<{ directory?: string } | undefined>
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
  params?: any
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
