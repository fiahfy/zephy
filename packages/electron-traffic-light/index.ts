import { BrowserWindow, IpcMainInvokeEvent, ipcMain } from 'electron'

export const createManager = () => {
  const isMac = process.platform === 'darwin'

  const getVisibility = (browserWindow: BrowserWindow) => {
    const isFullScreen = browserWindow.isFullScreen()
    const visibility = visibilities[browserWindow.id] ?? true
    return isMac && !isFullScreen && visibility
  }

  const visibilities: { [id: number]: boolean } = {}

  ipcMain.handle('getTrafficLightVisibility', (event: IpcMainInvokeEvent) => {
    const browserWindow = BrowserWindow.fromWebContents(event.sender)
    if (!browserWindow) {
      return false
    }
    return getVisibility(browserWindow)
  })

  ipcMain.handle(
    'setTrafficLightVisibility',
    (event: IpcMainInvokeEvent, visibility: boolean) => {
      if (!isMac) {
        return
      }
      const browserWindow = BrowserWindow.fromWebContents(event.sender)
      if (!browserWindow) {
        return
      }
      visibilities[browserWindow.id] = visibility
      browserWindow.setWindowButtonVisibility(visibility)
      browserWindow.webContents.send(
        'sendTrafficLightVisibility',
        getVisibility(browserWindow),
      )
    },
  )

  const handle = (browserWindow: BrowserWindow) => {
    browserWindow.on('enter-full-screen', () =>
      browserWindow.webContents.send(
        'sendTrafficLightVisibility',
        getVisibility(browserWindow),
      ),
    )
    browserWindow.on('leave-full-screen', () =>
      browserWindow.webContents.send(
        'sendTrafficLightVisibility',
        getVisibility(browserWindow),
      ),
    )
  }

  return { handle }
}
