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
