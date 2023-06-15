import { BrowserWindow, app, protocol } from 'electron'
import isDev from 'electron-is-dev'
import prepareNext from 'electron-next'
import { State } from 'electron-window-state'
import { join } from 'path'
import registerApplicationMenu from './application-menu'
import registerContextMenu from './context-menu'
import registerFfmpegHandlers from './ffmpeg'
import { addHandlers } from './handlers'
import createWindowStateManager from './window-state'

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
    browserWindow.webContents.send(
      'subscription-fullscreen',
      browserWindow.isFullScreen()
    )
  })

  return browserWindow
}

app.whenReady().then(async () => {
  await prepareNext('./renderer')

  const windowStateManager = createWindowStateManager(createWindow)
  windowStateManager.restore()

  registerApplicationMenu(windowStateManager.create)
  registerContextMenu()
  registerFfmpegHandlers()
  addHandlers()

  // @see https://github.com/electron/electron/issues/23757#issuecomment-640146333
  protocol.registerFileProtocol('file', (request, callback) => {
    const pathname = decodeURIComponent(request.url.replace('file:///', ''))
    callback(pathname)
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      windowStateManager.create()
    }
  })

  app.on('before-quit', () => {
    windowStateManager.save()
  })
})
