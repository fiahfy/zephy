import { IpcRendererEvent, contextBridge, ipcRenderer } from 'electron'
import { ContextMenuOption, ContextMenuParams } from './contextMenu'

contextBridge.exposeInMainWorld('electronAPI', {
  createDirectory: (directoryPath: string) =>
    ipcRenderer.invoke('create-directory', directoryPath),
  createThumbnail: (path: string) =>
    ipcRenderer.invoke('create-thumbnail', path),
  createVideoThumbnails: (path: string) =>
    ipcRenderer.invoke('create-video-thumbnails', path),
  getDetailedEntries: (directoryPath: string) =>
    ipcRenderer.invoke('get-detailed-entries', directoryPath),
  getDetailedEntriesForPaths: (paths: string[]) =>
    ipcRenderer.invoke('get-detailed-entries-for-paths', paths),
  getDetailedEntry: (path: string) =>
    ipcRenderer.invoke('get-detailed-entry', path),
  getDirectoryPath: (path: string) =>
    ipcRenderer.invoke('get-directory-path', path),
  getEntries: (directoryPath: string) =>
    ipcRenderer.invoke('get-entries', directoryPath),
  getEntryHierarchy: (path: string) =>
    ipcRenderer.invoke('get-entry-hierarchy', path),
  getMetadata: (path: string) => ipcRenderer.invoke('get-metadata', path),
  isDarwin: () => ipcRenderer.invoke('is-darwin'),
  moveEntries: (paths: string[], directoryPath: string) =>
    ipcRenderer.invoke('move-entries', paths, directoryPath),
  openPath: (path: string) => ipcRenderer.invoke('open-path', path),
  renameEntry: (path: string, newName: string) =>
    ipcRenderer.invoke('rename-entry', path, newName),
  trashItems: (paths: string[]) => ipcRenderer.invoke('trash-items', paths),
  applicationMenu: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addListener: (callback: (message: any) => void) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handler = (_event: IpcRendererEvent, message: any) =>
        callback(message)
      ipcRenderer.on('application-menu-send', handler)
      return () => ipcRenderer.removeListener('application-menu-send', handler)
    },
  },
  contextMenu: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addListener: (callback: (message: any) => void) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handler = (_event: IpcRendererEvent, message: any) =>
        callback(message)
      ipcRenderer.on('context-menu-send', handler)
      return () => ipcRenderer.removeListener('context-menu-send', handler)
    },
    show: (params: ContextMenuParams, options: ContextMenuOption[]) =>
      ipcRenderer.invoke('context-menu-show', params, options),
  },
  fullscreen: {
    addListener: (callback: (fullscreen: boolean) => void) => {
      const handler = (_event: IpcRendererEvent, fullscreen: boolean) =>
        callback(fullscreen)
      ipcRenderer.on('fullscreen-send', handler)
      return () => ipcRenderer.removeListener('fullscreen-send', handler)
    },
    isFullscreen: () => ipcRenderer.invoke('fullscreen-is-fullscreen'),
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
  windowState: {
    getIndex: () => ipcRenderer.invoke('window-state-get-index'),
    getParams: () => ipcRenderer.invoke('window-state-get-params'),
  },
})
