import fileUrl from 'file-url'
import { useEffect, useReducer, useRef } from 'react'

import EmptyPreview from 'components/EmptyPreview'
import { Entry } from 'interfaces'
import { useAppDispatch, useAppSelector } from 'store'
import { selectVolume, setVolume } from 'store/preview'
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

const VideoPreview = (props: Props) => {
  const { entry } = props

  const volume = useAppSelector(selectVolume)
  const appDispatch = useAppDispatch()

  const [{ loading, thumbnail }, dispatch] = useReducer(reducer, {
    loading: false,
    thumbnail: undefined,
  })
  const ref = useRef<HTMLVideoElement>(null)

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

  useEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }
    el.volume = volume

    const handler = () => appDispatch(setVolume(el.volume))

    el.addEventListener('volumechange', handler)

    return () => el.removeEventListener('volumechange', handler)
  }, [appDispatch, volume])

  return (
    <>
      {loading ? (
        <EmptyPreview message="Loading..." />
      ) : (
        <video
          controls
          poster={thumbnail ? fileUrl(thumbnail) : undefined}
          ref={ref}
          src={fileUrl(entry.path)}
          style={{ width: '100%' }}
        />
      )}
    </>
  )
}

export default VideoPreview
