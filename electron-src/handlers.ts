import { IpcMainInvokeEvent, ipcMain, shell } from 'electron'
import { dirname } from 'path'
import {
  createThumbnail,
  createVideoThumbnails,
  getMetadata,
} from './utils/ffmpeg'
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

const registerHandlers = () => {
  ipcMain.handle(
    'create-directory',
    (_event: IpcMainInvokeEvent, directoryPath: string) =>
      createDirectory(directoryPath),
  )
  ipcMain.handle(
    'create-thumbnail',
    (_event: IpcMainInvokeEvent, path: string) => createThumbnail(path),
  )
  ipcMain.handle(
    'create-video-thumbnails',
    (_event: IpcMainInvokeEvent, path: string) => createVideoThumbnails(path),
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
    'get-directory-path',
    (_event: IpcMainInvokeEvent, path: string) => dirname(path),
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
      // TODO: prevent duplicated filename
      moveEntries(paths, directoryPath),
  )
  ipcMain.handle('open-path', (_event: IpcMainInvokeEvent, path: string) =>
    shell.openPath(path),
  )
  ipcMain.handle(
    'rename-entry',
    (_event: IpcMainInvokeEvent, path: string, newName: string) =>
      renameEntry(path, newName),
  )
  ipcMain.handle(
    'trash-entries',
    (_event: IpcMainInvokeEvent, paths: string[]) =>
      Promise.all(paths.map((path) => shell.trashItem(path))),
  )
}

export default registerHandlers
