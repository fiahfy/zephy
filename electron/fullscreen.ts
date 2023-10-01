import { BrowserWindow, IpcMainInvokeEvent, ipcMain } from 'electron'

const fullscreenManager = () => {
  ipcMain.handle(
    'fullscreen-is-entered',
    (event: IpcMainInvokeEvent) =>
      BrowserWindow.fromWebContents(event.sender)?.isFullScreen() ?? false,
  )

  const register = (browserWindow: BrowserWindow) => {
    browserWindow.on('resize', () => {
      browserWindow.webContents.send(
        'fullscreen-send',
        browserWindow.isFullScreen(),
      )
    })
  }

  return { register }
}

export default fullscreenManager
