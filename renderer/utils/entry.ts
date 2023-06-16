import { format } from 'date-fns'
import mime from 'mime-types'

export const isImageFile = (path: string) => {
  const mimeType = mime.lookup(path)
  return mimeType && mimeType.startsWith('image/')
}

export const isVideoFile = (path: string) => {
  const mimeType = mime.lookup(path)
  return mimeType && mimeType.startsWith('video/')
}

export const isAudioFile = (path: string) => {
  const mimeType = mime.lookup(path)
  return mimeType && mimeType.startsWith('audio/')
}

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

export const formatFileSize = (bytes: 0) => {
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
