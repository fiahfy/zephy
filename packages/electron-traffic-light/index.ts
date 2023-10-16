import { BrowserWindow, IpcMainInvokeEvent, ipcMain } from 'electron'

export const createManager = () => {
  const channelPrefix = 'electron-traffic-light'
  const isMac = process.platform === 'darwin'

  const isVisible = (browserWindow: BrowserWindow) => {
    const isFullScreen = browserWindow.isFullScreen()
    const visible = visibilities[browserWindow.id] ?? true
    return isMac && !isFullScreen && visible
  }

  const visibilities: { [id: number]: boolean } = {}

  ipcMain.handle(`${channelPrefix}-is-visible`, (event: IpcMainInvokeEvent) => {
    const browserWindow = BrowserWindow.fromWebContents(event.sender)
    if (!browserWindow) {
      return false
    }
    return isVisible(browserWindow)
  })

  ipcMain.handle(
    `${channelPrefix}-set-visible`,
    (event: IpcMainInvokeEvent, visible: boolean) => {
      const browserWindow = BrowserWindow.fromWebContents(event.sender)
      if (!browserWindow) {
        return
      }
      visibilities[browserWindow.id] = visible
      browserWindow.setWindowButtonVisibility(visible)
      browserWindow.webContents.send(
        `${channelPrefix}-send`,
        isVisible(browserWindow),
      )
    },
  )

  const handle = (browserWindow: BrowserWindow) => {
    browserWindow.on('enter-full-screen', () =>
      browserWindow.webContents.send(
        `${channelPrefix}-send`,
        isVisible(browserWindow),
      ),
    )
    browserWindow.on('leave-full-screen', () =>
      browserWindow.webContents.send(
        `${channelPrefix}-send`,
        isVisible(browserWindow),
      ),
    )
  }

  return { handle }
}
