import { dirname, join, sep } from 'node:path'
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
  moveEntry,
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
      data: { url: pathToFileURL(app.getPath('home')).href },
    }),
  )
  ipcMain.on('paste', (event: IpcMainEvent) =>
    BrowserWindow.fromWebContents(event.sender)?.webContents.paste(),
  )
  ipcMain.on('pathToFileURL', (event: IpcMainEvent, path: string) => {
    try {
      event.returnValue = pathToFileURL(path).href
    } catch {
      event.returnValue = undefined
    }
  })
  ipcMain.on('selectAll', (event: IpcMainEvent) =>
    BrowserWindow.fromWebContents(event.sender)?.webContents.selectAll(),
  )
  ipcMain.on('sep', (event: IpcMainEvent) => {
    event.returnValue = sep
  })
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
    (_event: IpcMainInvokeEvent, path: string | string[]) =>
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
    'moveEntry',
    async (_event: IpcMainInvokeEvent, path: string, directoryPath: string) => {
      const entry = await moveEntry(path, directoryPath)
      if (entry.path !== path) {
        // NOTE: Notify event manually due to intermittent failures
        setTimeout(() => {
          watcher.notify('delete', dirname(path), path)
          watcher.notify('create', dirname(entry.path), entry.path)
        })
      }
      return entry
    },
  )
  ipcMain.handle(
    'moveEntryToTrash',
    async (_event: IpcMainInvokeEvent, path: string) => {
      await shell.trashItem(path)
      // NOTE: Notify event manually due to intermittent failures
      //       Send delete events asynchronously to prevent invalid focus/selection behavior
      setTimeout(() => watcher.notify('delete', dirname(path), path))
    },
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
    async (_event: IpcMainInvokeEvent, path: string, newName: string) => {
      const entry = await renameEntry(path, newName)
      // NOTE: No delete events are emitted when only changing letter case (uppercase/lowercase)
      //       Send delete events asynchronously to prevent temporary disappearance of entries
      setTimeout(() => watcher.notify('delete', dirname(path), path))
      return entry
    },
  )
}

const registerHandlers = (watcher: ReturnType<typeof createWatcher>) => {
  registerElectronHandlers()
  registerEntryHandlers(watcher)
}

export default registerHandlers
