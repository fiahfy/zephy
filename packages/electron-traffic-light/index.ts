import { BrowserWindow, IpcMainInvokeEvent, ipcMain } from 'electron'

export const createManager = () => {
  const channelPrefix = 'electron-traffic-lights'
  const isMac = process.platform === 'darwin'

  const isVisible = (isFullScreen: boolean) => isMac && !isFullScreen

  ipcMain.handle(`${channelPrefix}-is-visible`, (event: IpcMainInvokeEvent) => {
    const isFullScreen =
      BrowserWindow.fromWebContents(event.sender)?.isFullScreen() ?? false
    return isVisible(isFullScreen)
  })

  const handle = (browserWindow: BrowserWindow) => {
    browserWindow.on('resize', () => {
      browserWindow.webContents.send(
        `${channelPrefix}-send`,
        isVisible(browserWindow.isFullScreen()),
      )
    })
  }

  return { handle }
}
