import { exposeOperations as exposeContextMenuOperations } from '@fiahfy/electron-context-menu/preload'
import { exposeOperations as exposeWindowOperations } from '@fiahfy/electron-window/preload'
import { type IpcRendererEvent, contextBridge, ipcRenderer } from 'electron'
import type { ApplicationMenuParams } from './applicationMenu'

const applicationMenuOperations = {
  updateApplicationMenu: (params: ApplicationMenuParams) =>
    ipcRenderer.invoke('updateApplicationMenu', params),
}

const editOperations = {
  copy: () => ipcRenderer.invoke('copy'),
  cut: () => ipcRenderer.invoke('cut'),
  paste: () => ipcRenderer.invoke('paste'),
  selectAll: () => ipcRenderer.invoke('selectAll'),
}

const entryOperations = {
  copyEntries: (paths: string[]) => ipcRenderer.invoke('copyEntries', paths),
  createDirectory: (directoryPath: string) =>
    ipcRenderer.invoke('createDirectory', directoryPath),
  createEntryThumbnailUrl: (paths: string | string[]) =>
    ipcRenderer.invoke('createEntryThumbnailUrl', paths),
  getEntries: (directoryPath: string) =>
    ipcRenderer.invoke('getEntries', directoryPath),
  getEntriesForPaths: (paths: string[]) =>
    ipcRenderer.invoke('getEntriesForPaths', paths),
  getEntry: (path: string) => ipcRenderer.invoke('getEntry', path),
  getEntryMetadata: (path: string) =>
    ipcRenderer.invoke('getEntryMetadata', path),
  getParentEntry: (path: string) => ipcRenderer.invoke('getParentEntry', path),
  getRootEntry: (path?: string) => ipcRenderer.invoke('getRootEntry', path),
  moveEntries: (paths: string[], directoryPath: string) =>
    ipcRenderer.invoke('moveEntries', paths, directoryPath),
  moveEntriesToTrash: (paths: string[]) =>
    ipcRenderer.invoke('moveEntriesToTrash', paths),
  openEntry: (path: string) => ipcRenderer.invoke('openEntry', path),
  pasteEntries: (directoryPath: string) =>
    ipcRenderer.invoke('pasteEntries', directoryPath),
  renameEntry: (path: string, newName: string) =>
    ipcRenderer.invoke('renameEntry', path, newName),
}

const messageOperations = {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  addMessageListener: (callback: (message: any) => void) => {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const listener = (_event: IpcRendererEvent, message: any) =>
      callback(message)
    ipcRenderer.on('sendMessage', listener)
    return () => ipcRenderer.off('sendMessage', listener)
  },
}

const watcherOperations = {
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
}

contextBridge.exposeInMainWorld('electronAPI', {
  openTab: () => ipcRenderer.invoke('openTab'),
  openUrl: (url: string) => ipcRenderer.invoke('openUrl', url),
  ...applicationMenuOperations,
  ...editOperations,
  ...entryOperations,
  ...messageOperations,
  ...watcherOperations,
  ...exposeContextMenuOperations(),
  ...exposeWindowOperations(),
})
