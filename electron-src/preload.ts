import { IpcRendererEvent, contextBridge, ipcRenderer } from 'electron'
import { ContextMenuOption, ContextMenuParams } from './context-menu'

contextBridge.exposeInMainWorld('electronAPI', {
  basename: (path: string) => ipcRenderer.invoke('basename', path),
  darwin: () => ipcRenderer.invoke('darwin'),
  dirname: (path: string) => ipcRenderer.invoke('dirname', path),
  getEntryTree: (path: string) => ipcRenderer.invoke('get-entry-tree', path),
  getHomePath: () => ipcRenderer.invoke('get-home-path'),
  getWindowId: () => ipcRenderer.invoke('get-window-id'),
  isFullscreen: () => ipcRenderer.invoke('is-fullscreen'),
  listDetailedEntries: (path: string) =>
    ipcRenderer.invoke('list-detailed-entries', path),
  listEntries: (path: string) => ipcRenderer.invoke('list-entries', path),
  openPath: (path: string) => ipcRenderer.invoke('open-path', path),
  trashItem: (path: string) => ipcRenderer.invoke('trash-item', path),
  contextMenu: {
    show: (params: ContextMenuParams, options: ContextMenuOption[]) =>
      ipcRenderer.invoke('context-menu-show', params, options),
  },
  ffmpeg: {
    metadata: (path: string) => ipcRenderer.invoke('ffmpeg-metadata', path),
    thumbnail: (path: string) => ipcRenderer.invoke('ffmpeg-thumbnail', path),
  },
  subscription: {
    entry: (
      callback: (
        path: string,
        operation:
          | 'move'
          | 'moveToTrash'
          | 'newFolder'
          | 'addToFavorites'
          | 'removeFromFavorites'
      ) => void
    ) => {
      const cb = (
        _e: IpcRendererEvent,
        path: string,
        operation:
          | 'move'
          | 'moveToTrash'
          | 'newFolder'
          | 'addToFavorites'
          | 'removeFromFavorites'
      ) => callback(path, operation)
      ipcRenderer.on('subscription-entry', cb)
      return () => ipcRenderer.removeListener('subscription-entry', cb)
    },
    fullscreen: (callback: (fullscreen: boolean) => void) => {
      const cb = (_e: IpcRendererEvent, fullscreen: boolean) =>
        callback(fullscreen)
      ipcRenderer.on('subscription-fullscreen', cb)
      return () => ipcRenderer.removeListener('subscription-fullscreen', cb)
    },
    search: (callback: () => void) => {
      const cb = () => callback()
      ipcRenderer.on('subscription-search', cb)
      return () => ipcRenderer.removeListener('subscription-search', cb)
    },
    settings: (callback: () => void) => {
      const cb = () => callback()
      ipcRenderer.on('subscription-settings', cb)
      return () => ipcRenderer.removeListener('subscription-settings', cb)
    },
  },
})
