import { BrowserWindow, app, net, protocol } from 'electron'
import isDev from 'electron-is-dev'
import prepareNext from 'electron-next'
import { State } from 'electron-window-state'
import { join } from 'path'
import registerApplicationMenu from './applicationMenu'
import registerContextMenu from './contextMenu'
import registerHandlers from './handlers'
import createWindowStateManager from './windowState'

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
    browserWindow.webContents.openDevTools()
  } else {
    const pathname = join(__dirname, '../renderer/out/index.html')
    const url = `file://${pathname}`
    browserWindow.loadURL(url)
  }

  browserWindow.on('resize', () => {
    browserWindow.webContents.send('subscribe', 'changeFullscreen', {
      fullscreen: browserWindow.isFullScreen(),
    })
  })

  return browserWindow
}

app.whenReady().then(async () => {
  await prepareNext('./renderer')

  const windowStateManager = createWindowStateManager(createWindow)
  const create = (params?: { directory?: string }) => {
    const directory = params?.directory ?? app.getPath('home')
    windowStateManager.create({ directory })
  }

  const browserWindows = windowStateManager.restore()
  if (browserWindows.length === 0) {
    create()
  }

  registerApplicationMenu(create)
  registerContextMenu(create)
  registerHandlers()

  // @see https://github.com/electron/electron/issues/23757#issuecomment-640146333
  protocol.handle('file', (request) => {
    return net.fetch(request.url)
  })

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
