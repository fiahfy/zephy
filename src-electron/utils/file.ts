import { basename, dirname, join, parse, sep } from 'node:path'
import { pathToFileURL } from 'node:url'
import {
  copy,
  type Dirent,
  mkdir,
  move,
  opendir,
  pathExists,
  rename,
  type Stats,
  stat,
} from 'fs-extra'

type File = {
  type: 'file'
}
type Directory = {
  children?: Entry[]
  type: 'directory'
}
type Entry = (File | Directory) & {
  dateCreated: number
  dateLastOpened: number
  dateModified: number
  name: string
  path: string
  size: number
  url: string
}

// @see https://stackoverflow.com/a/3561711
const escapeRegex = (s: string) => s.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&')

const getEntryType = (obj: Dirent | Stats) => {
  if (obj.isFile()) {
    return 'file' as const
  }
  if (obj.isDirectory()) {
    return 'directory' as const
  }
  return 'other' as const
}

const parsePath = (path: string) => {
  const dirnames = path.split(sep)
  let rootPath = dirnames[0]
  // NOTE: For darwin
  if (!rootPath) {
    rootPath = sep
  }
  dirnames[0] = rootPath
  return dirnames
}

const findMissingNumber = (arr: number[]) =>
  arr
    .toSorted((a, b) => a - b)
    .reduce((acc, i) => (i === acc ? acc + 1 : acc), 1)

const generateNewDirectoryName = async (directoryPath: string) => {
  const filename = 'untitled folder'
  const entries = await getEntries(directoryPath)
  const numbers = entries.reduce((acc, entry) => {
    if (entry.type !== 'directory') {
      return acc
    }
    if (entry.name === filename) {
      acc.push(1)
      return acc
    }
    const reg = new RegExp(`^${escapeRegex(filename)} (\\d+)$`)
    const match = entry.name.match(reg)
    if (match) {
      acc.push(Number(match[1]))
      return acc
    }
    return acc
  }, [] as number[])
  const newNumber = findMissingNumber(numbers)
  return newNumber === 1 ? filename : `${filename} ${newNumber}`
}

const generateCopyFilename = async (path: string, directoryPath: string) => {
  const filename = basename(path)
  const exists = await pathExists(join(directoryPath, filename))
  if (!exists) {
    return filename
  }
  const parsed = parse(path)
  const name = parsed.name.replace(/ copy( \d+)?$/, '').normalize('NFC')
  const ext = parsed.ext
  const entries = await getEntries(directoryPath)
  const numbers = entries.reduce((acc, entry) => {
    const reg = new RegExp(
      `^${escapeRegex(name)} copy( (\\d+))?${escapeRegex(ext)}$`,
    )
    const match = entry.name.match(reg)
    if (match) {
      acc.push(Number(match[2] ?? 1))
      return acc
    }
    return acc
  }, [] as number[])
  const newNumber = Math.max(...[0, ...numbers]) + 1
  return newNumber === 1
    ? `${name} copy${ext}`
    : `${name} copy ${newNumber}${ext}`
}

export const getEntry = async (path: string): Promise<Entry> => {
  const stats = await stat(path)
  const type = getEntryType(stats)
  if (type === 'other') {
    throw new Error('Invalid entry type')
  }
  return {
    dateCreated: stats.birthtimeMs,
    dateLastOpened: stats.atimeMs,
    dateModified: stats.mtimeMs,
    name: basename(path).normalize('NFC'),
    path,
    size: type === 'directory' ? 0 : stats.size,
    type,
    url: pathToFileURL(path).href,
  }
}

export const getEntriesForPaths = async (paths: string[]): Promise<Entry[]> => {
  const entries = []
  for (const path of paths) {
    try {
      entries.push(await getEntry(path))
    } catch {
      // noop
    }
  }
  return entries
}

export const getEntries = async (directoryPath: string): Promise<Entry[]> => {
  const dir = await opendir(directoryPath)

  const paths = []
  for await (const dirent of dir) {
    paths.push(join(directoryPath, dirent.name))
  }

  return getEntriesForPaths(paths)
}

export const getRootEntry = async (
  path: string,
): Promise<Entry | undefined> => {
  const parentPath = dirname(path)
  const dirnames = parsePath(parentPath)

  const rootPath = dirnames[0] ?? ''

  const root = await getEntry(rootPath)

  let entry: Directory = {
    children: [{ ...root, name: rootPath }],
    type: 'directory',
  }

  entry = await dirnames.reduce(async (promise, _dirname, i) => {
    const acc = await promise
    const entry = dirnames
      .slice(0, i + 1)
      .reduce(
        (acc, dirname) =>
          acc?.children
            ? (acc.children.find(
                (entry) => entry.type === 'directory' && entry.name === dirname,
              ) as Directory)
            : undefined,
        acc as Directory | undefined,
      )
    if (entry && entry.type === 'directory' && i < dirnames.length) {
      const path = dirnames.slice(0, i + 1).join(sep)
      const entries = await getEntries(path)
      entry.children = entries
    }
    return acc
  }, Promise.resolve(entry))

  return entry.children?.[0]
}

export const createDirectory = async (
  directoryPath: string,
): Promise<Entry> => {
  const directoryName = await generateNewDirectoryName(directoryPath)
  const path = join(directoryPath, directoryName)
  await mkdir(path)
  return await getEntry(path)
}

export const copyEntries = async (paths: string[], directoryPath: string) =>
  paths.reduce(
    async (promise, path) => {
      const acc = await promise
      const filename = await generateCopyFilename(path, directoryPath)
      const newPath = join(directoryPath, filename)
      await copy(path, newPath)
      const entry = await getEntry(newPath)
      return [...acc, entry]
    },
    Promise.resolve([]) as Promise<Entry[]>,
  )

export const moveEntry = async (
  path: string,
  directoryPath: string,
): Promise<Entry> => {
  let newPath = join(directoryPath, basename(path))
  // NOTE: Skip if moving to the same path or into itself
  if (path === newPath || path === directoryPath) {
    newPath = path
  } else {
    const exists = await pathExists(newPath)
    if (exists) {
      throw new Error('A file or directory with that name already exists.')
    }
    await move(path, newPath)
  }
  return await getEntry(newPath)
}

export const renameEntry = async (
  path: string,
  newName: string,
): Promise<Entry> => {
  const newPath = join(dirname(path), newName)
  const exists = await pathExists(newPath)
  const same = path.toLowerCase() === newPath.toLowerCase()
  if (exists && !same) {
    throw new Error('A file or directory with that name already exists.')
  }
  await rename(path, newPath)
  return await getEntry(newPath)
}
