import { useMemo } from 'react'

import Icon from 'components/Icon'
import { Entry } from 'interfaces'
import { detectFileType } from 'utils/file'

const icons = {
  audio: 'audio-file',
  image: 'image',
  unknown: 'insert-drive-file',
  video: 'video-file',
} as const

type Props = {
  entry: Entry
}

const EntryIcon = (props: Props) => {
  const { entry } = props

  const iconType = useMemo(() => {
    if (entry.type === 'directory') {
      return 'folder'
    }
    const fileType = detectFileType(entry.path)
    return icons[fileType]
  }, [entry.path, entry.type])

  return <Icon iconType={iconType} />
}

export default EntryIcon
