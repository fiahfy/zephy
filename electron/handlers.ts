import { dirname, join } from 'node:path'
import {
  BrowserWindow,
  type IpcMainInvokeEvent,
  app,
  ipcMain,
  shell,
} from 'electron'
import { readPaths, writePaths } from './utils/clipboard'
import { createThumbnailUrl, getMetadata } from './utils/ffmpeg'
import {
  copyEntries,
  createDirectory,
  getDetailedEntries,
  getDetailedEntriesForPaths,
  getDetailedEntry,
  getEntries,
  getRootEntry,
  moveEntries,
  renameEntry,
} from './utils/file'
import type createWatcher from './watcher'

const thumbnailDir = join(app.getPath('userData'), 'thumbnails')

const registerEditHandlers = () => {
  const getWebContents = (event: IpcMainInvokeEvent) => {
    const browserWindow = BrowserWindow.fromWebContents(event.sender)
    if (!browserWindow) {
      return
    }

    const webContents = browserWindow.webContents
    return webContents.isDevToolsFocused()
      ? webContents.devToolsWebContents
      : webContents
  }

  ipcMain.handle('copy', (event: IpcMainInvokeEvent) =>
    getWebContents(event)?.copy(),
  )
  ipcMain.handle('cut', (event: IpcMainInvokeEvent) =>
    getWebContents(event)?.cut(),
  )
  ipcMain.handle('paste', (event: IpcMainInvokeEvent) =>
    getWebContents(event)?.paste(),
  )
  ipcMain.handle('selectAll', (event: IpcMainInvokeEvent) =>
    getWebContents(event)?.selectAll(),
  )
}

const registerEntryHandlers = (watcher: ReturnType<typeof createWatcher>) => {
  ipcMain.handle('copyEntries', (_event: IpcMainInvokeEvent, paths: string[]) =>
    writePaths(paths),
  )
  ipcMain.handle(
    'createDirectory',
    (_event: IpcMainInvokeEvent, directoryPath: string) =>
      createDirectory(directoryPath),
  )
  ipcMain.handle(
    'createEntryThumbnailUrl',
    (_event: IpcMainInvokeEvent, path: string) =>
      createThumbnailUrl(path, thumbnailDir),
  )
  ipcMain.handle(
    'getDetailedEntries',
    (_event: IpcMainInvokeEvent, directoryPath: string) =>
      getDetailedEntries(directoryPath),
  )
  ipcMain.handle(
    'getDetailedEntriesForPaths',
    (_event: IpcMainInvokeEvent, paths: string[]) =>
      getDetailedEntriesForPaths(paths),
  )
  ipcMain.handle(
    'getDetailedEntry',
    (_event: IpcMainInvokeEvent, path: string) => getDetailedEntry(path),
  )
  ipcMain.handle(
    'getEntries',
    (_event: IpcMainInvokeEvent, directoryPath: string) =>
      getEntries(directoryPath),
  )
  ipcMain.handle(
    'getEntryMetadata',
    (_event: IpcMainInvokeEvent, path: string) => getMetadata(path),
  )
  ipcMain.handle(
    'getParentEntry',
    (_event: IpcMainInvokeEvent, path: string) => {
      const parentPath = dirname(path)
      return getDetailedEntry(parentPath)
    },
  )
  ipcMain.handle('getRootEntry', (_event: IpcMainInvokeEvent, path?: string) =>
    getRootEntry(path ?? app.getPath('home')),
  )
  ipcMain.handle(
    'moveEntries',
    (_event: IpcMainInvokeEvent, paths: string[], directoryPath: string) =>
      moveEntries(paths, directoryPath),
  )
  ipcMain.handle(
    'moveEntriesToTrash',
    (_event: IpcMainInvokeEvent, paths: string[]) =>
      Promise.all(
        paths.map(async (path) => {
          await shell.trashItem(path)
          // notify event manually because chokidar doesn't detect trashItem event
          watcher.notify('delete', dirname(path), path)
        }),
      ),
  )
  ipcMain.handle('openEntry', (_event: IpcMainInvokeEvent, path: string) =>
    shell.openPath(path),
  )
  ipcMain.handle(
    'pasteEntries',
    (_event: IpcMainInvokeEvent, directoryPath) => {
      const paths = readPaths()
      return copyEntries(paths, directoryPath)
    },
  )
  ipcMain.handle(
    'renameEntry',
    (_event: IpcMainInvokeEvent, path: string, newName: string) =>
      renameEntry(path, newName),
  )
}

const registerHandlers = (watcher: ReturnType<typeof createWatcher>) => {
  ipcMain.handle('openTab', (event: IpcMainInvokeEvent) =>
    event.sender.send('sendMessage', {
      type: 'newTab',
      data: { path: app.getPath('home') },
    }),
  )
  ipcMain.handle('openUrl', (_event: IpcMainInvokeEvent, url: string) =>
    shell.openExternal(url),
  )
  registerEditHandlers()
  registerEntryHandlers(watcher)
}

export default registerHandlers
