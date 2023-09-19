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

const registerHandlers = (
  notify: (
    eventType: 'create' | 'delete',
    directoryPath: string,
    filePath: string,
  ) => void,
) => {
  ipcMain.handle('basename', (_event: IpcMainInvokeEvent, path: string) =>
    basename(path),
  )
  ipcMain.handle(
    'copy-entries',
    (_event: IpcMainInvokeEvent, paths: string[]) => copy(paths),
  )
  ipcMain.handle(
    'create-directory',
    (_event: IpcMainInvokeEvent, directoryPath: string) =>
      createDirectory(directoryPath),
  )
  ipcMain.handle(
    'create-thumbnail-url',
    (_event: IpcMainInvokeEvent, path: string) => createThumbnailUrl(path),
  )
  ipcMain.handle('dirname', (_event: IpcMainInvokeEvent, path: string) =>
    dirname(path),
  )
  ipcMain.handle(
    'get-detailed-entries',
    (_event: IpcMainInvokeEvent, directoryPath: string) =>
      getDetailedEntries(directoryPath),
  )
  ipcMain.handle(
    'get-detailed-entries-for-paths',
    (_event: IpcMainInvokeEvent, paths: string[]) =>
      getDetailedEntriesForPaths(paths),
  )
  ipcMain.handle(
    'get-detailed-entry',
    (_event: IpcMainInvokeEvent, path: string) => getDetailedEntry(path),
  )
  ipcMain.handle(
    'get-entries',
    (_event: IpcMainInvokeEvent, directoryPath: string) =>
      getEntries(directoryPath),
  )
  ipcMain.handle(
    'get-entry-hierarchy',
    (_event: IpcMainInvokeEvent, path?: string) => getEntryHierarchy(path),
  )
  ipcMain.handle('get-metadata', (_event: IpcMainInvokeEvent, path: string) =>
    getMetadata(path),
  )
  ipcMain.handle('is-darwin', () => process.platform === 'darwin')
  ipcMain.handle(
    'move-entries',
    (_event: IpcMainInvokeEvent, paths: string[], directoryPath: string) =>
      moveEntries(paths, directoryPath),
  )
  ipcMain.handle('open-path', (_event: IpcMainInvokeEvent, path: string) =>
    shell.openPath(path),
  )
  ipcMain.handle('paste-entries', (_event: IpcMainInvokeEvent, directoryPath) =>
    paste(directoryPath),
  )
  ipcMain.handle(
    'rename-entry',
    (_event: IpcMainInvokeEvent, path: string, newName: string) =>
      renameEntry(path, newName),
  )
  ipcMain.handle(
    'trash-entries',
    (_event: IpcMainInvokeEvent, paths: string[]) =>
      Promise.all(
        paths.map(async (path) => {
          await shell.trashItem(path)
          // notify event manually because chokidar doesn't detect trashItem event
          notify('delete', dirname(path), path)
        }),
      ),
  )
}

export default registerHandlers
