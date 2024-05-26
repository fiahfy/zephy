import { IpcMainInvokeEvent, app, ipcMain, shell } from 'electron'
import { dirname, join } from 'node:path'
import { copy, paste } from './utils/clipboard'
import { postMessage } from './utils/worker'
import createWatcher from './watcher'

const thumbnailDir = join(app.getPath('userData'), 'thumbnails')

const registerHandlers = (watcher: ReturnType<typeof createWatcher>) => {
  ipcMain.handle('copyEntries', (_event: IpcMainInvokeEvent, paths: string[]) =>
    copy(paths),
  )
  ipcMain.handle(
    'createDirectory',
    (_event: IpcMainInvokeEvent, directoryPath: string) =>
      postMessage('createDirectory', directoryPath),
  )
  ipcMain.handle(
    'createEntryThumbnailUrl',
    (_event: IpcMainInvokeEvent, path: string) =>
      postMessage('createThumbnailUrl', path, thumbnailDir),
  )
  ipcMain.handle(
    'getDetailedEntries',
    (_event: IpcMainInvokeEvent, directoryPath: string) =>
      postMessage('getDetailedEntries', directoryPath),
  )
  ipcMain.handle(
    'getDetailedEntriesForPaths',
    (_event: IpcMainInvokeEvent, paths: string[]) =>
      postMessage('getDetailedEntriesForPaths', paths),
  )
  ipcMain.handle(
    'getDetailedEntry',
    (_event: IpcMainInvokeEvent, path: string) =>
      postMessage('getDetailedEntry', path),
  )
  ipcMain.handle(
    'getEntries',
    (_event: IpcMainInvokeEvent, directoryPath: string) =>
      postMessage('getEntries', directoryPath),
  )
  ipcMain.handle(
    'getEntryMetadata',
    (_event: IpcMainInvokeEvent, path: string) =>
      postMessage('getMetadata', path),
  )
  ipcMain.handle(
    'getParentEntry',
    (_event: IpcMainInvokeEvent, path: string) => {
      const parentPath = dirname(path)
      return postMessage('getDetailedEntry', parentPath)
    },
  )
  ipcMain.handle('getRootEntry', (_event: IpcMainInvokeEvent, path?: string) =>
    postMessage('getRootEntry', path),
  )
  ipcMain.handle(
    'moveEntries',
    (_event: IpcMainInvokeEvent, paths: string[], directoryPath: string) =>
      postMessage('moveEntries', paths, directoryPath),
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
  ipcMain.handle('openTab', (event: IpcMainInvokeEvent) =>
    event.sender.send('sendMessage', {
      type: 'newTab',
      data: { path: app.getPath('home') },
    }),
  )
  ipcMain.handle('openUrl', (_event: IpcMainInvokeEvent, url: string) =>
    shell.openExternal(url),
  )
  ipcMain.handle(
    'pasteEntries',
    (_event: IpcMainInvokeEvent, directoryPath) => {
      const paths = paste()
      return postMessage('copyEntries', paths, directoryPath)
    },
  )
  ipcMain.handle(
    'renameEntry',
    (_event: IpcMainInvokeEvent, path: string, newName: string) =>
      postMessage('renameEntry', path, newName),
  )
}

export default registerHandlers
