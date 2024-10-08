import { format, isToday, isYesterday } from 'date-fns'

export const formatFileSize = (bytes: number) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

  if (bytes === 0) {
    return '0 Bytes'
  }

  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const formattedSize = Number.parseFloat((bytes / 1024 ** i).toFixed(2))

  return `${formattedSize} ${sizes[i]}`
}

export const formatDateTime = (timestamp: number) => {
  if (isToday(timestamp)) {
    return `Today ${format(timestamp, 'HH:mm')}`
  }
  if (isYesterday(timestamp)) {
    return `Yesterday ${format(timestamp, 'HH:mm')}`
  }
  return format(timestamp, 'PP HH:mm')
}

export const formatDuration = (sec: number) => {
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
