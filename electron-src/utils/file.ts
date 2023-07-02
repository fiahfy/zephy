import chokidar, { FSWatcher } from 'chokidar'
import { Dirent, Stats, promises } from 'fs'
import { basename, dirname, join, sep } from 'path'

const { mkdir, readdir, rename, stat } = promises

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
  size: number
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

export const getEntries = async (directoryPath: string): Promise<Entry[]> => {
  const dirents = await readdir(directoryPath, { withFileTypes: true })
  return dirents.reduce((carry, dirent) => {
    const type = getEntryType(dirent)
    if (type === 'other') {
      return carry
    }
    return [
      ...carry,
      {
        name: dirent.name.normalize('NFC'),
        path: join(directoryPath, dirent.name),
        type,
      },
    ]
  }, [] as Entry[])
}

export const getDetailedEntry = async (
  path: string
): Promise<DetailedEntry> => {
  const stats = await stat(path)
  const type = getEntryType(stats)
  if (type === 'other') {
    throw new Error('Invalid entry type')
  }
  return {
    name: basename(path).normalize('NFC'),
    path,
    type,
    dateCreated: stats.birthtimeMs,
    dateModified: stats.mtimeMs,
    dateLastOpened: stats.atimeMs,
    size: stats.size,
  }
}

export const getDetailedEntriesForPaths = async (
  paths: string[]
): Promise<DetailedEntry[]> => {
  const results = await Promise.allSettled(
    paths.map((path) => getDetailedEntry(path))
  )
  return results.reduce(
    (carry, result) =>
      result.status === 'fulfilled' ? [...carry, result.value] : carry,
    [] as DetailedEntry[]
  )
}

export const getDetailedEntries = async (
  directoryPath: string
): Promise<DetailedEntry[]> => {
  const entries = await getEntries(directoryPath)
  return await getDetailedEntriesForPaths(entries.map((entry) => entry.path))
}

const parsePath = (path: string) => {
  const dirnames = path.split(sep)
  let rootPath = dirnames[0]
  // for darwin
  if (!rootPath) {
    rootPath = sep
  }
  dirnames[0] = rootPath
  return dirnames
}

export const getEntryHierarchy = async (
  path: string
): Promise<Entry | undefined> => {
  const dirnames = parsePath(path)

  const rootPath = dirnames[0] ?? ''

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

  entry = await dirnames.reduce(async (_e, _dirname, i) => {
    const e = await _e
    const targetEntry = dirnames
      .slice(0, i + 1)
      .reduce(
        (carry, dirname) =>
          carry && carry.children
            ? (carry.children.find(
                (entry) => entry.type === 'directory' && entry.name === dirname
              ) as Directory)
            : undefined,
        e as Directory | undefined
      )
    if (
      targetEntry &&
      targetEntry.type === 'directory' &&
      i < dirnames.length - 1
    ) {
      const path = dirnames.slice(0, i + 1).join(sep)
      targetEntry.children = await getEntries(path)
    }
    return e
  }, Promise.resolve(entry))

  return entry.children?.[0]
}

const findMissingNumber = (arr: number[]) => {
  const sortedArr = arr.sort((a, b) => a - b)
  let missingNumber = 1

  for (const num of sortedArr) {
    if (num === missingNumber) {
      missingNumber++
    } else if (num > missingNumber) {
      break
    }
  }

  return missingNumber
}

const generateNewDirectoryName = async (directoryPath: string) => {
  const basename = 'untitled folder'
  const entries = await getEntries(directoryPath)
  const numbers = entries.reduce((carry, entry) => {
    if (entry.type !== 'directory') {
      return carry
    }
    if (entry.name === basename) {
      return [...carry, 1]
    }
    const match = entry.name.match(/^untitled folder ([1-9]\d*)$/)
    if (match) {
      return [...carry, Number(match[1])]
    }
    return carry
  }, [] as number[])
  const missingNumber = findMissingNumber(numbers)
  return missingNumber === 1 ? basename : `${basename} ${missingNumber}`
}

export const createDirectory = async (
  directoryPath: string
): Promise<DetailedEntry> => {
  const directoryName = await generateNewDirectoryName(directoryPath)
  const path = join(directoryPath, directoryName)
  await mkdir(path)
  return await getDetailedEntry(path)
}

export const renameEntry = async (
  path: string,
  newName: string
): Promise<DetailedEntry> => {
  const newPath = join(dirname(path), newName)
  await rename(path, newPath)
  return await getDetailedEntry(newPath)
}

export const createWatcher = () => {
  let watcher: FSWatcher | undefined

  const watch = async (
    directoryPaths: string | string[],
    callback: (eventType: 'create' | 'delete', path: string) => void
  ) => {
    if (watcher) {
      await watcher.close()
    }
    watcher = chokidar
      .watch(directoryPaths, { depth: 0, ignoreInitial: true })
      .on('add', (path) => callback('create', path))
      .on('addDir', (path) => callback('create', path))
      .on('unlink', (path) => callback('delete', path))
      .on('unlinkDir', (path) => callback('delete', path))
  }

  return { watch }
}
