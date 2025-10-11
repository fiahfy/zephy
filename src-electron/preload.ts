import { exposeOperations as exposeContextMenuOperations } from '@fiahfy/electron-context-menu/preload'
import { exposeOperations as exposeStorageOperations } from '@fiahfy/electron-storage/preload'
import { exposeOperations as exposeWindowOperations } from '@fiahfy/electron-window/preload'
import {
  contextBridge,
  type IpcRendererEvent,
  ipcRenderer,
  webUtils,
} from 'electron'
import type { ApplicationMenuParams } from './application-menu'
import type { FileEventHandler, FileEventType } from './watcher'

const applicationMenuOperations = {
  update: (params: ApplicationMenuParams) => ipcRenderer.send('update', params),
}

const electronOperations = {
  copy: () => ipcRenderer.send('copy'),
  cut: () => ipcRenderer.send('cut'),
  fileURLToPath: (url: string) => ipcRenderer.sendSync('fileURLToPath', url),
  getPathForFile: (file: File) => webUtils.getPathForFile(file),
  openExternal: (url: string) => ipcRenderer.send('openExternal', url),
  openTab: () => ipcRenderer.send('openTab'),
  paste: () => ipcRenderer.send('paste'),
  pathToFileURL: (path: string) => ipcRenderer.sendSync('pathToFileURL', path),
  selectAll: () => ipcRenderer.send('selectAll'),
  sep: ipcRenderer.sendSync('sep'),
  startDrag: (paths: string[]) => ipcRenderer.send('startDrag', paths),
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
  moveEntry: (path: string, directoryPath: string) =>
    ipcRenderer.invoke('moveEntry', path, directoryPath),
  moveEntryToTrash: (path: string) =>
    ipcRenderer.invoke('moveEntryToTrash', path),
  openEntry: (path: string) => ipcRenderer.send('openEntry', path),
  pasteEntries: (directoryPath: string) =>
    ipcRenderer.send('pasteEntries', directoryPath),
  renameEntry: (path: string, newName: string) =>
    ipcRenderer.invoke('renameEntry', path, newName),
}

const messageOperations = {
  // biome-ignore lint/suspicious/noExplicitAny: false positive
  onMessage: (handler: (message: any) => void) => {
    // biome-ignore lint/suspicious/noExplicitAny: false positive
    const listener = (_event: IpcRendererEvent, message: any) =>
      handler(message)
    ipcRenderer.on('onMessage', listener)
    return () => ipcRenderer.off('onMessage', listener)
  },
}

const watcherOperations = {
  onFileChange: (handler: FileEventHandler) => {
    const listener = (
      _event: IpcRendererEvent,
      eventType: FileEventType,
      directoryPath: string,
      path: string,
    ) => handler(eventType, directoryPath, path)
    ipcRenderer.on('onFileChange', listener)
    return () => ipcRenderer.off('onFileChange', listener)
  },
  watch: (directoryPaths: string[]) => {
    ipcRenderer.send('watch', directoryPaths)
    return () => ipcRenderer.send('unwatch')
  },
}

contextBridge.exposeInMainWorld('applicationMenuAPI', applicationMenuOperations)
contextBridge.exposeInMainWorld('contextMenuAPI', exposeContextMenuOperations())
contextBridge.exposeInMainWorld('electronAPI', electronOperations)
contextBridge.exposeInMainWorld('entryAPI', entryOperations)
contextBridge.exposeInMainWorld('messageAPI', messageOperations)
contextBridge.exposeInMainWorld('storageAPI', exposeStorageOperations())
contextBridge.exposeInMainWorld('watcherAPI', watcherOperations)
contextBridge.exposeInMainWorld('windowAPI', exposeWindowOperations())
