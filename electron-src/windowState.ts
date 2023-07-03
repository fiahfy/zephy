import { BrowserWindow, app } from 'electron'
import windowStateKeeper, { State } from 'electron-window-state'
import fs from 'fs'
import path from 'path'

const windowStateManager = (
  windowCreator: (state: State) => (params?: { path: string }) => BrowserWindow
) => {
  const file = path.join(app.getPath('userData'), 'window-state.json')

  const getFile = (index: number) => `window-state_${index}.json`

  const restoreState = () => {
    try {
      if (fs.existsSync(file)) {
        const data = fs.readFileSync(file, 'utf8')
        const state = JSON.parse(data)
        let windowCount = Number(state.windowCount)
        windowCount = isNaN(windowCount) ? 1 : windowCount
        windowCount = Math.max(windowCount, 1)
        return { windowCount }
      }
    } catch (e) {
      // noop
    }
    return { windowCount: 1 }
  }

  const saveState = ({ windowCount }: { windowCount: number }) => {
    fs.writeFileSync(file, JSON.stringify({ windowCount }))
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

  const createWindow = (params?: { path: string }) => {
    const windows = BrowserWindow.getAllWindows()
    const index = windows.length

    const windowState = windowStateKeeper({
      file: getFile(index),
    })
    const browserWindow = windowCreator({
      ...windowState,
      ...getNewWindowOptions(),
    })(params)
    windowState.manage(browserWindow)
  }

  const restoreWindow = (index: number) => {
    const windowState = windowStateKeeper({
      file: getFile(index),
    })
    const browserWindow = windowCreator(windowState)()
    windowState.manage(browserWindow)
  }

  const restoreWindows = () => {
    const { windowCount } = restoreState()
    for (let i = 0; i < windowCount; i++) {
      restoreWindow(i)
    }
  }

  const saveWindows = () => {
    const windows = BrowserWindow.getAllWindows()
    saveState({ windowCount: windows.length })
  }

  return {
    create: createWindow,
    restore: restoreWindows,
    save: saveWindows,
  }
}

export default windowStateManager
