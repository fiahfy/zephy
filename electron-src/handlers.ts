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
  type: 'file'
}
type Directory = {
  children?: Entry[]
  name: string
  path: string
  type: 'directory'
}
type Entry = File | Directory
type DetailedEntry = Entry & {
  dateCreated: number
  dateModified: number
  dateLastOpened: number
}

const getEntryType = (obj: Dirent | Stats) => {
  if (obj.isFile()) {
    return 'file' as const
  } else if (obj.isDirectory()) {
    return 'directory' as const
  } else {
    return 'other' as const
  }
}

const listDetailedEntries = async (path: string): Promise<DetailedEntry[]> => {
  const entries = await listEntries(path)
  return await Promise.all(
    entries.map(async (entry) => {
      const stats = await stat(entry.path)
      return {
        ...entry,
        dateCreated: stats.birthtimeMs,
        dateModified: stats.mtimeMs,
        dateLastOpened: stats.atimeMs,
      }
    })
  )
}

const listEntries = async (path: string): Promise<Entry[]> => {
  const dirents = await readdir(path, { withFileTypes: true })
  return dirents.reduce((carry, dirent) => {
    const type = getEntryType(dirent)
    if (type === 'other') {
      return carry
    }
    return [
      ...carry,
      {
        name: dirent.name.normalize('NFC'),
        path: join(path, dirent.name),
        type,
      },
    ]
  }, [] as Entry[])
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
    'get-entry-tree',
    async (_event: IpcMainInvokeEvent, path: string) => {
      const dirnames = path.split(sep)

      let rootPath = dirnames[0]
      // for darwin
      if (!rootPath) {
        rootPath = sep
      }
      dirnames[0] = rootPath

      let entry: Directory = {
        children: [
          {
            children: [],
            name: rootPath,
            path: rootPath,
            type: 'directory',
          },
        ],
        name: '',
        path: '',
        type: 'directory',
      }

      entry = await dirnames.reduce(async (e, _dirname, i) => {
        const entry = await e
        const targetEntry = dirnames
          .slice(0, i + 1)
          .reduce(
            (carry: Entry | undefined, dirname) =>
              carry?.type === 'directory'
                ? carry.children?.find((entry) => entry.name === dirname)
                : undefined,
            entry
          )
        if (targetEntry && targetEntry.type === 'directory') {
          const path = dirnames.slice(0, i + 1).join(sep)
          targetEntry.children = await listEntries(path)
        }
        return entry
      }, Promise.resolve(entry))

      return entry.children?.[0]
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
  ipcMain.handle(
    'list-detailed-entries',
    (_event: IpcMainInvokeEvent, path: string) => listDetailedEntries(path)
  )
  ipcMain.handle('list-entries', (_event: IpcMainInvokeEvent, path: string) =>
    listEntries(path)
  )
  ipcMain.handle('open-path', (_event: IpcMainInvokeEvent, path: string) =>
    shell.openPath(path)
  )
  ipcMain.handle('trash-item', (_event: IpcMainInvokeEvent, path: string) =>
    shell.trashItem(path)
  )
}
