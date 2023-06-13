import { IpcRendererEvent, contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  basename: (path: string) => ipcRenderer.invoke('basename', path),
  darwin: () => ipcRenderer.invoke('darwin'),
  dirname: (path: string) => ipcRenderer.invoke('dirname', path),
  getFileNode: (path: string) => ipcRenderer.invoke('get-file-node', path),
  getThumbnail: (path: string) => ipcRenderer.invoke('get-thumbnail', path),
  getWindowId: () => ipcRenderer.invoke('get-window-id'),
  getHomePath: () => ipcRenderer.invoke('get-home-path'),
  isFullscreen: () => ipcRenderer.invoke('is-fullscreen'),
  listContents: (path: string) => ipcRenderer.invoke('list-contents', path),
  listFiles: (path: string) => ipcRenderer.invoke('list-files', path),
  openPath: (path: string) => ipcRenderer.invoke('open-path', path),
  trashItem: (path: string) => ipcRenderer.invoke('trash-item', path),
  contextMenu: {
    send: (params?: unknown) => ipcRenderer.invoke('context-menu-send', params),
  },
  ffmpeg: {
    thumbnail: (path: string) => ipcRenderer.invoke('ffmpeg-thumbnail', path),
  },
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
      ipcRenderer.on('subscription-file', cb)
      return () => ipcRenderer.removeListener('subscription-file', cb)
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
