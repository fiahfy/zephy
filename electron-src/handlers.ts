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

type EntryBase = {
  name: string
  path: string
}
type FileEntry = EntryBase & {
  type: 'file'
}
type DirectoryEntry = EntryBase & {
  type: 'directory'
  children?: Entry[]
}
type OtherEntry = EntryBase & {
  type: 'other'
}
type Entry = FileEntry | DirectoryEntry | OtherEntry
type Content = Entry & { dateModified: number }

const getEntryType = (obj: Dirent | Stats) => {
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
  const entries = await listEntries(path)
  return await entries.reduce(async (c, entry) => {
    const carry = await c
    const dateModified = await getDateModified(entry.path)
    return [...carry, { ...entry, dateModified }]
  }, Promise.resolve([]) as Promise<Content[]>)
}

const listEntries = async (path: string): Promise<Entry[]> => {
  const dirents = await readdir(path, { withFileTypes: true })
  return dirents
    .map((dirent) => ({
      name: dirent.name.normalize('NFC'),
      path: join(path, dirent.name),
      type: getEntryType(dirent),
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
    'get-entry-tree',
    async (_event: IpcMainInvokeEvent, path: string) => {
      const dirnames = path.split(sep)

      let rootPath = dirnames[0]
      // for darwin
      if (!rootPath) {
        rootPath = sep
      }
      dirnames[0] = rootPath

      let entry: DirectoryEntry = {
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
  ipcMain.handle('list-contents', (_event: IpcMainInvokeEvent, path: string) =>
    listContents(path)
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
