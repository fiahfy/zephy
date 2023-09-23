import { app } from 'electron'
import { copy, move, pathExists } from 'fs-extra'
import { Dirent, Stats } from 'node:fs'
import { mkdir, readdir, rename, stat } from 'node:fs/promises'
import { basename, dirname, join, parse, sep } from 'node:path'
import { pathToFileURL } from 'node:url'

type File = {
  name: string
  path: string
  type: 'file'
  url: string
}
type Directory = {
  children?: Entry[]
  name: string
  path: string
  type: 'directory'
  url: string
}
type Entry = File | Directory
type DetailedEntry = Entry & {
  dateCreated: number
  dateModified: number
  dateLastOpened: number
  size: number
}

// @see https://stackoverflow.com/a/3561711
const escape = (s: string) => s.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&')

const getEntryType = (obj: Dirent | Stats) => {
  if (obj.isFile()) {
    return 'file' as const
  } else if (obj.isDirectory()) {
    return 'directory' as const
  } else {
    return 'other' as const
  }
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
  const filename = 'untitled folder'
  const entries = await getEntries(directoryPath)
  const numbers = entries.reduce((acc, entry) => {
    if (entry.type !== 'directory') {
      return acc
    }
    if (entry.name === filename) {
      return [...acc, 1]
    }
    const reg = new RegExp(`^${escape(filename)} (\\d+)$`)
    const match = entry.name.match(reg)
    if (match) {
      return [...acc, Number(match[1])]
    }
    return acc
  }, [] as number[])
  const missingNumber = findMissingNumber(numbers)
  return missingNumber === 1 ? filename : `${filename} ${missingNumber}`
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
    const reg = new RegExp(`^${escape(name)} copy( (\\d+))?${escape(ext)}$`)
    const match = entry.name.match(reg)
    if (match) {
      return [...acc, Number(match[2] ?? 1)]
    }
    return acc
  }, [] as number[])
  const missingNumber = findMissingNumber(numbers)
  return missingNumber === 1
    ? `${name} copy${ext}`
    : `${name} copy ${missingNumber}${ext}`
}

export const getEntries = async (directoryPath: string): Promise<Entry[]> => {
  const dirents = await readdir(directoryPath, { withFileTypes: true })
  return dirents.reduce((acc, dirent) => {
    const type = getEntryType(dirent)
    if (type === 'other') {
      return acc
    }
    const path = join(directoryPath, dirent.name)
    return [
      ...acc,
      {
        name: dirent.name.normalize('NFC'),
        path,
        type,
        url: pathToFileURL(path).href,
      },
    ]
  }, [] as Entry[])
}

export const getDetailedEntry = async (
  path: string,
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
    url: pathToFileURL(path).href,
    dateCreated: stats.birthtimeMs,
    dateModified: stats.mtimeMs,
    dateLastOpened: stats.atimeMs,
    size: type === 'directory' ? 0 : stats.size,
  }
}

export const getDetailedEntriesForPaths = async (
  paths: string[],
): Promise<DetailedEntry[]> => {
  const results = await Promise.allSettled(
    paths.map((path) => getDetailedEntry(path)),
  )
  return results.reduce(
    (acc, result) =>
      result.status === 'fulfilled' ? [...acc, result.value] : acc,
    [] as DetailedEntry[],
  )
}

export const getDetailedEntries = async (
  directoryPath: string,
): Promise<DetailedEntry[]> => {
  const entries = await getEntries(directoryPath)
  return await getDetailedEntriesForPaths(entries.map((entry) => entry.path))
}

export const getEntryHierarchy = async (
  path?: string,
): Promise<Entry | undefined> => {
  const targetPath = path ?? app.getPath('home')

  const dirnames = parsePath(targetPath)

  const rootPath = dirnames[0] ?? ''

  let entry: Directory = {
    children: [
      {
        children: [],
        name: rootPath,
        path: rootPath,
        type: 'directory',
        url: pathToFileURL(rootPath).href,
      },
    ],
    name: '',
    path: '',
    type: 'directory',
    url: '',
  }

  entry = await dirnames.reduce(async (promise, _dirname, i) => {
    const e = await promise
    const targetEntry = dirnames
      .slice(0, i + 1)
      .reduce(
        (acc, dirname) =>
          acc && acc.children
            ? (acc.children.find(
                (entry) => entry.type === 'directory' && entry.name === dirname,
              ) as Directory)
            : undefined,
        e as Directory | undefined,
      )
    if (
      targetEntry &&
      targetEntry.type === 'directory' &&
      i < dirnames.length
    ) {
      const path = dirnames.slice(0, i + 1).join(sep)
      targetEntry.children = await getEntries(path)
    }
    return e
  }, Promise.resolve(entry))

  return entry.children?.[0]
}

export const createDirectory = async (
  directoryPath: string,
): Promise<DetailedEntry> => {
  const directoryName = await generateNewDirectoryName(directoryPath)
  const path = join(directoryPath, directoryName)
  await mkdir(path)
  return await getDetailedEntry(path)
}

export const copyEntries = async (paths: string[], directoryPath: string) =>
  paths.reduce(
    async (promise, path) => {
      const acc = await promise
      const filename = await generateCopyFilename(path, directoryPath)
      const newPath = join(directoryPath, filename)
      await copy(path, newPath)
      const entry = await getDetailedEntry(newPath)
      return [...acc, entry]
    },
    Promise.resolve([]) as Promise<DetailedEntry[]>,
  )

export const moveEntries = async (
  paths: string[],
  directoryPath: string,
): Promise<DetailedEntry[]> => {
  return await Promise.all(
    paths.map(async (path) => {
      const newPath = join(directoryPath, basename(path))
      if (!paths.includes(newPath)) {
        const exists = await pathExists(newPath)
        if (exists) {
          // TODO: fix error handling
          throw new Error('File already exists')
        }
        await move(path, newPath)
      }
      return await getDetailedEntry(newPath)
    }),
  )
}

export const renameEntry = async (
  path: string,
  newName: string,
): Promise<DetailedEntry> => {
  const newPath = join(dirname(path), newName)
  const exists = await pathExists(newPath)
  if (exists) {
    // TODO: fix error handling
    throw new Error('File already exists')
  }
  await rename(path, newPath)
  return await getDetailedEntry(newPath)
}
