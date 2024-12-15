import {
  AudioFile as AudioFileIcon,
  Description as DescriptionIcon,
  Folder as FolderIcon,
  Image as ImageIcon,
  InsertDriveFile as InsertDriveFileIcon,
  Settings as SettingsIcon,
  StarBorder as StarBorderIcon,
  Star as StarIcon,
  VideoFile as VideoFileIcon,
} from '@mui/icons-material'
import { CircularProgress } from '@mui/material'
import { blue, green, grey, indigo, red } from '@mui/material/colors'

const icons = {
  'audio-file': {
    Component: AudioFileIcon,
    color: green['300'],
  },
  description: {
    Component: DescriptionIcon,
    color: grey['500'],
  },
  folder: {
    Component: FolderIcon,
    color: blue['300'],
  },
  image: {
    Component: ImageIcon,
    color: indigo['300'],
  },
  'insert-drive-file': {
    Component: InsertDriveFileIcon,
    color: grey['500'],
  },
  settings: {
    Component: SettingsIcon,
    color: grey['500'],
  },
  star: {
    Component: StarIcon,
    color: '#faaf00',
  },
  'star-border': {
    Component: StarBorderIcon,
    color: undefined,
  },
  'video-file': {
    Component: VideoFileIcon,
    color: red['300'],
  },
}

type Props = {
  iconType:
    | 'audio-file'
    | 'description'
    | 'folder'
    | 'image'
    | 'insert-drive-file'
    | 'progress'
    | 'settings'
    | 'star'
    | 'star-border'
    | 'video-file'
}

const Icon = (props: Props) => {
  const { iconType } = props

  if (iconType === 'progress') {
    return (
      <CircularProgress
        size={14}
        sx={{ boxSizing: 'content-box', flexShrink: 0, p: 0.375 }}
      />
    )
  }

  const { Component, color } = icons[iconType]

  return <Component fontSize="small" sx={{ color }} />
}

export default Icon
