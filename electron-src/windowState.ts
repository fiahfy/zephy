import { BrowserWindow, IpcMainInvokeEvent, app, ipcMain } from 'electron'
import windowStateKeeper, { State } from 'electron-window-state'
import fs from 'fs'
import path from 'path'

const windowStateManager = <T>(
  baseCreateWindow: (state: State) => BrowserWindow
) => {
  const savedDirectoryPath = app.getPath('userData')
  const savedPath = path.join(savedDirectoryPath, 'window-state.json')

  let state: boolean[] = []

  const infos: { [id: number]: { index: number; params?: T } } = {}

  const getWindowId = (event: IpcMainInvokeEvent) =>
    BrowserWindow.fromWebContents(event.sender)?.id

  ipcMain.handle('window-state-get-index', (event: IpcMainInvokeEvent) => {
    const windowId = getWindowId(event)
    return windowId ? infos[windowId]?.index : undefined
  })
  ipcMain.handle('window-state-get-params', (event: IpcMainInvokeEvent) => {
    const windowId = getWindowId(event)
    return windowId ? infos[windowId]?.params : undefined
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isValidState = (state: any): state is boolean[] =>
    Array.isArray(state) &&
    state.every((visible: unknown) => typeof visible === 'boolean')

  const restoreState = () => {
    try {
      const json = fs.readFileSync(savedPath, 'utf8')
      const restored = JSON.parse(json)
      if (isValidState(restored)) {
        state = restored
      }
    } catch (e) {
      // noop
    }
  }

  const saveState = () => {
    const json = JSON.stringify(state)
    fs.writeFileSync(savedPath, json)
  }

  const getWindowFilename = (index: number) => `window-state_${index}.json`

  const createWindow = (
    index: number,
    params?: T,
    options?: Partial<State>
  ) => {
    const windowState = windowStateKeeper({
      path: savedDirectoryPath,
      file: getWindowFilename(index),
    })
    const browserWindow = baseCreateWindow({
      ...windowState,
      ...(options ?? {}),
    })
    windowState.manage(browserWindow)
    infos[browserWindow.id] = { index, params }
    browserWindow.on('close', () => {
      delete infos[browserWindow.id]
      state[index] = false
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
    const index = state.reduce(
      (acc, visible, index) => (visible ? acc : Math.min(index, acc)),
      state.length
    )
    state[index] = true
    return createWindow(index, params, getNewWindowOptions())
  }

  const restore = () => {
    restoreState()
    return state.reduce(
      (acc, visible, index) => (visible ? [...acc, createWindow(index)] : acc),
      [] as BrowserWindow[]
    )
  }

  const save = () => saveState()

  return {
    create,
    restore,
    save,
  }
}

export default windowStateManager
