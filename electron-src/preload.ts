import { IpcRendererEvent, contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  basename: (path: string) => ipcRenderer.invoke('basename', path),
  darwin: () => ipcRenderer.invoke('darwin'),
  dirname: (path: string) => ipcRenderer.invoke('dirname', path),
  getFileNode: (path: string) => ipcRenderer.invoke('get-file-node', path),
  getPresentationData: (path: string) =>
    ipcRenderer.invoke('get-presentation-data', path),
  getThumbnail: (path: string) => ipcRenderer.invoke('get-thumbnail', path),
  getWindowId: () => ipcRenderer.invoke('get-window-id'),
  homePath: () => ipcRenderer.invoke('home-path'),
  listContents: (path: string) => ipcRenderer.invoke('list-contents', path),
  listFiles: (path: string) => ipcRenderer.invoke('list-files', path),
  openPath: (path: string) => ipcRenderer.invoke('open-path', path),
  subscribeAddToFavorites: (callback: (path: string) => void) => {
    const cb = (_e: IpcRendererEvent, path: string) => callback(path)
    ipcRenderer.on('add-favorite', cb)
    return () => {
      ipcRenderer.removeListener('add-favorite', cb)
    }
  },
  subscribeRemoveFromFavorites: (callback: (path: string) => void) => {
    const cb = (_e: IpcRendererEvent, path: string) => callback(path)
    ipcRenderer.on('remove-favorite', cb)
    return () => {
      ipcRenderer.removeListener('remove-favorite', cb)
    }
  },
  subscribeShowSettings: (callback: () => void) => {
    const cb = () => callback()
    ipcRenderer.on('show-settings', cb)
    return () => {
      ipcRenderer.removeListener('show-settings', cb)
    }
  },
  subscribeSearch: (callback: () => void) => {
    const cb = () => callback()
    ipcRenderer.on('search', cb)
    return () => {
      ipcRenderer.removeListener('search', cb)
    }
  },
  contextMenu: {
    send: (params?: unknown) => ipcRenderer.invoke('context-menu-send', params),
  },
  ffmpeg: {
    thumbnail: (path: string) => ipcRenderer.invoke('ffmpeg-thumbnail', path),
  },
})
