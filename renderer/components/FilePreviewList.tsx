import { ImageList } from '@mui/material'
import { useMemo } from 'react'

import ImagePreviewListItem from 'components/ImagePreviewListItem'
import MessagePreviewListItem from 'components/MessagePreviewListItem'
import VideoPreviewListItem from 'components/VideoPreviewListItem'
import { Entry } from 'interfaces'
import { detectFileType } from 'utils/file'

type Props = {
  entry: Entry
}

const FilePreviewList = (props: Props) => {
  const { entry } = props

  const fileType = useMemo(() => detectFileType(entry.path), [entry.path])

  return (
    <ImageList cols={1} gap={1} sx={{ m: 0 }}>
      {fileType === 'image' && <ImagePreviewListItem entry={entry} />}
      {fileType === 'video' && <VideoPreviewListItem entry={entry} />}
      {!['image', 'video'].includes(fileType) && (
        <MessagePreviewListItem message="No Preview" />
      )}
    </ImageList>
  )
}

export default FilePreviewList
