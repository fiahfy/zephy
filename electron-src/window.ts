import { BrowserWindow, IpcMainInvokeEvent, app, ipcMain } from 'electron'
import windowStateKeeper, { State } from 'electron-window-state'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const windowManager = <T>(
  baseCreateWindow: (state: State) => BrowserWindow,
) => {
  const savedDirectoryPath = app.getPath('userData')
  const savedPath = join(savedDirectoryPath, 'window-state.json')

  let visibilities: boolean[] = []

  const detailsMap: {
    [id: number]: { index: number; params?: T; restored: boolean }
  } = {}

  const getWindowId = (event: IpcMainInvokeEvent) =>
    BrowserWindow.fromWebContents(event.sender)?.id

  ipcMain.handle('window-get-details', (event: IpcMainInvokeEvent) => {
    const windowId = getWindowId(event)
    if (!windowId) {
      return undefined
    }
    const details = detailsMap[windowId]
    if (!details) {
      return undefined
    }
    const result = { ...details }
    details.restored = true
    return result
  })
  ipcMain.handle('window-open', (_event: IpcMainInvokeEvent, params?: T) =>
    create(params),
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isVisibilities = (visibilities: any): visibilities is boolean[] =>
    Array.isArray(visibilities) &&
    visibilities.every((visible: unknown) => typeof visible === 'boolean')

  const restoreVisibilities = async () => {
    try {
      const json = await readFile(savedPath, 'utf8')
      const restored = JSON.parse(json)
      if (isVisibilities(restored)) {
        visibilities = restored
      }
    } catch (e) {
      // noop
    }
  }

  const saveVisibilities = async () => {
    const json = JSON.stringify(visibilities)
    await writeFile(savedPath, json)
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

    detailsMap[browserWindow.id] = { index, params, restored: false }

    browserWindow.on('close', () => {
      delete detailsMap[browserWindow.id]
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

  const restore = async () => {
    await restoreVisibilities()
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
