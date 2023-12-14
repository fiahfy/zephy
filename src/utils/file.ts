import { Mime } from 'mime'
import standardTypes from 'mime/types/standard.js'
import otherTypes from 'mime/types/other.js'

const mime = new Mime(standardTypes, otherTypes)
mime.define({ 'video/mp4': ['mp4'] }, true)

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
