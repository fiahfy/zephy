// You can include shared interfaces/types in a separate file
// and then use them in any component by importing them. For
// example, to import the interface below do:
//
// import User from 'path/to/interfaces';
import type { Operations as ContextMenuOperations } from '@fiahfy/electron-context-menu/preload'
import type { Operations as WindowOperations } from '@fiahfy/electron-window/preload'

export type ApplicationMenuOperations = {
  updateApplicationMenu: (params: ApplicationMenuParams) => Promise<void>
}

export type EditOperations = {
  copy: () => Promise<void>
  cut: () => Promise<void>
  paste: () => Promise<void>
  selectAll: () => Promise<void>
}

export type EntryOperations = {
  copyEntries: (paths: string[]) => Promise<void>
  createDirectory: (directoryPath: string) => Promise<Entry>
  createEntryThumbnailUrl: (
    paths: string | string[],
  ) => Promise<string | undefined>
  getEntries: (directoryPath: string) => Promise<Entry[]>
  getEntriesForPaths: (paths: string[]) => Promise<Entry[]>
  getEntry: (path: string) => Promise<Entry>
  getEntryMetadata: (path: string) => Promise<Metadata | undefined>
  getParentEntry: (path: string) => Promise<Entry>
  getRootEntry: (path?: string) => Promise<Entry>
  moveEntries: (paths: string[], directoryPath: string) => Promise<Entry[]>
  moveEntriesToTrash: (paths: string[]) => Promise<void>
  openEntry: (path: string) => Promise<void>
  pasteEntries: (directoryPath: string) => Promise<void>
  renameEntry: (path: string, newName: string) => Promise<Entry>
}

export type MessageOperations = {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  addMessageListener: (callback: (message: any) => void) => () => void
}

export type WatcherOperations = {
  watchDirectories: (
    directoryPaths: string[],
    callback: (
      eventType: 'create' | 'update' | 'delete',
      directoryPath: string,
      filePath: string,
    ) => void,
  ) => Promise<void>
}

export type IElectronAPI = {
  openTab: () => Promise<void>
  openUrl: (url: string) => Promise<void>
} & ApplicationMenuOperations &
  EditOperations &
  EntryOperations &
  MessageOperations &
  WatcherOperations &
  ContextMenuOperations &
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
export type Entry = (File | Directory) & {
  dateCreated: number
  dateModified: number
  dateLastOpened: number
  size: number
}
export type Content = Entry & { score: number }

export type Metadata = {
  duration?: number
  height?: number
  width?: number
}
