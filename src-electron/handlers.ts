import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import {
  app,
  BrowserWindow,
  type IpcMainEvent,
  type IpcMainInvokeEvent,
  ipcMain,
  nativeImage,
  shell,
} from 'electron'
import { readPaths, writePaths } from './utils/clipboard'
import { getEntryParameters } from './utils/exif'
import { createThumbnailUrl, getMetadata } from './utils/ffmpeg'
import {
  copyEntries,
  createDirectory,
  getEntries,
  getEntriesForPaths,
  getEntry,
  getRootEntry,
  moveEntries,
  renameEntry,
} from './utils/file'
import type createWatcher from './watcher'

const thumbnailDir = join(app.getPath('userData'), 'thumbnails')

// NOTE: 1x1 transparent png
const dataUrl =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQI12NgYAAAAAMAASDVlMcAAAAASUVORK5CYII='
const icon = nativeImage.createFromDataURL(dataUrl)

const registerElectronHandlers = () => {
  ipcMain.on('copy', (event: IpcMainEvent) =>
    BrowserWindow.fromWebContents(event.sender)?.webContents.copy(),
  )
  ipcMain.on('cut', (event: IpcMainEvent) =>
    BrowserWindow.fromWebContents(event.sender)?.webContents.cut(),
  )
  ipcMain.on('fileURLToPath', (event: IpcMainEvent, url: string) => {
    try {
      event.returnValue = fileURLToPath(url)
    } catch {
      event.returnValue = undefined
    }
  })
  ipcMain.on('openExternal', (_event: IpcMainEvent, url: string) =>
    shell.openExternal(url),
  )
  ipcMain.on('openTab', (event: IpcMainEvent) =>
    event.sender.send('onMessage', {
      type: 'newTab',
      data: { path: app.getPath('home') },
    }),
  )
  ipcMain.on('paste', (event: IpcMainEvent) =>
    BrowserWindow.fromWebContents(event.sender)?.webContents.paste(),
  )
  ipcMain.on('pathToFileURL', (event: IpcMainEvent, path: string) => {
    event.returnValue = pathToFileURL(path).href
  })
  ipcMain.on('selectAll', (event: IpcMainEvent) =>
    BrowserWindow.fromWebContents(event.sender)?.webContents.selectAll(),
  )
  ipcMain.on('startDrag', (event: IpcMainEvent, paths: string[]) =>
    event.sender.startDrag({
      file: '',
      files: paths,
      icon,
    }),
  )
}

const registerEntryHandlers = (watcher: ReturnType<typeof createWatcher>) => {
  ipcMain.on('copyEntries', (_event: IpcMainEvent, paths: string[]) =>
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
    'getEntries',
    (_event: IpcMainInvokeEvent, directoryPath: string) =>
      getEntries(directoryPath),
  )
  ipcMain.handle(
    'getEntriesForPaths',
    (_event: IpcMainInvokeEvent, paths: string[]) => getEntriesForPaths(paths),
  )
  ipcMain.handle('getEntry', (_event: IpcMainInvokeEvent, path: string) =>
    getEntry(path),
  )
  ipcMain.handle(
    'getEntryMetadata',
    (_event: IpcMainInvokeEvent, path: string) => getMetadata(path),
  )
  ipcMain.handle(
    'getEntryParameters',
    (_event: IpcMainInvokeEvent, path: string) => getEntryParameters(path),
  )
  ipcMain.handle(
    'getParentEntry',
    (_event: IpcMainInvokeEvent, path: string) => {
      const parentPath = dirname(path)
      return getEntry(parentPath)
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
  ipcMain.on('moveEntriesToTrash', (_event: IpcMainEvent, paths: string[]) =>
    Promise.all(
      paths.map(async (path) => {
        await shell.trashItem(path)
        // NOTE: Notify event manually because chokidar doesn't detect trashItem event
        watcher.notify('delete', dirname(path), path)
      }),
    ),
  )
  ipcMain.on('openEntry', (_event: IpcMainEvent, path: string) =>
    shell.openPath(path),
  )
  ipcMain.on('pasteEntries', (_event: IpcMainEvent, directoryPath) => {
    const paths = readPaths()
    return copyEntries(paths, directoryPath)
  })
  ipcMain.handle(
    'renameEntry',
    (_event: IpcMainInvokeEvent, path: string, newName: string) =>
      renameEntry(path, newName),
  )
}

const registerHandlers = (watcher: ReturnType<typeof createWatcher>) => {
  registerElectronHandlers()
  registerEntryHandlers(watcher)
}

export default registerHandlers
