import { BrowserWindow, IpcMainInvokeEvent, app, ipcMain } from 'electron'
import windowStateKeeper, { State } from 'electron-window-state'
import fs from 'fs'
import path from 'path'

const windowManager = <T>(
  baseCreateWindow: (state: State) => BrowserWindow,
) => {
  const savedDirectoryPath = app.getPath('userData')
  const savedPath = path.join(savedDirectoryPath, 'window-state.json')

  let visibilities: boolean[] = []

  const details: { [id: number]: { index: number; params?: T } } = {}

  const getWindowId = (event: IpcMainInvokeEvent) =>
    BrowserWindow.fromWebContents(event.sender)?.id

  ipcMain.handle('window-get-details', (event: IpcMainInvokeEvent) => {
    const windowId = getWindowId(event)
    return windowId ? details[windowId] : undefined
  })
  ipcMain.handle('window-open', (event: IpcMainInvokeEvent, params?: T) =>
    create(params),
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isVisibilities = (visibilities: any): visibilities is boolean[] =>
    Array.isArray(visibilities) &&
    visibilities.every((visible: unknown) => typeof visible === 'boolean')

  const restoreVisibilities = () => {
    try {
      const json = fs.readFileSync(savedPath, 'utf8')
      const restored = JSON.parse(json)
      if (isVisibilities(restored)) {
        visibilities = restored
      }
    } catch (e) {
      // noop
    }
  }

  const saveVisibilities = () => {
    const json = JSON.stringify(visibilities)
    fs.writeFileSync(savedPath, json)
  }

  const getWindowFile = (index: number) => `window-state_${index}.json`

  const createWindow = (
    index: number,
    params?: T,
    options?: Partial<State>,
  ) => {
    const windowState = windowStateKeeper({
      path: savedDirectoryPath,
      file: getWindowFile(index),
    })
    const browserWindow = baseCreateWindow({
      ...windowState,
      ...(options ?? {}),
    })
    windowState.manage(browserWindow)

    details[browserWindow.id] = { index, params }

    browserWindow.on('close', () => {
      delete details[browserWindow.id]
      visibilities[index] = false
    })

    return browserWindow
  }

  const getNewWindowOptions = () => {
    const activeWindow = BrowserWindow.getFocusedWindow()
    if (!activeWindow) {
      return {}
    }

    const bounds = activeWindow.getBounds()

    return {
      ...bounds,
      x: bounds.x + 30,
      y: bounds.y + 30,
    }
  }

  const create = (params?: T) => {
    const index = visibilities.reduce(
      (acc, visible, index) => (visible ? acc : Math.min(index, acc)),
      visibilities.length,
    )
    visibilities[index] = true
    return createWindow(index, params, getNewWindowOptions())
  }

  const restore = () => {
    restoreVisibilities()
    return visibilities.reduce(
      (acc, visible, index) => (visible ? [...acc, createWindow(index)] : acc),
      [] as BrowserWindow[],
    )
  }

  const save = () => saveVisibilities()

  return {
    create,
    restore,
    save,
  }
}

export default windowManager
