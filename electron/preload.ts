import { IpcRendererEvent, contextBridge, ipcRenderer } from 'electron'
import { exposeOperations as exposeTrafficLightOperations } from 'electron-traffic-light/preload'
import { exposeOperations as exposeWindowOperations } from 'electron-window/preload'
import { ApplicationMenuParams } from './applicationMenu'
import { ContextMenuParams } from './contextMenu'

contextBridge.exposeInMainWorld('electronAPI', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addMessageListener: (callback: (message: any) => void) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const listener = (_event: IpcRendererEvent, message: any) =>
      callback(message)
    ipcRenderer.on('sendMessage', listener)
    return () => ipcRenderer.removeListener('sendMessage', listener)
  },
  copyEntries: (paths: string[]) => ipcRenderer.invoke('copyEntries', paths),
  createDirectory: (directoryPath: string) =>
    ipcRenderer.invoke('createDirectory', directoryPath),
  createEntryThumbnailUrl: (paths: string | string[]) =>
    ipcRenderer.invoke('createEntryThumbnailUrl', paths),
  getDetailedEntries: (directoryPath: string) =>
    ipcRenderer.invoke('getDetailedEntries', directoryPath),
  getDetailedEntriesForPaths: (paths: string[]) =>
    ipcRenderer.invoke('getDetailedEntriesForPaths', paths),
  getDetailedEntry: (path: string) =>
    ipcRenderer.invoke('getDetailedEntry', path),
  getEntries: (directoryPath: string) =>
    ipcRenderer.invoke('getEntries', directoryPath),
  getEntryHierarchy: (path?: string) =>
    ipcRenderer.invoke('getEntryHierarchy', path),
  getEntryMetadata: (path: string) =>
    ipcRenderer.invoke('getEntryMetadata', path),
  getParentEntry: (path: string) => ipcRenderer.invoke('getParentEntry', path),
  moveEntries: (paths: string[], directoryPath: string) =>
    ipcRenderer.invoke('moveEntries', paths, directoryPath),
  moveEntriesToTrash: (paths: string[]) =>
    ipcRenderer.invoke('moveEntriesToTrash', paths),
  openEntry: (path: string) => ipcRenderer.invoke('openEntry', path),
  pasteEntries: (directoryPath: string) =>
    ipcRenderer.invoke('pasteEntries', directoryPath),
  renameEntry: (path: string, newName: string) =>
    ipcRenderer.invoke('renameEntry', path, newName),
  showContextMenu: (params: ContextMenuParams) =>
    ipcRenderer.invoke('showContextMenu', params),
  updateApplicationMenu: (params: ApplicationMenuParams) =>
    ipcRenderer.invoke('updateApplicationMenu', params),
  watchDirectories: (
    directoryPaths: string[],
    callback: (
      eventType: 'create' | 'delete',
      directoryPath: string,
      filePath: string,
    ) => void,
  ) => {
    ipcRenderer.removeAllListeners('notifyToWatcher')
    ipcRenderer.on(
      'notifyToWatcher',
      (
        _event: IpcRendererEvent,
        eventType: 'create' | 'delete',
        directoryPath: string,
        filePath: string,
      ) => callback(eventType, directoryPath, filePath),
    )
    return ipcRenderer.invoke('watchDirectories', directoryPaths)
  },
  ...exposeTrafficLightOperations(),
  ...exposeWindowOperations(),
})
