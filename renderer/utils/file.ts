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
    case mimeType.startsWith('text/'):
      return 'text'
    default:
      return 'unknown'
  }
}

export const isAudioFile = (path: string) => detectFileType(path) === 'audio'
export const isImageFile = (path: string) => detectFileType(path) === 'image'
export const isVideoFile = (path: string) => detectFileType(path) === 'video'

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

export const getMetadata = async (path: string) => {
  try {
    const target = isAudioFile(path) || isImageFile(path) || isVideoFile(path)
    if (!target) {
      return undefined
    }
    const metadata = await window.electronAPI.getMetadata(path)
    const hasDuration = isAudioFile(path) || isVideoFile(path)
    return {
      ...metadata,
      ...(hasDuration ? {} : { duration: undefined }),
    }
  } catch (e) {
    return undefined
  }
}
