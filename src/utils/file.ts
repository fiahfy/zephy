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
