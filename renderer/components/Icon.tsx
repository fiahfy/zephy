import { blue, green, grey, indigo, red } from '@mui/material/colors'
import {
  AudioFile as AudioFileIcon,
  Folder as FolderIcon,
  InsertDriveFile as InsertDriveFileIcon,
  Photo as PhotoIcon,
  StarBorder as StarBorderIcon,
  Star as StarIcon,
  VideoFile as VideoFileIcon,
} from '@mui/icons-material'
import { useMemo } from 'react'

type Props = {
  size?: 'small' | 'medium'
  type:
    | 'star'
    | 'star-border'
    | 'folder'
    | 'photo'
    | 'audio-file'
    | 'video-file'
    | 'insert-drive-file'
}

const Icon = (props: Props) => {
  const { size, type } = props

  const MaterialIcon = useMemo(() => {
    switch (type) {
      case 'star':
        return StarIcon
      case 'star-border':
        return StarBorderIcon
      case 'folder':
        return FolderIcon
      case 'photo':
        return PhotoIcon
      case 'audio-file':
        return AudioFileIcon
      case 'video-file':
        return VideoFileIcon
      case 'insert-drive-file':
        return InsertDriveFileIcon
    }
  }, [type])

  const color = useMemo(() => {
    switch (type) {
      case 'star':
        return '#faaf00'
      case 'star-border':
        return undefined
      case 'folder':
        return blue['300']
      case 'photo':
        return indigo['300']
      case 'audio-file':
        return green['300']
      case 'video-file':
        return red['300']
      case 'insert-drive-file':
        return grey['500']
    }
  }, [type])

  return <MaterialIcon fontSize={size} sx={{ color }} />
}

export default Icon
