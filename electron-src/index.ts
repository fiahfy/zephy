import { BrowserWindow, app } from 'electron'
import isDev from 'electron-is-dev'
import prepareNext from 'electron-next'
import { State } from 'electron-window-state'
import { join } from 'node:path'
import registerApplicationMenu from '~/applicationMenu'
import registerContextMenu from '~/contextMenu'
import createFullscreenManager from '~/fullscreen'
import registerHandlers from '~/handlers'
import createWatcher from '~/watcher'
import createWindowManager from '~/window'

app.whenReady().then(async () => {
  await prepareNext('./renderer')

  const fullscreenManager = createFullscreenManager()
  const watcher = createWatcher()

  const baseCreateWindow = (state: State) => {
    const browserWindow = new BrowserWindow({
      ...state,
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
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

  const windowManager = createWindowManager(baseCreateWindow)

  const createWindow = () => {
    const directory = app.getPath('home')
    windowManager.create({ directory })
  }

  registerApplicationMenu()
  registerContextMenu()
  registerHandlers(watcher.notify)

  const browserWindows = await windowManager.restore()
  if (browserWindows.length === 0) {
    createWindow()
  }

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })

  app.on('before-quit', async () => {
    await windowManager.save()
  })
})
