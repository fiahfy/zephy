import { IpcRendererEvent, contextBridge, ipcRenderer } from 'electron'
import { ContextMenuOption, ContextMenuParams } from './context-menu'

contextBridge.exposeInMainWorld('electronAPI', {
  basename: (path: string) => ipcRenderer.invoke('basename', path),
  darwin: () => ipcRenderer.invoke('darwin'),
  dirname: (path: string) => ipcRenderer.invoke('dirname', path),
  getHomePath: () => ipcRenderer.invoke('get-home-path'),
  getWindowId: () => ipcRenderer.invoke('get-window-id'),
  isFullscreen: () => ipcRenderer.invoke('is-fullscreen'),
  openPath: (path: string) => ipcRenderer.invoke('open-path', path),
  trashItems: (paths: string[]) => ipcRenderer.invoke('trash-items', paths),
  getDetailedEntries: (path: string) =>
    ipcRenderer.invoke('get-detailed-entries', path),
  getEntries: (path: string) => ipcRenderer.invoke('get-entries', path),
  getEntryHierarchy: (path: string) =>
    ipcRenderer.invoke('get-entry-hierarchy', path),
  createThumbnail: (path: string) =>
    ipcRenderer.invoke('create-thumbnail', path),
  createVideoThumbnails: (path: string) =>
    ipcRenderer.invoke('create-video-thumbnails', path),
  getMetadata: (path: string) => ipcRenderer.invoke('get-metadata', path),
  createDirectory: (path: string) =>
    ipcRenderer.invoke('create-directory', path),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subscribe: (callback: (eventName: string, params: any) => void) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (_e: IpcRendererEvent, eventName: string, params: any) =>
      callback(eventName, params)
    ipcRenderer.on('subscribe', handler)
    return () => ipcRenderer.removeListener('subscribe', handler)
  },
  contextMenu: {
    show: (params: ContextMenuParams, options: ContextMenuOption[]) =>
      ipcRenderer.invoke('context-menu-show', params, options),
  },
})
