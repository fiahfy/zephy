import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createManager as createWindowManager } from '@fiahfy/electron-window'
import {
  BrowserWindow,
  type BrowserWindowConstructorOptions,
  app,
} from 'electron'
import registerApplicationMenu from './application-menu'
import registerContextMenu from './context-menu'
import registerHandlers from './handlers'
import createWatcher from './watcher'

const dirPath = dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = join(dirPath, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL
export const MAIN_DIST = join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

const watcher = createWatcher()

const baseCreateWindow = (options: BrowserWindowConstructorOptions) => {
  const browserWindow = new BrowserWindow({
    ...options,
    minHeight: 300,
    minWidth: 400,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: join(dirPath, 'preload.mjs'),
      webSecurity: !VITE_DEV_SERVER_URL,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    browserWindow.loadURL(VITE_DEV_SERVER_URL)
    browserWindow.on('ready-to-show', () => {
      browserWindow.webContents.openDevTools()
    })
  } else {
    browserWindow.loadFile(join(RENDERER_DIST, 'index.html'))
  }

  // NOTE: Prevent a new window from occasionally opening when starting a drag operation.
  // @see https://github.com/electron/electron/issues/39839#issuecomment-1749969317
  browserWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))

  watcher.handle(browserWindow)

  return browserWindow
}

const windowManager = createWindowManager(baseCreateWindow)

const createWindow = (directoryPath?: string) => {
  const path = directoryPath ?? app.getPath('home')
  windowManager.create({ directoryPath: path })
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
