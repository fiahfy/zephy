import {
  AudioFile as AudioFileIcon,
  Folder as FolderIcon,
  Image as ImageIcon,
  InsertDriveFile as InsertDriveFileIcon,
  StarBorder as StarBorderIcon,
  Star as StarIcon,
  VideoFile as VideoFileIcon,
} from '@mui/icons-material'
import { blue, green, grey, indigo, red } from '@mui/material/colors'
import { useMemo } from 'react'

type Props = {
  iconType:
    | 'audio-file'
    | 'folder'
    | 'image'
    | 'insert-drive-file'
    | 'star'
    | 'star-border'
    | 'video-file'
}

const Icon = (props: Props) => {
  const { iconType } = props

  const MaterialIcon = useMemo(() => {
    switch (iconType) {
      case 'audio-file':
        return AudioFileIcon
      case 'folder':
        return FolderIcon
      case 'image':
        return ImageIcon
      case 'insert-drive-file':
        return InsertDriveFileIcon
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
      case 'image':
        return indigo['300']
      case 'insert-drive-file':
        return grey['500']
      case 'star':
        return '#faaf00'
      case 'star-border':
        return undefined
      case 'video-file':
        return red['300']
    }
  }, [iconType])

  return <MaterialIcon fontSize="small" sx={{ color }} />
}

export default Icon
