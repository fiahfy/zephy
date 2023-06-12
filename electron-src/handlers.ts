import { Dirent, Stats, promises } from 'fs'
import { basename, dirname, join, sep } from 'path'
import {
  BrowserWindow,
  IpcMainInvokeEvent,
  app,
  ipcMain,
  shell,
} from 'electron'

const { readdir, stat } = promises

type File = {
  name: string
  path: string
  type: 'file' | 'directory' | 'other'
}
type FileNode = File & { children?: FileNode[] }
type Content = File & { dateModified: number }

const getFileType = (obj: Dirent | Stats) => {
  if (obj.isFile()) {
    return 'file' as const
  } else if (obj.isDirectory()) {
    return 'directory' as const
  } else {
    return 'other' as const
  }
}

const getDateModified = async (path: string) => {
  const stats = await stat(path)
  return stats.mtimeMs
}

const listContents = async (path: string): Promise<Content[]> => {
  const files = await listFiles(path)
  return await files.reduce(async (c, file) => {
    const carry = await c
    const dateModified = await getDateModified(file.path)
    return [...carry, { ...file, dateModified }]
  }, Promise.resolve([]) as Promise<Content[]>)
}

const listFiles = async (path: string): Promise<File[]> => {
  const dirents = await readdir(path, { withFileTypes: true })
  return dirents
    .map((dirent) => ({
      name: dirent.name.normalize('NFC'),
      path: join(path, dirent.name),
      type: getFileType(dirent),
    }))
    .filter((file) => !file.name.match(/^\./) && file.type !== 'other')
}

export const addHandlers = () => {
  ipcMain.handle('basename', (_event: IpcMainInvokeEvent, path: string) =>
    basename(path)
  )
  ipcMain.handle('darwin', () => process.platform === 'darwin')
  ipcMain.handle('dirname', (_event: IpcMainInvokeEvent, path: string) =>
    dirname(path)
  )
  ipcMain.handle(
    'get-file-node',
    async (_event: IpcMainInvokeEvent, path: string) => {
      const dirnames = path.split(sep)

      let rootPath = dirnames[0]
      // for darwin
      if (!rootPath) {
        rootPath = sep
      }
      dirnames[0] = rootPath

      let node: FileNode = {
        children: [
          {
            name: rootPath,
            path: rootPath,
            type: 'directory',
          },
        ],
        name: '',
        path: '',
        type: 'directory',
      }

      node = await dirnames.reduce(async (n, _dirname, i) => {
        const node = await n
        const targetNode = dirnames
          .slice(0, i + 1)
          .reduce(
            (carry: FileNode | undefined, dirname) =>
              carry?.children?.find((node) => node.name === dirname),
            node
          )
        if (targetNode) {
          const path = dirnames.slice(0, i + 1).join(sep)
          targetNode.children = await listFiles(path)
        }
        return node
      }, Promise.resolve(node))

      return node.children?.[0]
    }
  )
  ipcMain.handle('get-home-path', () => app.getPath('home'))
  ipcMain.handle(
    'get-window-id',
    (event: IpcMainInvokeEvent) =>
      BrowserWindow.fromWebContents(event.sender)?.id
  )
  ipcMain.handle(
    'is-fullscreen',
    (event: IpcMainInvokeEvent) =>
      BrowserWindow.fromWebContents(event.sender)?.isFullScreen() ?? false
  )
  ipcMain.handle('list-contents', (_event: IpcMainInvokeEvent, path: string) =>
    listContents(path)
  )
  ipcMain.handle('list-files', (_event: IpcMainInvokeEvent, path: string) =>
    listFiles(path)
  )
  ipcMain.handle('open-path', (_event: IpcMainInvokeEvent, path: string) =>
    shell.openPath(path)
  )
}
