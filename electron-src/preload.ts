import { IpcRendererEvent, contextBridge, ipcRenderer } from 'electron'
import { ContextMenuOption, ContextMenuParams } from './contextMenu'

contextBridge.exposeInMainWorld('electronAPI', {
  createDirectory: (directoryPath: string) =>
    ipcRenderer.invoke('create-directory', directoryPath),
  createThumbnail: (path: string) =>
    ipcRenderer.invoke('create-thumbnail', path),
  createVideoThumbnails: (path: string) =>
    ipcRenderer.invoke('create-video-thumbnails', path),
  darwin: () => ipcRenderer.invoke('darwin'),
  getDetailedEntries: (directoryPath: string) =>
    ipcRenderer.invoke('get-detailed-entries', directoryPath),
  getDetailedEntriesForPaths: (paths: string[]) =>
    ipcRenderer.invoke('get-detailed-entries-for-paths', paths),
  getDetailedEntry: (path: string) =>
    ipcRenderer.invoke('get-detailed-entry', path),
  getDirectoryPath: (path: string) =>
    ipcRenderer.invoke('getDirectoryPath', path),
  getEntries: (directoryPath: string) =>
    ipcRenderer.invoke('get-entries', directoryPath),
  getEntryHierarchy: (path: string) =>
    ipcRenderer.invoke('get-entry-hierarchy', path),
  getMetadata: (path: string) => ipcRenderer.invoke('get-metadata', path),
  getWindowIndex: () => ipcRenderer.invoke('get-window-index'),
  isFullscreen: () => ipcRenderer.invoke('is-fullscreen'),
  openPath: (path: string) => ipcRenderer.invoke('open-path', path),
  renameEntry: (path: string, newName: string) =>
    ipcRenderer.invoke('rename-entry', path, newName),
  showContextMenu: (params: ContextMenuParams, options: ContextMenuOption[]) =>
    ipcRenderer.invoke('show-context-menu', params, options),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subscribe: (callback: (eventName: string, params: any) => void) => {
    const handler = (
      _event: IpcRendererEvent,
      eventName: string,
      params: any // eslint-disable-line @typescript-eslint/no-explicit-any
    ) => callback(eventName, params)
    ipcRenderer.on('subscribe', handler)
    return () => ipcRenderer.removeListener('subscribe', handler)
  },
  trashItems: (paths: string[]) => ipcRenderer.invoke('trash-items', paths),
  watchDirectory: (
    path: string,
    callback: (eventType: string, path: string) => void
  ) => {
    ipcRenderer.removeAllListeners('watch-directory')
    ipcRenderer.on(
      'watch-directory',
      (_event: IpcRendererEvent, eventType: string, path: string) =>
        callback(eventType, path)
    )
    ipcRenderer.invoke('watch-directory', path)
  },
  watchDirectoryHierarchy: (
    paths: string[],
    callback: (
      eventType: string,
      directoryPath: string,
      filePath: string
    ) => void
  ) => {
    ipcRenderer.removeAllListeners('watch-directory-hierarchy')
    ipcRenderer.on(
      'watch-directory-hierarchy',
      (
        _event: IpcRendererEvent,
        eventType: string,
        directoryPath: string,
        filePath: string
      ) => callback(eventType, directoryPath, filePath)
    )
    ipcRenderer.invoke('watch-directory-hierarchy', paths)
  },
})
