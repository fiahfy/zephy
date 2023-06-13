// You can include shared interfaces/types in a separate file
// and then use them in any component by importing them. For
// example, to import the interface below do:
//
// import User from 'path/to/interfaces';

export interface IElectronAPI {
  basename: (path: string) => Promise<string>
  darwin: () => Promise<boolean>
  dirname: (path: string) => Promise<string>
  getFileNode: (path: string) => Promise<FileNode>
  getWindowId: () => Promise<number | undefined>
  getHomePath: () => Promise<string>
  isFullscreen: () => Promise<boolean>
  listContents: (path: string) => Promise<Content[]>
  listFiles: (path: string) => Promise<File[]>
  openPath: (path: string) => Promise<void>
  trashItem: (path: string) => Promise<void>
  contextMenu: {
    send: (params?: unknown) => Promise<void>
  }
  ffmpeg: {
    thumbnail: (path: string) => Promise<string>
  }
  subscription: {
    file: (
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

export type Settings = {
  darkMode: boolean
}

export type File = {
  name: string
  path: string
  type: 'file' | 'directory' | 'other'
}
export type FileNode = File & { children?: FileNode[] }
export type Content = File & { dateModified: number }
export type ExplorerContent = Content & { rating: number }
