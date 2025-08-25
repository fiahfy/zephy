// You can include shared interfaces/types in a separate file
// and then use them in any component by importing them. For
// example, to import the interface below do:
//
// import User from 'path/to/interfaces';
import type { Operations as ContextMenuOperations } from '@fiahfy/electron-context-menu/preload'
import type { Operations as WindowOperations } from '@fiahfy/electron-window/preload'

export type ApplicationMenuOperations = {
  updateApplicationMenu: (params: ApplicationMenuParams) => void
}

export type EditOperations = {
  copy: () => void
  cut: () => void
  paste: () => void
  selectAll: () => void
}

export type EntryOperations = {
  copyEntries: (paths: string[]) => void
  createDirectory: (directoryPath: string) => Promise<Entry>
  createEntryThumbnailUrl: (
    paths: string | string[],
  ) => Promise<string | undefined>
  getEntries: (directoryPath: string) => Promise<Entry[]>
  getEntriesForPaths: (paths: string[]) => Promise<Entry[]>
  getEntry: (path: string) => Promise<Entry>
  getEntryMetadata: (path: string) => Promise<Metadata | undefined>
  getEntryParameters: (path: string) => Promise<string | undefined>
  getParentEntry: (path: string) => Promise<Entry>
  getRootEntry: (path?: string) => Promise<Entry>
  moveEntries: (paths: string[], directoryPath: string) => Promise<Entry[]>
  moveEntriesToTrash: (paths: string[]) => void
  openEntry: (path: string) => void
  pasteEntries: (directoryPath: string) => void
  renameEntry: (path: string, newName: string) => Promise<Entry>
}

export type MessageOperations = {
  // biome-ignore lint/suspicious/noExplicitAny: false positive
  onMessage: (callback: (message: any) => void) => () => void
}

export type WatcherOperations = {
  unwatch: () => void
  watch: (
    directoryPaths: string[],
    callback: (
      eventType: 'create' | 'update' | 'delete',
      directoryPath: string,
      filePath: string,
    ) => void,
  ) => void
}

export type IElectronAPI = {
  getFilePaths: (files: globalThis.File[]) => string[]
  openTab: () => void
  openUrl: (url: string) => void
  startDrag: (paths: string[]) => void
} & ApplicationMenuOperations &
  EditOperations &
  EntryOperations &
  MessageOperations &
  WatcherOperations &
  ContextMenuOperations &
  WindowOperations<{ directoryPath: string }>

// biome-ignore lint/suspicious/noExplicitAny: false positive
export type ApplicationMenuParams = any

type File = {
  type: 'file'
}
type Directory = {
  children?: Entry[]
  type: 'directory'
}
export type Entry = (File | Directory) & {
  dateCreated: number
  dateLastOpened: number
  dateModified: number
  name: string
  path: string
  size: number
  url: string
}
export type Content = Entry & { score: number }

export type Metadata = {
  duration?: number
  height?: number
  width?: number
}
