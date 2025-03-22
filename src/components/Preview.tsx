import { useMemo } from 'react'
import PreviewAudio from '~/components/PreviewAudio'
import PreviewDirectory from '~/components/PreviewDirectory'
import PreviewEmpty from '~/components/PreviewEmpty'
import PreviewImage from '~/components/PreviewImage'
import PreviewText from '~/components/PreviewText'
import PreviewVideo from '~/components/PreviewVideo'
import type { Entry } from '~/interfaces'
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
          {type === 'audio' && <PreviewAudio entry={entry} />}
          {type === 'directory' && <PreviewDirectory entry={entry} />}
          {type === 'image' && <PreviewImage entry={entry} />}
          {type === 'text' && <PreviewText entry={entry} />}
          {type === 'video' && <PreviewVideo entry={entry} />}
          {!['audio', 'directory', 'image', 'text', 'video'].includes(type) && (
            <PreviewEmpty message="No preview" />
          )}
        </>
      ) : (
        <PreviewEmpty message="No preview" />
      )}
    </>
  )
}

export default Preview
