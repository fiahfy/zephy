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
  iconType:
    | 'audio-file'
    | 'folder'
    | 'insert-drive-file'
    | 'photo'
    | 'star'
    | 'star-border'
    | 'video-file'
  size?: 'small' | 'medium'
}

const Icon = (props: Props) => {
  const { iconType, size } = props

  const MaterialIcon = useMemo(() => {
    switch (iconType) {
      case 'audio-file':
        return AudioFileIcon
      case 'folder':
        return FolderIcon
      case 'insert-drive-file':
        return InsertDriveFileIcon
      case 'photo':
        return PhotoIcon
      case 'star':
        return StarIcon
      case 'star-border':
        return StarBorderIcon
      case 'video-file':
        return VideoFileIcon
    }
  }, [iconType])

  const color = useMemo(() => {
    switch (iconType) {
      case 'audio-file':
        return green['300']
      case 'folder':
        return blue['300']
      case 'insert-drive-file':
        return grey['500']
      case 'photo':
        return indigo['300']
      case 'star':
        return '#faaf00'
      case 'star-border':
        return undefined
      case 'video-file':
        return red['300']
    }
  }, [iconType])

  return <MaterialIcon fontSize={size} sx={{ color }} />
}

export default Icon
