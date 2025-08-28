// You can include shared interfaces/types in a separate file
// and then use them in any component by importing them. For
// example, to import the interface below do:
//
// import User from 'path/to/interfaces';

export type ApplicationMenuOperations = {
  update: (params: ApplicationMenuParams) => void
}

export type ElectronOperations = {
  copy: () => void
  cut: () => void
  fileURLToPath: (url: string) => string | undefined
  getPathForFile: (file: globalThis.File) => string
  openExternal: (url: string) => void
  openTab: () => void
  paste: () => void
  pathToFileURL: (path: string) => string | undefined
  selectAll: () => void
  startDrag: (paths: string[]) => void
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
  moveEntry: (path: string, directoryPath: string) => Promise<Entry>
  moveEntryToTrash: (path: string) => Promise<void>
  openEntry: (path: string) => void
  pasteEntries: (directoryPath: string) => void
  renameEntry: (path: string, newName: string) => Promise<Entry>
}

export type MessageOperations = {
  // biome-ignore lint/suspicious/noExplicitAny: false positive
  onMessage: (handler: (message: any) => void) => () => void
}

export type WatcherOperations = {
  onFileChange: (handler: FileEventHandler) => () => void
  watch: (directoryPaths: string[]) => () => void
}

type BaseEntry = {
  dateCreated: number
  dateLastOpened: number
  dateModified: number
  name: string
  path: string
  size: number
  url: string
}
type File = BaseEntry & {
  type: 'file'
}
type Directory = BaseEntry & {
  children?: Entry[]
  type: 'directory'
}
export type Entry = File | Directory

export type Content = Entry & { score: number }

export type Metadata = {
  duration?: number
  height?: number
  width?: number
}

export type FileEventType = 'create' | 'update' | 'delete'

export type FileEventHandler = (
  eventType: FileEventType,
  directoryPath: string,
  path: string,
) => void

export type ApplicationMenuParams = Partial<{
  canBack: boolean
  canCloseTab: boolean
  canForward: boolean
  inspectorHidden: boolean
  navigatorHidden: boolean
  orderBy:
    | 'dateCreated'
    | 'dateLastOpened'
    | 'dateModified'
    | 'name'
    | 'score'
    | 'size'
  viewMode: 'gallery' | 'list' | 'thumbnail'
}>
