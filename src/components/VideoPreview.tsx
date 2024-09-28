import {
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react'
import { Entry } from '~/interfaces'
import { useAppDispatch, useAppSelector } from '~/store'
import { selectLoop, selectVolume, setLoop, setVolume } from '~/store/preview'
import { createContextMenuHandler } from '~/utils/contextMenu'

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

  const loop = useAppSelector(selectLoop)
  const volume = useAppSelector(selectVolume)
  const appDispatch = useAppDispatch()

  const [{ thumbnail }, dispatch] = useReducer(reducer, {
    loading: false,
    thumbnail: undefined,
  })
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const removeListener = window.electronAPI.addMessageListener((message) => {
      const { type, data } = message
      if (type !== 'changeLoop') {
        return
      }
      const el = ref.current
      if (!el) {
        return
      }
      appDispatch(setLoop({ loop: data.enabled }))
    })
    return () => removeListener()
  }, [appDispatch])

  useEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }

    el.loop = loop
    el.volume = volume
  }, [loop, volume])

  useEffect(() => {
    let unmounted = false
    ;(async () => {
      dispatch({ type: 'loading' })
      const thumbnail = await (async () => {
        try {
          return await window.electronAPI.createEntryThumbnailUrl(entry.path)
        } catch (e) {
          return undefined
        }
      })()
      if (unmounted) {
        return
      }
      dispatch({ type: 'loaded', payload: thumbnail })
    })()

    return () => {
      unmounted = true
    }
  }, [entry.path])

  const handleContextMenu = useMemo(
    () => createContextMenuHandler([{ type: 'loop', data: { checked: loop } }]),
    [loop],
  )

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const el = ref.current
    if (!el) {
      return
    }
    switch (e.key) {
      case 'ArrowLeft':
        el.currentTime -= 5
        break
      case 'ArrowRight':
        el.currentTime += 5
        break
    }
  }, [])

  const handleVolumeChange = useCallback(() => {
    const el = ref.current
    if (el) {
      appDispatch(setVolume({ volume: el.volume }))
    }
  }, [appDispatch])

  return (
    // biome-ignore lint/a11y/useMediaCaption: <explanation>
    <video
      controls
      onContextMenu={handleContextMenu}
      onKeyDown={handleKeyDown}
      onVolumeChange={handleVolumeChange}
      poster={thumbnail}
      ref={ref}
      src={entry.url}
      style={{
        backgroundColor: 'black',
        display: 'block',
        minHeight: 128,
        outline: 'none',
        width: '100%',
      }}
    />
  )
}

export default VideoPreview
