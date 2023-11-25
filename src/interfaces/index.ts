// You can include shared interfaces/types in a separate file
// and then use them in any component by importing them. For
// example, to import the interface below do:
//
// import User from 'path/to/interfaces';
import { Operations as ContextMenuOperations } from '@fiahfy/electron-context-menu/preload'
import { Operations as WindowOperations } from '@fiahfy/electron-window/preload'

export type IElectronAPI = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addMessageListener: (callback: (message: any) => void) => () => void
  copyEntries: (paths: string[]) => Promise<void>
  createDirectory: (directoryPath: string) => Promise<DetailedEntry>
  createEntryThumbnailUrl: (
    paths: string | string[],
  ) => Promise<string | undefined>
  getDetailedEntries: (directoryPath: string) => Promise<DetailedEntry[]>
  getDetailedEntriesForPaths: (paths: string[]) => Promise<DetailedEntry[]>
  getDetailedEntry: (path: string) => Promise<DetailedEntry>
  getEntries: (directoryPath: string) => Promise<Entry[]>
  getEntryHierarchy: (path?: string) => Promise<Entry>
  getEntryMetadata: (path: string) => Promise<Metadata | undefined>
  getParentEntry: (path: string) => Promise<DetailedEntry>
  moveEntries: (
    paths: string[],
    directoryPath: string,
  ) => Promise<DetailedEntry[]>
  moveEntriesToTrash: (paths: string[]) => Promise<void>
  openEntry: (path: string) => Promise<void>
  openUrl: (url: string) => Promise<void>
  pasteEntries: (directoryPath: string) => Promise<void>
  renameEntry: (path: string, newName: string) => Promise<DetailedEntry>
  updateApplicationMenu: (params: ApplicationMenuParams) => Promise<void>
  watchDirectories: (
    directoryPaths: string[],
    callback: (
      eventType: 'create' | 'update' | 'delete',
      directoryPath: string,
      filePath: string,
    ) => void,
  ) => Promise<void>
} & ContextMenuOperations &
  WindowOperations<{ directoryPath: string }>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ApplicationMenuParams = any

export type Settings = {
  shouldOpenWithPhoty: boolean
  shouldOpenWithVisty: boolean
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
