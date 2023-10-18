import { BrowserWindow, BrowserWindowConstructorOptions, app } from 'electron'
import { createManager as createTrafficLightManager } from 'electron-traffic-light'
import { createManager as createWindowManager } from 'electron-window'
import { join } from 'node:path'
import registerApplicationMenu from './applicationMenu'
import registerContextMenu from './contextMenu'
import registerHandlers from './handlers'
import createWatcher from './watcher'

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.DIST = join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged
  ? process.env.DIST
  : join(process.env.DIST, '../public')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

const trafficLightManager = createTrafficLightManager()
const watcher = createWatcher()

const baseCreateWindow = (options: BrowserWindowConstructorOptions) => {
  const browserWindow = new BrowserWindow({
    ...options,
    minHeight: 300,
    minWidth: 400,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      webSecurity: !VITE_DEV_SERVER_URL,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    browserWindow.loadURL(VITE_DEV_SERVER_URL)
    browserWindow.on('ready-to-show', () => {
      browserWindow.webContents.openDevTools()
    })
  } else {
    browserWindow.loadFile(join(process.env.DIST, 'index.html'))
  }

  trafficLightManager.handle(browserWindow)
  watcher.handle(browserWindow)

  return browserWindow
}

const windowManager = createWindowManager(baseCreateWindow)

const createWindow = async (directoryPath?: string) => {
  const path = directoryPath ?? app.getPath('home')
  await windowManager.create({ directoryPath: path })
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', async () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    await createWindow()
  }
})

app.on('before-quit', async () => {
  await windowManager.save()
})

app.whenReady().then(async () => {
  registerApplicationMenu(createWindow)
  registerContextMenu(createWindow)
  registerHandlers(watcher)

  const browserWindows = await windowManager.restore()
  if (browserWindows.length === 0) {
    await createWindow()
  }
})
