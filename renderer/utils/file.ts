import { format } from 'date-fns'
import mime from 'mime-types'

export const isHiddenFile = (path: string) => path.startsWith('.')

export const detectFileType = (path: string) => {
  const mimeType = mime.lookup(path)
  if (!mimeType) {
    return 'unknown'
  }
  switch (true) {
    case mimeType.startsWith('image/'):
      return 'image'
    case mimeType.startsWith('video/'):
      return 'video'
    case mimeType.startsWith('audio/'):
      return 'audio'
    default:
      return 'unknown'
  }
}

export const isImageFile = (path: string) => detectFileType(path) === 'image'
export const isVideoFile = (path: string) => detectFileType(path) === 'video'
export const isAudioFile = (path: string) => detectFileType(path) === 'audio'
export const isMediaFile = (path: string) =>
  isImageFile(path) || isVideoFile(path) || isAudioFile(path)

export const createThumbnailIfNeeded = async (paths: string | string[]) => {
  const path = Array.isArray(paths)
    ? paths.filter((path) => isImageFile(path) || isVideoFile(path))[0]
    : paths
  if (!path) {
    return undefined
  }
  if (isVideoFile(path)) {
    try {
      return await window.electronAPI.createThumbnail(path)
    } catch (e) {
      return undefined
    }
  } else if (isImageFile(path)) {
    return path
  } else {
    return undefined
  }
}

export const createThumbnailsIfNeeded = (paths: string[]) =>
  Promise.all(paths.map(createThumbnailIfNeeded))

export const createVideoThumbnails = async (path: string) => {
  try {
    return await window.electronAPI.createVideoThumbnails(path)
  } catch (e) {
    return []
  }
}

export const getMetadata = async (path: string) => {
  try {
    const metadata = await window.electronAPI.getMetadata(path)
    const hasDuration = isVideoFile(path) || isAudioFile(path)
    return {
      ...metadata,
      ...(hasDuration ? {} : { duration: undefined }),
    }
  } catch (e) {
    return undefined
  }
}

export const formatFileSize = (bytes: number) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

  if (bytes === 0) {
    return '0 Bytes'
  }

  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const formattedSize = parseFloat((bytes / Math.pow(1024, i)).toFixed(2))

  return `${formattedSize} ${sizes[i]}`
}

export const formatDate = (timestamp: number) => format(timestamp, 'PP HH:mm')

export const formatTime = (sec: number) => {
  const hours = Math.floor(sec / 3600)
  const minutes = Math.floor((sec % 3600) / 60)
  const seconds = Math.round(sec % 60)

  const hh = hours > 0 ? String(hours).padStart(2, '0') : ''
  const mm = String(minutes).padStart(2, '0')
  const ss = String(seconds).padStart(2, '0')

  let result = ''

  if (hh) {
    result += `${hh}:`
  }

  result += `${mm}:${ss}`

  return result
}
