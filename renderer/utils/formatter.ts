import { format } from 'date-fns'

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
