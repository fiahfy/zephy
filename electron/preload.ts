import { IpcRendererEvent, contextBridge, ipcRenderer } from 'electron'
import { exposeOperations as exposeTrafficLightOperations } from 'electron-traffic-light/preload'
import { exposeOperations as exposeWindowOperations } from 'electron-window/preload'
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
    getParent: (path: string) => ipcRenderer.invoke('entry-get-parent', path),
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
  trafficLight: exposeTrafficLightOperations(),
  window: exposeWindowOperations(),
})
