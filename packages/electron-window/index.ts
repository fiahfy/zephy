import {
  BrowserWindow,
  BrowserWindowConstructorOptions,
  IpcMainInvokeEvent,
  app,
  ipcMain,
} from 'electron'
import windowStateKeeper, { State as _State } from 'electron-window-state'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

export type State = _State

export const createManager = <T>(
  baseCreateWindow: (options: BrowserWindowConstructorOptions) => BrowserWindow,
) => {
  const channelPrefix = 'electron-window'
  const savedDirectoryPath = app.getPath('userData')
  const savedPath = join(savedDirectoryPath, 'window-state.json')

  let visibilities: boolean[] = []

  const dataMap: {
    [id: number]: { index: number; params?: T }
  } = {}

  const getWindowId = (event: IpcMainInvokeEvent) =>
    BrowserWindow.fromWebContents(event.sender)?.id

  ipcMain.handle(`${channelPrefix}-restore`, (event: IpcMainInvokeEvent) => {
    const windowId = getWindowId(event)
    if (!windowId) {
      return undefined
    }
    const data = dataMap[windowId]
    if (!data) {
      return undefined
    }
    const duplicated = { ...data }
    delete data.params
    return duplicated
  })
  ipcMain.handle(
    `${channelPrefix}-open`,
    (_event: IpcMainInvokeEvent, params?: T) => create(params),
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isVisibilities = (visibilities: any): visibilities is boolean[] =>
    Array.isArray(visibilities) &&
    visibilities.every((visible: unknown) => typeof visible === 'boolean')

  const restoreVisibilities = async () => {
    try {
      const json = await readFile(savedPath, 'utf8')
      const data = JSON.parse(json)
      if (isVisibilities(data)) {
        visibilities = data
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

    const browserWindow = baseCreateWindow(options ?? { ...windowState })

    dataMap[browserWindow.id] = { index, ...(params ? { params } : {}) }

    browserWindow.on('close', () => {
      delete dataMap[browserWindow.id]
      visibilities[index] = false
    })

    windowState.manage(browserWindow)

    return browserWindow
  }

  const getDefaultOptions = () => {
    const activeWindow = BrowserWindow.getFocusedWindow()
    if (!activeWindow) {
      return {
        height: 600,
        width: 800,
        x: 0,
        y: 0,
      }
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
    return createWindow(index, params, getDefaultOptions())
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
