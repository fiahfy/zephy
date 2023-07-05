import { BrowserWindow, IpcMainInvokeEvent, app, ipcMain } from 'electron'
import windowStateKeeper, { State } from 'electron-window-state'
import fs from 'fs'
import path from 'path'

const windowStateManager = <T>(
  windowCreator: (state: State) => (params?: T) => BrowserWindow
) => {
  const savedDirectoryPath = app.getPath('userData')
  const savedPath = path.join(savedDirectoryPath, 'window-state.json')

  const state: { windows: boolean[] } = { windows: [] }
  const indexes: { [id: number]: number } = {}

  ipcMain.handle('get-window-index', (event: IpcMainInvokeEvent) => {
    const windowId = BrowserWindow.fromWebContents(event.sender)?.id
    if (!windowId) {
      return undefined
    }
    return indexes[windowId]
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isValidState = (state: any): state is { windows: boolean[] } =>
    typeof state === 'object' &&
    Array.isArray(state.windows) &&
    state.windows.every((visible: unknown) => typeof visible === 'boolean')

  const restoreState = () => {
    try {
      const json = fs.readFileSync(savedPath, 'utf8')
      const restored = JSON.parse(json)
      if (isValidState(restored)) {
        state.windows = restored.windows
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

  const openWindow = (index: number, params?: T, options?: Partial<State>) => {
    const windowState = windowStateKeeper({
      path: savedDirectoryPath,
      file: getWindowFilename(index),
    })
    const create = windowCreator({ ...windowState, ...(options ?? {}) })
    const browserWindow = create(params)
    windowState.manage(browserWindow)
    indexes[browserWindow.id] = index
    browserWindow.on('close', () => {
      delete indexes[browserWindow.id]
      state.windows[index] = false
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

  const createWindow = (params?: T) => {
    const index = state.windows.reduce(
      (acc, visible, index) => (visible ? acc : Math.min(index, acc)),
      state.windows.length
    )
    state.windows[index] = true
    return openWindow(index, params, getNewWindowOptions())
  }

  const restoreWindows = () => {
    restoreState()
    return state.windows.reduce(
      (acc, visible, index) => (visible ? [...acc, openWindow(index)] : acc),
      [] as BrowserWindow[]
    )
  }

  const saveWindows = () => {
    saveState()
  }

  return {
    create: createWindow,
    restore: restoreWindows,
    save: saveWindows,
  }
}

export default windowStateManager
