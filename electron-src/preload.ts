import { IpcRendererEvent, contextBridge, ipcRenderer } from 'electron'
import { ContextMenuOption, ContextMenuParams } from './contextMenu'

contextBridge.exposeInMainWorld('electronAPI', {
  // TODO: rename funcs
  basename: (path: string) => ipcRenderer.invoke('basename', path),
  copyEntries: (paths: string[]) => ipcRenderer.invoke('copy-entries', paths),
  createDirectory: (directoryPath: string) =>
    ipcRenderer.invoke('create-directory', directoryPath),
  createThumbnail: (path: string) =>
    ipcRenderer.invoke('create-thumbnail', path),
  dirname: (path: string) => ipcRenderer.invoke('dirname', path),
  getDetailedEntries: (directoryPath: string) =>
    ipcRenderer.invoke('get-detailed-entries', directoryPath),
  getDetailedEntriesForPaths: (paths: string[]) =>
    ipcRenderer.invoke('get-detailed-entries-for-paths', paths),
  getDetailedEntry: (path: string) =>
    ipcRenderer.invoke('get-detailed-entry', path),
  getEntries: (directoryPath: string) =>
    ipcRenderer.invoke('get-entries', directoryPath),
  getEntryHierarchy: (path?: string) =>
    ipcRenderer.invoke('get-entry-hierarchy', path),
  getMetadata: (path: string) => ipcRenderer.invoke('get-metadata', path),
  isDarwin: () => ipcRenderer.invoke('is-darwin'),
  moveEntries: (paths: string[], directoryPath: string) =>
    ipcRenderer.invoke('move-entries', paths, directoryPath),
  openPath: (path: string) => ipcRenderer.invoke('open-path', path),
  pasteEntries: (directoryPath: string) =>
    ipcRenderer.invoke('paste-entries', directoryPath),
  renameEntry: (path: string, newName: string) =>
    ipcRenderer.invoke('rename-entry', path, newName),
  trashEntries: (paths: string[]) => ipcRenderer.invoke('trash-entries', paths),
  applicationMenu: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    update: (params: any) =>
      ipcRenderer.invoke('application-menu-update', params),
  },
  contextMenu: {
    show: (params: ContextMenuParams, options: ContextMenuOption[]) =>
      ipcRenderer.invoke('context-menu-show', params, options),
  },
  fullscreen: {
    addListener: (callback: (fullscreen: boolean) => void) => {
      const listener = (_event: IpcRendererEvent, fullscreen: boolean) =>
        callback(fullscreen)
      ipcRenderer.on('fullscreen-send', listener)
      return () => ipcRenderer.removeListener('fullscreen-send', listener)
    },
    isEntered: () => ipcRenderer.invoke('fullscreen-is-entered'),
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
  window: {
    getDetails: () => ipcRenderer.invoke('window-get-details'),
    open: (params: { directory: string }) =>
      ipcRenderer.invoke('window-open', params),
  },
})
