import { exposeOperations as exposeContextMenuOperations } from '@fiahfy/electron-context-menu/preload'
import { exposeOperations as exposeWindowOperations } from '@fiahfy/electron-window/preload'
import { IpcRendererEvent, contextBridge, ipcRenderer } from 'electron'
import { ApplicationMenuParams } from './applicationMenu'

contextBridge.exposeInMainWorld('electronAPI', {
  addMessageListener: (callback: (message: any) => void) => {
    const listener = (_event: IpcRendererEvent, message: any) =>
      callback(message)
    ipcRenderer.on('sendMessage', listener)
    return () => ipcRenderer.off('sendMessage', listener)
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
  getEntryMetadata: (path: string) =>
    ipcRenderer.invoke('getEntryMetadata', path),
  getParentEntry: (path: string) => ipcRenderer.invoke('getParentEntry', path),
  getRootEntry: (path?: string) => ipcRenderer.invoke('getRootEntry', path),
  moveEntries: (paths: string[], directoryPath: string) =>
    ipcRenderer.invoke('moveEntries', paths, directoryPath),
  moveEntriesToTrash: (paths: string[]) =>
    ipcRenderer.invoke('moveEntriesToTrash', paths),
  openEntry: (path: string) => ipcRenderer.invoke('openEntry', path),
  openTab: () => ipcRenderer.invoke('openTab'),
  openUrl: (url: string) => ipcRenderer.invoke('openUrl', url),
  pasteEntries: (directoryPath: string) =>
    ipcRenderer.invoke('pasteEntries', directoryPath),
  renameEntry: (path: string, newName: string) =>
    ipcRenderer.invoke('renameEntry', path, newName),
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
  ...exposeContextMenuOperations(),
  ...exposeWindowOperations(),
})
