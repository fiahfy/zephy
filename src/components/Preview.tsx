import { useMemo } from 'react'
import AudioPreview from '~/components/AudioPreview'
import DirectoryPreview from '~/components/DirectoryPreview'
import EmptyPreview from '~/components/EmptyPreview'
import ImagePreview from '~/components/ImagePreview'
import TextPreview from '~/components/TextPreview'
import VideoPreview from '~/components/VideoPreview'
import { Entry } from '~/interfaces'
import { detectFileType } from '~/utils/file'

type Props = {
  entries: Entry[]
}

const Preview = (props: Props) => {
  const { entries } = props

  const entry = useMemo(() => entries[0], [entries])

  const type = useMemo(
    () =>
      entry
        ? entry.type === 'directory'
          ? 'directory'
          : detectFileType(entry.path)
        : 'none',
    [entry],
  )

  return (
    <>
      {entries.length === 1 && entry ? (
        <>
          {type === 'audio' && <AudioPreview entry={entry} />}
          {type === 'directory' && <DirectoryPreview entry={entry} />}
          {type === 'image' && <ImagePreview entry={entry} />}
          {type === 'text' && <TextPreview entry={entry} />}
          {type === 'video' && <VideoPreview entry={entry} />}
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
