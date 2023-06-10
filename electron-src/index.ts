import { BrowserWindow, app, protocol } from 'electron'
import isDev from 'electron-is-dev'
import prepareNext from 'electron-next'
import { State } from 'electron-window-state'
import { join } from 'path'
import { createApplicationMenu } from './application-menu'
import { createContextMenu } from './context-menu'
import { addHandlers } from './handlers'
import createWindowStateManager from './window-state-manager'

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

  return browserWindow
}

const windowStateManager = createWindowStateManager(createWindow)

app.whenReady().then(async () => {
  await prepareNext('./renderer')

  windowStateManager.restore()

  addHandlers()
  createApplicationMenu(windowStateManager.create)
  createContextMenu()

  // @see https://github.com/electron/electron/issues/23757#issuecomment-640146333
  protocol.registerFileProtocol('file', (request, callback) => {
    const pathname = decodeURIComponent(request.url.replace('file:///', ''))
    callback(pathname)
  })
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
