import { BrowserWindow, app } from 'electron'
import isDev from 'electron-is-dev'
import prepareNext from 'electron-next'
import { State } from 'electron-window-state'
import { join } from 'path'
import registerApplicationMenu from './applicationMenu'
import registerContextMenu from './contextMenu'
import createFullscreenManager from './fullscreen'
import registerHandlers from './handlers'
import createWatcher from './watcher'
import createWindowStateManager from './windowState'

app.whenReady().then(async () => {
  await prepareNext('./renderer')

  const fullscreenManager = createFullscreenManager()
  const watcher = createWatcher()

  const createWindow = (state: State) => {
    const browserWindow = new BrowserWindow({
      ...state,
      titleBarStyle: process.platform === 'darwin' ? 'hidden' : 'default',
      webPreferences: {
        preload: join(__dirname, 'preload.js'),
        webSecurity: !isDev,
      },
    })

    if (isDev) {
      browserWindow.loadURL('http://localhost:8000/')
      browserWindow.on('ready-to-show', () => {
        browserWindow.webContents.openDevTools()
      })
    } else {
      const pathname = join(__dirname, '../renderer/out/index.html')
      const url = `file://${pathname}`
      browserWindow.loadURL(url)
    }

    fullscreenManager.register(browserWindow)
    watcher.register(browserWindow)

    return browserWindow
  }

  const windowStateManager = createWindowStateManager(createWindow)

  const create = (params?: { directory?: string }) => {
    const directory = params?.directory ?? app.getPath('home')
    windowStateManager.create({ directory })
  }

  registerApplicationMenu(create)
  registerContextMenu(create)
  registerHandlers()

  const browserWindows = windowStateManager.restore()
  if (browserWindows.length === 0) {
    create()
  }

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      create()
    }
  })

  app.on('before-quit', () => {
    windowStateManager.save()
  })
})
