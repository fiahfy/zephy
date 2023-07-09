import { ImageList } from '@mui/material'

import PreviewImageItem from 'components/PreviewImageItem'
import PreviewMessageItem from 'components/PreviewMessageItem'
import PreviewVideoItem from 'components/PreviewVideoItem'
import { Content } from 'interfaces'
import { detectFileType } from 'utils/file'

type Props = {
  content: Content
}

const FilePreview = (props: Props) => {
  const { content } = props

  const fileType = detectFileType(content.path)

  return (
    <ImageList cols={1}>
      {fileType === 'image' && <PreviewImageItem content={content} />}
      {fileType === 'video' && <PreviewVideoItem content={content} />}
      {!['image', 'video'].includes(fileType) && (
        <PreviewMessageItem message="No Preview" />
      )}
    </ImageList>
  )
}

export default FilePreview
