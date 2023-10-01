import { IpcRendererEvent, contextBridge, ipcRenderer } from 'electron'
import { ApplicationMenuParams } from './applicationMenu'
import { ContextMenuParams } from './contextMenu'

contextBridge.exposeInMainWorld('electronAPI', {
  applicationMenu: {
    update: (params: ApplicationMenuParams) =>
      ipcRenderer.invoke('application-menu-update', params),
  },
  contextMenu: {
    show: (params: ContextMenuParams) =>
      ipcRenderer.invoke('context-menu-show', params),
  },
  entry: {
    copy: (paths: string[]) => ipcRenderer.invoke('entry-copy', paths),
    createDirectory: (directoryPath: string) =>
      ipcRenderer.invoke('entry-create-directory', directoryPath),
    createThumbnailUrl: (paths: string | string[]) =>
      ipcRenderer.invoke('entry-create-thumbnail-url', paths),
    getDetailedEntries: (directoryPath: string) =>
      ipcRenderer.invoke('entry-get-detailed-entries', directoryPath),
    getDetailedEntriesForPaths: (paths: string[]) =>
      ipcRenderer.invoke('entry-get-detailed-entries-for-paths', paths),
    getDetailedEntry: (path: string) =>
      ipcRenderer.invoke('entry-get-detailed-entry', path),
    getEntries: (directoryPath: string) =>
      ipcRenderer.invoke('entry-get-entries', directoryPath),
    getEntryHierarchy: (path?: string) =>
      ipcRenderer.invoke('entry-get-entry-hierarchy', path),
    getMetadata: (path: string) =>
      ipcRenderer.invoke('entry-get-metadata', path),
    move: (paths: string[], directoryPath: string) =>
      ipcRenderer.invoke('entry-move', paths, directoryPath),
    moveToTrash: (paths: string[]) =>
      ipcRenderer.invoke('entry-move-to-trash', paths),
    open: (path: string) => ipcRenderer.invoke('entry-open', path),
    paste: (directoryPath: string) =>
      ipcRenderer.invoke('entry-paste', directoryPath),
    rename: (path: string, newName: string) =>
      ipcRenderer.invoke('entry-rename', path, newName),
  },
  fullscreen: {
    addListener: (callback: (fullscreen: boolean) => void) => {
      const listener = (_event: IpcRendererEvent, fullscreen: boolean) =>
        callback(fullscreen)
      ipcRenderer.on('fullscreen-send', listener)
      return () => ipcRenderer.removeListener('fullscreen-send', listener)
    },
    isEntered: () => ipcRenderer.invoke('fullscreen-is-entered'),
  },
  message: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addListener: (callback: (message: any) => void) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const listener = (_event: IpcRendererEvent, message: any) =>
        callback(message)
      ipcRenderer.on('message-send', listener)
      return () => ipcRenderer.removeListener('message-send', listener)
    },
  },
  node: {
    basename: (path: string) => ipcRenderer.invoke('node-basename', path),
    dirname: (path: string) => ipcRenderer.invoke('node-dirname', path),
    isDarwin: () => ipcRenderer.invoke('node-is-darwin'),
  },
  watcher: {
    watch: (
      directoryPaths: string[],
      callback: (
        eventType: 'create' | 'delete',
        directoryPath: string,
        filePath: string,
      ) => void,
    ) => {
      ipcRenderer.removeAllListeners('watcher-notify')
      ipcRenderer.on(
        'watcher-notify',
        (
          _event: IpcRendererEvent,
          eventType: 'create' | 'delete',
          directoryPath: string,
          filePath: string,
        ) => callback(eventType, directoryPath, filePath),
      )
      return ipcRenderer.invoke('watcher-watch', directoryPaths)
    },
  },
  window: {
    restore: () => ipcRenderer.invoke('window-restore'),
    open: (params: { directory: string }) =>
      ipcRenderer.invoke('window-open', params),
  },
})
