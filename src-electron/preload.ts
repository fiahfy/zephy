import { exposeOperations as exposeContextMenuOperations } from '@fiahfy/electron-context-menu/preload'
import { exposeOperations as exposeWindowOperations } from '@fiahfy/electron-window/preload'
import {
  contextBridge,
  type IpcRendererEvent,
  ipcRenderer,
  webUtils,
} from 'electron'
import type { ApplicationMenuParams } from './application-menu'

const applicationMenuOperations = {
  updateApplicationMenu: (params: ApplicationMenuParams) =>
    ipcRenderer.send('updateApplicationMenu', params),
}

const editOperations = {
  copy: () => ipcRenderer.send('copy'),
  cut: () => ipcRenderer.send('cut'),
  paste: () => ipcRenderer.send('paste'),
  selectAll: () => ipcRenderer.send('selectAll'),
}

const entryOperations = {
  copyEntries: (paths: string[]) => ipcRenderer.send('copyEntries', paths),
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
    ipcRenderer.send('moveEntriesToTrash', paths),
  openEntry: (path: string) => ipcRenderer.send('openEntry', path),
  pasteEntries: (directoryPath: string) =>
    ipcRenderer.send('pasteEntries', directoryPath),
  renameEntry: (path: string, newName: string) =>
    ipcRenderer.invoke('renameEntry', path, newName),
}

const messageOperations = {
  // biome-ignore lint/suspicious/noExplicitAny: false positive
  onMessage: (callback: (message: any) => void) => {
    // biome-ignore lint/suspicious/noExplicitAny: false positive
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
    ipcRenderer.send('watchDirectories', directoryPaths)
  },
}

contextBridge.exposeInMainWorld('electronAPI', {
  getFilePaths: (files: File[]) =>
    files.map((file) => webUtils.getPathForFile(file)),
  openTab: () => ipcRenderer.send('openTab'),
  openUrl: (url: string) => ipcRenderer.send('openUrl', url),
  startDrag: (paths: string[]) => ipcRenderer.send('startDrag', paths),
  ...applicationMenuOperations,
  ...editOperations,
  ...entryOperations,
  ...messageOperations,
  ...watcherOperations,
  ...exposeContextMenuOperations(),
  ...exposeWindowOperations(),
})
