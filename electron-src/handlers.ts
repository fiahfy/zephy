import { dirname } from 'path'
import {
  BrowserWindow,
  IpcMainInvokeEvent,
  app,
  ipcMain,
  shell,
} from 'electron'
import {
  createThumbnail,
  createVideoThumbnails,
  getMetadata,
} from './utils/ffmpeg'
import {
  createDirectory,
  createWatcher,
  getDetailedEntries,
  getDetailedEntriesForPaths,
  getDetailedEntry,
  getEntries,
  getEntryHierarchy,
  parsePath,
  renameEntry,
} from './utils/file'

const directoryWatcher = createWatcher()
const directoryHierarchyWatcher = createWatcher()

const registerHandlers = () => {
  ipcMain.handle('darwin', () => process.platform === 'darwin')
  ipcMain.handle('dirname', (_event: IpcMainInvokeEvent, path: string) =>
    dirname(path)
  )
  ipcMain.handle('get-home-path', () => app.getPath('home'))
  // window
  ipcMain.handle(
    'get-window-id',
    (event: IpcMainInvokeEvent) =>
      BrowserWindow.fromWebContents(event.sender)?.id
  )
  ipcMain.handle(
    'is-fullscreen',
    (event: IpcMainInvokeEvent) =>
      BrowserWindow.fromWebContents(event.sender)?.isFullScreen() ?? false
  )
  // shell
  ipcMain.handle('open-path', (_event: IpcMainInvokeEvent, path: string) =>
    shell.openPath(path)
  )
  ipcMain.handle('trash-items', (_event: IpcMainInvokeEvent, paths: string[]) =>
    Promise.all(paths.map((path) => shell.trashItem(path)))
  )

  ipcMain.handle(
    'get-detailed-entries',
    (_event: IpcMainInvokeEvent, directoryPath: string) =>
      getDetailedEntries(directoryPath)
  )
  ipcMain.handle(
    'get-detailed-entries-for-paths',
    (_event: IpcMainInvokeEvent, paths: string[]) =>
      getDetailedEntriesForPaths(paths)
  )
  ipcMain.handle(
    'get-detailed-entry',
    (_event: IpcMainInvokeEvent, path: string) => getDetailedEntry(path)
  )
  ipcMain.handle(
    'get-entries',
    (_event: IpcMainInvokeEvent, directoryPath: string) =>
      getEntries(directoryPath)
  )
  ipcMain.handle(
    'get-entry-hierarchy',
    (_event: IpcMainInvokeEvent, path: string) => getEntryHierarchy(path)
  )
  ipcMain.handle('get-metadata', (_event: IpcMainInvokeEvent, path: string) =>
    getMetadata(path)
  )
  ipcMain.handle(
    'create-directory',
    (_event: IpcMainInvokeEvent, directoryPath: string) =>
      createDirectory(directoryPath)
  )
  ipcMain.handle(
    'create-thumbnail',
    (_event: IpcMainInvokeEvent, path: string) => createThumbnail(path)
  )
  ipcMain.handle(
    'create-video-thumbnails',
    (_event: IpcMainInvokeEvent, path: string) => createVideoThumbnails(path)
  )
  ipcMain.handle(
    'rename-entry',
    (_event: IpcMainInvokeEvent, path: string, newName: string) =>
      renameEntry(path, newName)
  )
  ipcMain.handle('watch-directory', (event: IpcMainInvokeEvent, path: string) =>
    directoryWatcher.watch(path, (eventType, path) =>
      event.sender.send('watch-directory', eventType, path)
    )
  )
  ipcMain.handle(
    'watch-directory-hierarchy',
    (event: IpcMainInvokeEvent, paths: string[]) =>
      directoryHierarchyWatcher.watch(paths, (eventType, path) =>
        event.sender.send(
          'watch-directory-hierarchy',
          eventType,
          dirname(path),
          path
        )
      )
  )
  ipcMain.handle('parse-path', (event: IpcMainInvokeEvent, path: string) =>
    parsePath(path)
  )
}

export default registerHandlers
