import { ImageListItem } from '@mui/material'
import fileUrl from 'file-url'
import { useEffect, useReducer } from 'react'

import PreviewMessageItem from 'components/PreviewMessageItem'
import { Content } from 'interfaces'
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
  content: Content
}

const PreviewVideoItem = (props: Props) => {
  const { content } = props

  const [state, dispatch] = useReducer(reducer, {
    loading: false,
    thumbnails: [],
  })

  useEffect(() => {
    let unmounted = false

    ;(async () => {
      dispatch({ type: 'loading' })
      const thumbnails = await createVideoThumbnails(content.path)
      if (unmounted) {
        return
      }
      dispatch({ type: 'loaded', payload: thumbnails })
    })()

    return () => {
      unmounted = true
    }
  }, [content])

  return (
    <>
      {state.loading && <PreviewMessageItem message="Loading..." />}
      {!state.loading && (
        <>
          {state.thumbnails.length > 0 ? (
            state.thumbnails.map((thumbnail, i) => (
              <ImageListItem key={thumbnail}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  loading="lazy"
                  src={fileUrl(thumbnail)}
                  style={{
                    aspectRatio: '16 / 9',
                    objectFit: 'contain',
                  }}
                />
              </ImageListItem>
            ))
          ) : (
            <PreviewMessageItem message="No Preview" />
          )}
        </>
      )}
    </>
  )
}

export default PreviewVideoItem
