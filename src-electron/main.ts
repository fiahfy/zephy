import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import {
  createManager as createWindowManager,
  type WindowCreator,
} from '@fiahfy/electron-window'
import { app, BrowserWindow } from 'electron'
import started from 'electron-squirrel-startup'
import registerApplicationMenu from './application-menu'
import registerContextMenu from './context-menu'
import registerHandlers from './handlers'
import createWatcher from './watcher'

const dirPath = dirname(fileURLToPath(import.meta.url))

const watcher = createWatcher()

const windowCreator: WindowCreator = (optionsResolver) => {
  const browserWindow = new BrowserWindow({
    ...optionsResolver({
      height: 768,
      width: 1024 + (MAIN_WINDOW_VITE_DEV_SERVER_URL ? 512 : 0),
    }),
    minHeight: 270,
    minWidth: 400,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: join(dirPath, 'preload.js'),
      webSecurity: !MAIN_WINDOW_VITE_DEV_SERVER_URL,
    },
  })

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    browserWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
    browserWindow.on('ready-to-show', () => {
      browserWindow.webContents.openDevTools()
    })
  } else {
    browserWindow.loadFile(
      join(dirPath, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    )
  }

  // NOTE: Prevent a new window from occasionally opening when starting a drag operation.
  // @see https://github.com/electron/electron/issues/39839#issuecomment-1749969317
  browserWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))

  watcher.handle(browserWindow)

  return browserWindow
}

const windowManager = createWindowManager(windowCreator)

const createWindow = (url?: string) => {
  const targetUrl = url ?? pathToFileURL(app.getPath('home')).href
  windowManager.create({ url: targetUrl })
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit()
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.on('before-quit', () => {
  windowManager.save()
})

app.whenReady().then(() => {
  registerApplicationMenu(createWindow)
  registerContextMenu(createWindow)
  registerHandlers(watcher)

  const browserWindows = windowManager.restore()
  if (browserWindows.length === 0) {
    createWindow()
  }
})
