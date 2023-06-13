import { useMemo } from 'react'
import Icon from 'components/Icon'
import { File } from 'interfaces'
import { detectFileType } from 'utils/file'

const icons = {
  image: 'photo',
  video: 'video-file',
  audio: 'audio-file',
  unknown: 'insert-drive-file',
} as const

type Props = {
  file: File
  size?: 'small' | 'medium'
}

const FileIcon = (props: Props) => {
  const { file, size } = props

  const type = useMemo(() => {
    if (file.type === 'directory') {
      return 'folder'
    }
    const fileType = detectFileType(file.path)
    return icons[fileType]
  }, [file.path, file.type])

  return <Icon size={size} type={type} />
}

export default FileIcon
