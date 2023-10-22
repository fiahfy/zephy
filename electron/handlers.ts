import { IpcMainInvokeEvent, ipcMain, shell } from 'electron'
import { dirname } from 'node:path'
import { copy, paste } from './utils/clipboard'
import { createThumbnailUrl, getMetadata } from './utils/ffmpeg'
import {
  createDirectory,
  getDetailedEntries,
  getDetailedEntriesForPaths,
  getDetailedEntry,
  getEntries,
  getEntryHierarchy,
  moveEntries,
  renameEntry,
} from './utils/file'
import createWatcher from './watcher'

const registerHandlers = (watcher: ReturnType<typeof createWatcher>) => {
  ipcMain.handle('copyEntries', (_event: IpcMainInvokeEvent, paths: string[]) =>
    copy(paths),
  )
  ipcMain.handle(
    'createDirectory',
    (_event: IpcMainInvokeEvent, directoryPath: string) =>
      createDirectory(directoryPath),
  )
  ipcMain.handle(
    'createEntryThumbnailUrl',
    (_event: IpcMainInvokeEvent, path: string) => createThumbnailUrl(path),
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
    'getEntryHierarchy',
    (_event: IpcMainInvokeEvent, path?: string) => getEntryHierarchy(path),
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
  ipcMain.handle('pasteEntries', (_event: IpcMainInvokeEvent, directoryPath) =>
    paste(directoryPath),
  )
  ipcMain.handle(
    'renameEntry',
    (_event: IpcMainInvokeEvent, path: string, newName: string) =>
      renameEntry(path, newName),
  )
}

export default registerHandlers
