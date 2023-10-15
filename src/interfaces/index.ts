// You can include shared interfaces/types in a separate file
// and then use them in any component by importing them. For
// example, to import the interface below do:
//
// import User from 'path/to/interfaces';
import { Operations as TrafficLightOperations } from 'electron-traffic-light/preload'
import { Operations as WindowOperations } from 'electron-window/preload'

export interface IElectronAPI {
  applicationMenu: {
    update: (params: ApplicationMenuParams) => Promise<void>
  }
  contextMenu: {
    show: (params: ContextMenuParams) => Promise<void>
  }
  entry: {
    copy: (paths: string[]) => Promise<void>
    createDirectory: (directoryPath: string) => Promise<DetailedEntry>
    createThumbnailUrl: (paths: string | string[]) => Promise<string>
    getDetailedEntries: (directoryPath: string) => Promise<DetailedEntry[]>
    getDetailedEntriesForPaths: (paths: string[]) => Promise<DetailedEntry[]>
    getDetailedEntry: (path: string) => Promise<DetailedEntry>
    getEntries: (directoryPath: string) => Promise<Entry[]>
    getEntryHierarchy: (path?: string) => Promise<Entry>
    getMetadata: (path: string) => Promise<Metadata | undefined>
    getParent: (path: string) => Promise<DetailedEntry>
    move: (paths: string[], directoryPath: string) => Promise<DetailedEntry[]>
    moveToTrash: (paths: string[]) => Promise<void>
    open: (path: string) => Promise<void>
    paste: (directoryPath: string) => Promise<void>
    rename: (path: string, newName: string) => Promise<DetailedEntry>
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
  trafficLight: TrafficLightOperations
  window: WindowOperations<{ directoryPath: string }>
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
