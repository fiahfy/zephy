import { exposeOperations as exposeContextMenuOperations } from '@fiahfy/electron-context-menu/preload'
import { exposeOperations as exposeWindowOperations } from '@fiahfy/electron-window/preload'
import {
  type IpcRendererEvent,
  contextBridge,
  ipcRenderer,
  webUtils,
} from 'electron'
import type { ApplicationMenuParams } from './application-menu'

// TODO: avoid Promise<void> return types

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
  getEntryParameters: (path: string) =>
    ipcRenderer.invoke('getEntryParameters', path),
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
  onMessage: (callback: (message: any) => void) => {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const listener = (_event: IpcRendererEvent, message: any) =>
      callback(message)
    ipcRenderer.on('onMessage', listener)
    return () => ipcRenderer.off('onMessage', listener)
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
    ipcRenderer.removeAllListeners('onDirectoryChange')
    ipcRenderer.on(
      'onDirectoryChange',
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
  getFilePaths: (files: File[]) =>
    files.map((file) => webUtils.getPathForFile(file)),
  openTab: () => ipcRenderer.invoke('openTab'),
  openUrl: (url: string) => ipcRenderer.invoke('openUrl', url),
  startDrag: (paths: string[]) => ipcRenderer.send('startDrag', paths),
  ...applicationMenuOperations,
  ...editOperations,
  ...entryOperations,
  ...messageOperations,
  ...watcherOperations,
  ...exposeContextMenuOperations(),
  ...exposeWindowOperations(),
})
