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

export const createThumbnailIfNeeded = async (urls: string | string[]) => {
  const url = Array.isArray(urls)
    ? urls.filter((url) => isImageFile(url) || isVideoFile(url))[0]
    : urls
  if (!url) {
    return undefined
  }
  if (isVideoFile(url)) {
    try {
      return await window.electronAPI.createThumbnail(url)
    } catch (e) {
      return undefined
    }
  } else if (isImageFile(url)) {
    return url
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
