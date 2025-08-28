import { dirname } from 'node:path'
import chokidar, { type FSWatcher } from 'chokidar'
import { BrowserWindow, type IpcMainEvent, ipcMain } from 'electron'

export type FileEventType = 'create' | 'update' | 'delete'

export type FileEventHandler = (
  eventType: FileEventType,
  directoryPath: string,
  path: string,
) => void

const createWatcher = () => {
  const watchers: { [key: string]: FSWatcher } = {}

  const createHandler = (
    eventType: FileEventType,
    directoryPaths: string[],
    handler: FileEventHandler,
  ) => {
    return (path: string) => {
      const directoryPath = dirname(path)
      // NOTE: depth: 0 としているが folder をコピー/移動した時に folder 内の file が検出されてしまうため取り除く
      if (directoryPaths.includes(directoryPath)) {
        handler(eventType, directoryPath, path)
      }
    }
  }

  const close = async (id: number) => {
    const watcher = watchers[id]
    if (!watcher) {
      return
    }
    await watcher.close()
    delete watchers[id]
  }

  const watch = async (
    id: number,
    directoryPaths: string[],
    handler: FileEventHandler,
  ) => {
    watchers[id] = chokidar
      .watch(directoryPaths, {
        depth: 0,
        ignoreInitial: true,
      })
      .on('add', createHandler('create', directoryPaths, handler))
      .on('addDir', createHandler('create', directoryPaths, handler))
      .on('unlink', createHandler('delete', directoryPaths, handler))
      .on('unlinkDir', createHandler('delete', directoryPaths, handler))
      .on('change', createHandler('update', directoryPaths, handler))
  }

  const handle = (browserWindow: BrowserWindow) =>
    browserWindow.on('close', () => close(browserWindow.webContents.id))

  const notify = (
    eventType: FileEventType,
    directoryPath: string,
    path: string,
  ) => {
    const windows = BrowserWindow.getAllWindows()
    for (const window of windows) {
      window.webContents.send('onFileChange', eventType, directoryPath, path)
    }
  }

  ipcMain.on('unwatch', (event: IpcMainEvent) => close(event.sender.id))

  ipcMain.on('watch', (event: IpcMainEvent, directoryPaths: string[]) =>
    watch(event.sender.id, directoryPaths, (eventType, directoryPath, path) =>
      event.sender.send('onFileChange', eventType, directoryPath, path),
    ),
  )

  return { handle, notify }
}

export default createWatcher
