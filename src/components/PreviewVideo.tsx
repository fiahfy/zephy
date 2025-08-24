import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react'
import { useAppDispatch, useAppSelector } from '~/store'
import {
  selectDefaultLoop,
  selectDefaultVolume,
  setDefaultLoop,
  setDefaultVolume,
} from '~/store/preferences'
import { selectPreviewContent } from '~/store/preview'
import { createContextMenuHandler } from '~/utils/context-menu'

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

const PreviewVideo = () => {
  const content = useAppSelector(selectPreviewContent)
  const defaultLoop = useAppSelector(selectDefaultLoop)
  const defaultVolume = useAppSelector(selectDefaultVolume)
  const appDispatch = useAppDispatch()

  const [{ thumbnail }, dispatch] = useReducer(reducer, {
    loading: false,
    thumbnail: undefined,
  })

  const ref = useRef<HTMLVideoElement>(null)

  const url = useMemo(() => content?.url, [content?.url])

  const handleContextMenu = useMemo(
    () =>
      createContextMenuHandler([
        { type: 'loop', data: { checked: defaultLoop } },
      ]),
    [defaultLoop],
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
      appDispatch(setDefaultVolume({ defaultVolume: el.volume }))
    }
  }, [appDispatch])

  useEffect(() => {
    const removeListener = window.electronAPI.onMessage((message) => {
      const { type, data } = message
      if (type !== 'changeLoop') {
        return
      }
      const el = ref.current
      if (!el) {
        return
      }
      appDispatch(setDefaultLoop({ defaultLoop: data.enabled }))
    })
    return () => removeListener()
  }, [appDispatch])

  useEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }

    el.loop = defaultLoop
    el.volume = defaultVolume
  }, [defaultLoop, defaultVolume])

  useEffect(() => {
    let unmounted = false
    ;(async () => {
      if (!content?.path) {
        return
      }
      dispatch({ type: 'loading' })
      const thumbnail = await window.electronAPI.createEntryThumbnailUrl(
        content.path,
      )
      if (unmounted) {
        return
      }
      dispatch({ type: 'loaded', payload: thumbnail })
    })()

    return () => {
      unmounted = true
    }
  }, [content?.path])

  return (
    <>
      {url && (
        // biome-ignore lint/a11y/useMediaCaption: false positive
        <video
          controls
          onContextMenu={handleContextMenu}
          onKeyDown={handleKeyDown}
          onVolumeChange={handleVolumeChange}
          poster={thumbnail}
          ref={ref}
          src={url}
          style={{
            backgroundColor: 'black',
            display: 'block',
            minHeight: 128,
            outline: 'none',
            width: '100%',
          }}
        />
      )}
    </>
  )
}

export default PreviewVideo
