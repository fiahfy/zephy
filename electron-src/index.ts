import { BrowserWindow, app, net, protocol } from 'electron'
import isDev from 'electron-is-dev'
import prepareNext from 'electron-next'
import { State } from 'electron-window-state'
import { join } from 'path'
import { URL } from 'url'
import registerApplicationMenu from './applicationMenu'
import registerContextMenu from './contextMenu'
import registerHandlers from './handlers'
import createWindowStateManager from './windowState'

const windowCreator = (state: State) => {
  return (params?: { directory?: string }) => {
    const browserWindow = new BrowserWindow({
      ...state,
      titleBarStyle: process.platform === 'darwin' ? 'hidden' : 'default',
      webPreferences: {
        preload: join(__dirname, 'preload.js'),
        webSecurity: !isDev,
      },
    })

    const url = new URL(
      isDev
        ? 'http://localhost:8000/'
        : `file://${join(__dirname, '../renderer/out/index.html')}`
    )
    if (params) {
      const directory = params.directory ?? app.getPath('home')
      url.searchParams.set('directory', directory)
    }
    browserWindow.loadURL(url.href)

    if (isDev) {
      browserWindow.on('ready-to-show', () => {
        browserWindow.webContents.openDevTools()
      })
    }

    browserWindow.on('resize', () => {
      browserWindow.webContents.send('subscribe', 'changeFullscreen', {
        fullscreen: browserWindow.isFullScreen(),
      })
    })

    return browserWindow
  }
}

app.whenReady().then(async () => {
  await prepareNext('./renderer')

  const windowStateManager = createWindowStateManager(windowCreator)
  const browserWindows = windowStateManager.restore()
  if (browserWindows.length === 0) {
    windowStateManager.create({})
  }

  registerApplicationMenu(windowStateManager.create)
  registerContextMenu(windowStateManager.create)
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
      windowStateManager.create({})
    }
  })

  app.on('before-quit', () => {
    windowStateManager.save()
  })
})
