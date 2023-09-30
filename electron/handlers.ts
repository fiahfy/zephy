import { IpcMainInvokeEvent, ipcMain, shell } from 'electron'
import { basename, dirname } from 'node:path'
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
  ipcMain.handle('entry-copy', (_event: IpcMainInvokeEvent, paths: string[]) =>
    copy(paths),
  )
  ipcMain.handle(
    'entry-create-directory',
    (_event: IpcMainInvokeEvent, directoryPath: string) =>
      createDirectory(directoryPath),
  )
  ipcMain.handle(
    'entry-create-thumbnail-url',
    (_event: IpcMainInvokeEvent, path: string) => createThumbnailUrl(path),
  )
  ipcMain.handle(
    'entry-get-detailed-entries',
    (_event: IpcMainInvokeEvent, directoryPath: string) =>
      getDetailedEntries(directoryPath),
  )
  ipcMain.handle(
    'entry-get-detailed-entries-for-paths',
    (_event: IpcMainInvokeEvent, paths: string[]) =>
      getDetailedEntriesForPaths(paths),
  )
  ipcMain.handle(
    'entry-get-detailed-entry',
    (_event: IpcMainInvokeEvent, path: string) => getDetailedEntry(path),
  )
  ipcMain.handle(
    'entry-get-entries',
    (_event: IpcMainInvokeEvent, directoryPath: string) =>
      getEntries(directoryPath),
  )
  ipcMain.handle(
    'entry-get-entry-hierarchy',
    (_event: IpcMainInvokeEvent, path?: string) => getEntryHierarchy(path),
  )
  ipcMain.handle(
    'entry-get-metadata',
    (_event: IpcMainInvokeEvent, path: string) => getMetadata(path),
  )
  ipcMain.handle(
    'entry-move',
    (_event: IpcMainInvokeEvent, paths: string[], directoryPath: string) =>
      moveEntries(paths, directoryPath),
  )
  ipcMain.handle(
    'entry-move-to-trash',
    (_event: IpcMainInvokeEvent, paths: string[]) =>
      Promise.all(
        paths.map(async (path) => {
          await shell.trashItem(path)
          // notify event manually because chokidar doesn't detect trashItem event
          watcher.notify('delete', dirname(path), path)
        }),
      ),
  )
  ipcMain.handle('entry-open', (_event: IpcMainInvokeEvent, path: string) =>
    shell.openPath(path),
  )
  ipcMain.handle('entry-paste', (_event: IpcMainInvokeEvent, directoryPath) =>
    paste(directoryPath),
  )
  ipcMain.handle(
    'entry-rename',
    (_event: IpcMainInvokeEvent, path: string, newName: string) =>
      renameEntry(path, newName),
  )
  ipcMain.handle('node-basename', (_event: IpcMainInvokeEvent, path: string) =>
    basename(path),
  )
  ipcMain.handle('node-dirname', (_event: IpcMainInvokeEvent, path: string) =>
    dirname(path),
  )
  ipcMain.handle('node-is-darwin', () => process.platform === 'darwin')
}

export default registerHandlers
