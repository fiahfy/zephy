import { ImageListItem } from '@mui/material'
import fileUrl from 'file-url'
import { useEffect, useReducer } from 'react'

import MessagePreviewListItem from 'components/MessagePreviewListItem'
import { Entry } from 'interfaces'
import { createThumbnailIfNeeded } from 'utils/file'

type State = {
  loading: boolean
  thumbnail?: string
}

type Action =
  | {
      type: 'loaded'
      payload?: string
    }
  | { type: 'loading' }

const reducer = (_state: State, action: Action) => {
  switch (action.type) {
    case 'loaded':
      return {
        loading: false,
        thumbnail: action.payload,
      }
    case 'loading':
      return { loading: true, thumbnail: undefined }
  }
}

type Props = {
  entry: Entry
}

const VideoPreviewListItem = (props: Props) => {
  const { entry } = props

  const [{ loading, thumbnail }, dispatch] = useReducer(reducer, {
    loading: false,
    thumbnail: undefined,
  })

  useEffect(() => {
    let unmounted = false

    ;(async () => {
      dispatch({ type: 'loading' })
      const thumbnail = await createThumbnailIfNeeded(entry.path)
      if (unmounted) {
        return
      }
      dispatch({ type: 'loaded', payload: thumbnail })
    })()

    return () => {
      unmounted = true
    }
  }, [entry.path])

  return (
    <>
      {loading ? (
        <MessagePreviewListItem message="Loading..." />
      ) : (
        <ImageListItem>
          <video
            controls
            poster={thumbnail ? fileUrl(thumbnail) : undefined}
            src={fileUrl(entry.path)}
            style={{ width: '100%' }}
          />
        </ImageListItem>
      )}
    </>
  )
}

export default VideoPreviewListItem
