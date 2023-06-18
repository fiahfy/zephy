import { basename, dirname } from 'path'
import {
  BrowserWindow,
  IpcMainInvokeEvent,
  app,
  ipcMain,
  shell,
} from 'electron'
import { createThumbnail, getMetadata } from './utils/ffmpeg'
import {
  getDetailedEntries,
  getEntries,
  getEntryHierarchy,
} from './utils/entry'

const registerHandlers = () => {
  ipcMain.handle('basename', (_event: IpcMainInvokeEvent, path: string) =>
    basename(path)
  )
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
  ipcMain.handle('trash-item', (_event: IpcMainInvokeEvent, path: string) =>
    shell.trashItem(path)
  )

  ipcMain.handle(
    'get-detailed-entries',
    (_event: IpcMainInvokeEvent, path: string) => getDetailedEntries(path)
  )
  ipcMain.handle('get-entries', (_event: IpcMainInvokeEvent, path: string) =>
    getEntries(path)
  )
  ipcMain.handle(
    'get-entry-hierarchy',
    (_event: IpcMainInvokeEvent, path: string) => getEntryHierarchy(path)
  )
  ipcMain.handle(
    'create-thumbnail',
    (_event: IpcMainInvokeEvent, path: string) => createThumbnail(path)
  )
  ipcMain.handle('get-metadata', (_event: IpcMainInvokeEvent, path: string) =>
    getMetadata(path)
  )
}

export default registerHandlers
