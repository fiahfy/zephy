import { Dirent, Stats, promises } from 'fs'
import { basename, join, sep } from 'path'

const { mkdir, readdir, stat } = promises

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

export const getDetailedEntries = async (
  directoryPath: string
): Promise<DetailedEntry[]> => {
  const entries = await getEntries(directoryPath)
  return await Promise.all(
    entries.map(async (entry) => {
      const stats = await stat(entry.path)
      return {
        ...entry,
        dateCreated: stats.birthtimeMs,
        dateModified: stats.mtimeMs,
        dateLastOpened: stats.atimeMs,
        size: stats.size,
      }
    })
  )
}

const getDetailedEntry = async (path: string): Promise<DetailedEntry> => {
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

export const getEntryHierarchy = async (path: string) => {
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
    if (
      targetEntry &&
      targetEntry.type === 'directory' &&
      i < dirnames.length - 1
    ) {
      const path = dirnames.slice(0, i + 1).join(sep)
      targetEntry.children = await getEntries(path)
    }
    return entry
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

export const createDirectory = async (directoryPath: string) => {
  const directoryName = await generateNewDirectoryName(directoryPath)
  const path = join(directoryPath, directoryName)
  await mkdir(path)
  return await getDetailedEntry(path)
}
