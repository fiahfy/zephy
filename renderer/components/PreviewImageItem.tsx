import { ImageListItem } from '@mui/material'
import fileUrl from 'file-url'
import { useEffect, useReducer } from 'react'

import PreviewMessageItem from 'components/PreviewMessageItem'
import { Content } from 'interfaces'
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
  content: Content
}

const PreviewImageItem = (props: Props) => {
  const { content } = props

  const [state, dispatch] = useReducer(reducer, {
    loading: false,
    thumbnail: undefined,
  })

  useEffect(() => {
    let unmounted = false

    ;(async () => {
      dispatch({ type: 'loading' })
      const thumbnail = await createThumbnailIfNeeded(content.path)
      if (unmounted) {
        return
      }
      dispatch({ type: 'loaded', payload: thumbnail })
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
          {state.thumbnail ? (
            <ImageListItem>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                loading="lazy"
                src={fileUrl(state.thumbnail)}
                style={{ minHeight: 128 }}
              />
            </ImageListItem>
          ) : (
            <PreviewMessageItem message="No Preview" />
          )}
        </>
      )}
    </>
  )
}

export default PreviewImageItem
