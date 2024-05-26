import { parentPort } from 'node:worker_threads'
import { createThumbnailUrl, getMetadata } from './utils/ffmpeg'
import {
  copyEntries,
  createDirectory,
  getDetailedEntries,
  getDetailedEntriesForPaths,
  getDetailedEntry,
  getEntries,
  getRootEntry,
  moveEntries,
  renameEntry,
} from './utils/file'

parentPort?.on('message', async (workerData) => {
  const { type, data } = workerData
  switch (type) {
    case 'copyEntries': {
      const entry = await copyEntries(data[0], data[1])
      return parentPort?.postMessage(entry)
    }
    case 'createDirectory': {
      const entry = await createDirectory(data[0])
      return parentPort?.postMessage(entry)
    }
    case 'createThumbnailUrl': {
      const entry = await createThumbnailUrl(data[0], data[1])
      return parentPort?.postMessage(entry)
    }
    case 'getDetailedEntries': {
      const entries = await getDetailedEntries(data[0])
      return parentPort?.postMessage(entries)
    }
    case 'getDetailedEntriesForPaths': {
      const entries = await getDetailedEntriesForPaths(data[0])
      return parentPort?.postMessage(entries)
    }
    case 'getDetailedEntry': {
      const entry = await getDetailedEntry(data[0])
      return parentPort?.postMessage(entry)
    }
    case 'getEntries': {
      const entries = await getEntries(data[0])
      return parentPort?.postMessage(entries)
    }
    case 'getMetadata': {
      const metadata = await getMetadata(data[0])
      return parentPort?.postMessage(metadata)
    }
    case 'getRootEntry': {
      const entry = await getRootEntry(data[0])
      return parentPort?.postMessage(entry)
    }
    case 'moveEntries': {
      const entries = await moveEntries(data[0], data[1])
      return parentPort?.postMessage(entries)
    }
    case 'renameEntry': {
      const entry = await renameEntry(data[0], data[1])
      return parentPort?.postMessage(entry)
    }
  }
})
