import { ImageList } from '@mui/material'

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

  const fileType = detectFileType(entry.path)

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
