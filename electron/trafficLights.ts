import { BrowserWindow, IpcMainInvokeEvent, ipcMain } from 'electron'

const trafficLightsManager = () => {
  const isMac = process.platform === 'darwin'

  const isVisible = (isFullScreen: boolean) => isMac && !isFullScreen

  const register = (browserWindow: BrowserWindow) => {
    browserWindow.on('resize', () => {
      browserWindow.webContents.send(
        'traffic-lights-send',
        isVisible(browserWindow.isFullScreen()),
      )
    })
  }

  ipcMain.handle('traffic-lights-is-visible', (event: IpcMainInvokeEvent) => {
    const isFullScreen =
      BrowserWindow.fromWebContents(event.sender)?.isFullScreen() ?? false
    return isVisible(isFullScreen)
  })

  return { register }
}

export default trafficLightsManager
