// You can include shared interfaces/types in a separate file
// and then use them in any component by importing them. For
// example, to import the interface below do:
//
// import User from 'path/to/interfaces';
import type { Operations as ContextMenuOperations } from '@fiahfy/electron-context-menu/preload'
import type { Operations as WindowOperations } from '@fiahfy/electron-window/preload'

export type IElectronAPI = {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
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
  getEntryMetadata: (path: string) => Promise<Metadata | undefined>
  getParentEntry: (path: string) => Promise<DetailedEntry>
  getRootEntry: (path?: string) => Promise<Entry>
  moveEntries: (
    paths: string[],
    directoryPath: string,
  ) => Promise<DetailedEntry[]>
  moveEntriesToTrash: (paths: string[]) => Promise<void>
  openEntry: (path: string) => Promise<void>
  openTab: () => Promise<void>
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

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
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
export type Content = DetailedEntry & { score: number }

export type Metadata = {
  duration?: number
  height?: number
  width?: number
}
