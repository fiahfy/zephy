import { ImageListItem } from '@mui/material'
import fileUrl from 'file-url'
import { useEffect, useReducer } from 'react'

import MessagePreviewListItem from 'components/MessagePreviewListItem'
import { Entry } from 'interfaces'
import { createVideoThumbnails } from 'utils/file'

type State = {
  loading: boolean
  thumbnails: string[]
}

type Action =
  | {
      type: 'loaded'
      payload: string[]
    }
  | { type: 'loading' }

const reducer = (_state: State, action: Action) => {
  switch (action.type) {
    case 'loaded':
      return {
        loading: false,
        thumbnails: action.payload,
      }
    case 'loading':
      return { loading: true, thumbnails: [] }
  }
}

type Props = {
  entry: Entry
}

const VideoPreviewListItem = (props: Props) => {
  const { entry } = props

  const [{ loading, thumbnails }, dispatch] = useReducer(reducer, {
    loading: false,
    thumbnails: [],
  })

  useEffect(() => {
    let unmounted = false

    ;(async () => {
      dispatch({ type: 'loading' })
      const thumbnails = await createVideoThumbnails(entry.path)
      if (unmounted) {
        return
      }
      dispatch({ type: 'loaded', payload: thumbnails })
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
        <>
          {thumbnails.length > 0 ? (
            thumbnails.map((thumbnail) => (
              <ImageListItem key={thumbnail}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  loading="lazy"
                  src={fileUrl(thumbnail)}
                  style={{
                    aspectRatio: '16 / 9',
                    objectPosition: 'center top',
                  }}
                />
              </ImageListItem>
            ))
          ) : (
            <MessagePreviewListItem message="No Preview" />
          )}
        </>
      )}
    </>
  )
}

export default VideoPreviewListItem
