import mime from 'mime'

export const isHiddenFile = (path: string) => path.startsWith('.')

export const detectFileType = (path: string) => {
  const type = mime.getType(path)
  if (!type) {
    return 'unknown'
  }
  switch (true) {
    case type.startsWith('image/'):
      return 'image'
    case type.startsWith('video/'):
      return 'video'
    case type.startsWith('audio/'):
      return 'audio'
    case type.startsWith('text/'):
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
