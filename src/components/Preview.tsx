import { useMemo } from 'react'
import AudioPreview from '~/components/AudioPreview'
import DirectoryPreview from '~/components/DirectoryPreview'
import EmptyPreview from '~/components/EmptyPreview'
import ImagePreview from '~/components/ImagePreview'
import TextPreview from '~/components/TextPreview'
import VideoPreview from '~/components/VideoPreview'
import { useAppSelector } from '~/store'
import { selectSelectedContents } from '~/store/explorer'
import { detectFileType } from '~/utils/file'

const Preview = () => {
  const contents = useAppSelector(selectSelectedContents)

  const content = useMemo(() => contents[0], [contents])

  const type = useMemo(
    () =>
      content
        ? content.type === 'directory'
          ? 'directory'
          : detectFileType(content.path)
        : 'none',
    [content],
  )

  return (
    <>
      {contents.length === 1 && content ? (
        <>
          {type === 'audio' && <AudioPreview entry={content} />}
          {type === 'directory' && <DirectoryPreview entry={content} />}
          {type === 'image' && <ImagePreview entry={content} />}
          {type === 'text' && <TextPreview entry={content} />}
          {type === 'video' && <VideoPreview entry={content} />}
          {!['audio', 'directory', 'image', 'text', 'video'].includes(type) && (
            <EmptyPreview message="No preview" />
          )}
        </>
      ) : (
        <EmptyPreview message="No preview" />
      )}
    </>
  )
}

export default Preview
