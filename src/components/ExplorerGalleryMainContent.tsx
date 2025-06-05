import ExplorerGalleryMainEmptyState from '~/components/ExplorerGalleryMainEmptyState'
import useEntryThumbnail from '~/hooks/useEntryThumbnail'
import type { Content } from '~/interfaces'

type Props = {
  content: Content
}

const ExplorerGalleryMainContent = (props: Props) => {
  const { content } = props

  const { message, status, thumbnail } = useEntryThumbnail(content)

  return (
    <>
      {status === 'loaded' && thumbnail ? (
        <img
          alt=""
          draggable={false}
          src={thumbnail}
          style={{
            display: 'block',
            height: '100%',
            objectFit: 'cover', // TODO: Switch fit style
            objectPosition: 'center',
            width: '100%',
          }}
        />
      ) : (
        <ExplorerGalleryMainEmptyState message={message} />
      )}
    </>
  )
}

export default ExplorerGalleryMainContent
