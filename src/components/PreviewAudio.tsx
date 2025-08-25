import {
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material'
import { GlobalStyles, Stack } from '@mui/material'
import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useAppDispatch, useAppSelector } from '~/store'
import {
  selectDefaultLoop,
  selectDefaultVolume,
  setDefaultLoop,
  setDefaultVolume,
} from '~/store/preferences'
import { selectPreviewContentUrl } from '~/store/preview'
import { createContextMenuHandler } from '~/utils/context-menu'

const PreviewAudio = () => {
  const url = useAppSelector(selectPreviewContentUrl)
  const defaultLoop = useAppSelector(selectDefaultLoop)
  const defaultVolume = useAppSelector(selectDefaultVolume)
  const dispatch = useAppDispatch()

  const [paused, setPaused] = useState(true)

  const ref = useRef<HTMLAudioElement>(null)

  const Icon = useMemo(() => (paused ? PlayArrowIcon : PauseIcon), [paused])

  const handleContextMenu = useMemo(
    () =>
      createContextMenuHandler([
        { type: 'loop', data: { checked: defaultLoop } },
      ]),
    [defaultLoop],
  )

  const handleClick = useCallback(() => {
    const el = ref.current
    if (!el) {
      return
    }
    if (el.paused) {
      el.play()
    } else {
      el.pause()
    }
    el.focus()
  }, [])

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
      dispatch(setDefaultVolume({ defaultVolume: el.volume }))
    }
  }, [dispatch])

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
      dispatch(setDefaultLoop({ defaultLoop: data.enabled }))
    })
    return () => removeListener()
  }, [dispatch])

  useEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }
    el.loop = defaultLoop
    el.volume = defaultVolume
  }, [defaultLoop, defaultVolume])

  // biome-ignore lint/correctness/useExhaustiveDependencies: false positive
  useEffect(() => setPaused(true), [url])

  return (
    <>
      {url && (
        <>
          <GlobalStyles
            styles={{
              'audio#custom-audio': {
                '&::-webkit-media-controls-enclosure': {
                  borderRadius: 0,
                },
              },
            }}
          />
          <Stack
            onContextMenu={handleContextMenu}
            sx={{
              aspectRatio: '16 / 9',
              backgroundColor: 'black',
              minHeight: 128,
            }}
          >
            <Stack
              onClick={handleClick}
              sx={{
                alignItems: 'center',
                cursor: 'pointer',
                flexGrow: 1,
                justifyContent: 'center',
              }}
            >
              <Icon fontSize="large" sx={{ color: 'white' }} />
            </Stack>
            {/* biome-ignore lint/a11y/useMediaCaption: false positive */}
            <audio
              controls
              id="custom-audio"
              onKeyDown={handleKeyDown}
              onPause={() => setPaused(true)}
              onPlay={() => setPaused(false)}
              onVolumeChange={handleVolumeChange}
              ref={ref}
              src={url}
              style={{
                height: 38,
                outline: 'none',
                width: '100%',
              }}
            />
          </Stack>
        </>
      )}
    </>
  )
}

export default PreviewAudio
