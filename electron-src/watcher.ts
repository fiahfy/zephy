import chokidar, { FSWatcher } from 'chokidar'
import { BrowserWindow, IpcMainInvokeEvent, ipcMain } from 'electron'
import { dirname } from 'node:path'

const createWatcher = () => {
  const watchers: { [key: string]: FSWatcher } = {}

  const createHandler = (
    eventType: 'create' | 'update' | 'delete',
    directoryPaths: string[],
    callback: (
      eventType: 'create' | 'update' | 'delete',
      directoryPath: string,
      filePath: string,
    ) => void,
  ) => {
    return (path: string) => {
      const directoryPath = dirname(path)
      // depth: 0 としているが folder をコピー/移動した時に folder 内の file が検出されてしまうため取り除く
      if (directoryPaths.includes(directoryPath)) {
        callback(eventType, directoryPath, path)
      }
    }
  }

  const close = async (id: number) => {
    const watcher = watchers[id]
    if (watcher) {
      await watcher.close()
    }
  }

  const watch = async (
    id: number,
    directoryPaths: string[],
    callback: (
      eventType: 'create' | 'update' | 'delete',
      directoryPath: string,
      filePath: string,
    ) => void,
  ) => {
    await close(id)
    watchers[id] = chokidar
      .watch(directoryPaths, {
        depth: 0,
        ignoreInitial: true,
      })
      .on('add', createHandler('create', directoryPaths, callback))
      .on('addDir', createHandler('create', directoryPaths, callback))
      .on('unlink', createHandler('delete', directoryPaths, callback))
      .on('unlinkDir', createHandler('delete', directoryPaths, callback))
      .on('change', createHandler('update', directoryPaths, callback))
  }

  const register = (browserWindow: BrowserWindow) =>
    browserWindow.on('close', () => close(browserWindow.webContents.id))

  const notify = (
    eventType: 'create' | 'update' | 'delete',
    directoryPath: string,
    filePath: string,
  ) => {
    const windows = BrowserWindow.getAllWindows()
    windows.forEach((window) => {
      window.webContents.send(
        'watcher-notify',
        eventType,
        directoryPath,
        filePath,
      )
    })
  }

  ipcMain.handle(
    'watcher-watch',
    (event: IpcMainInvokeEvent, directoryPaths: string[]) =>
      watch(
        event.sender.id,
        directoryPaths,
        (eventType, directoryPath, filePath) =>
          event.sender.send(
            'watcher-notify',
            eventType,
            directoryPath,
            filePath,
          ),
      ),
  )

  return { notify, register }
}

export default createWatcher
