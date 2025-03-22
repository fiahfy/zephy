import {
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material'
import { Box, GlobalStyles } from '@mui/material'
import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { Entry } from '~/interfaces'
import { useAppDispatch, useAppSelector } from '~/store'
import {
  selectDefaultLoop,
  selectDefaultVolume,
  setDefaultLoop,
  setDefaultVolume,
} from '~/store/preferences'
import { createContextMenuHandler } from '~/utils/contextMenu'

type Props = {
  entry: Entry
}

const PreviewAudio = (props: Props) => {
  const { entry } = props

  const defaultLoop = useAppSelector(selectDefaultLoop)
  const defaultVolume = useAppSelector(selectDefaultVolume)
  const dispatch = useAppDispatch()

  const ref = useRef<HTMLAudioElement>(null)
  const [paused, setPaused] = useState(true)

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

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => setPaused(true), [entry.path])

  const Icon = useMemo(() => (paused ? PlayArrowIcon : PauseIcon), [paused])

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
      dispatch(setDefaultVolume({ defaultVolume: el.volume }))
    }
  }, [dispatch])

  return (
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
      <Box
        onContextMenu={handleContextMenu}
        sx={{
          aspectRatio: '16 / 9',
          backgroundColor: 'black',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 128,
        }}
      >
        <Box
          onClick={handleClick}
          sx={{
            alignItems: 'center',
            cursor: 'pointer',
            display: 'flex',
            flexGrow: 1,
            justifyContent: 'center',
          }}
        >
          <Icon fontSize="large" sx={{ color: 'white' }} />
        </Box>
        {/* biome-ignore lint/a11y/useMediaCaption: <explanation> */}
        <audio
          controls
          id="custom-audio"
          onKeyDown={handleKeyDown}
          onPause={() => setPaused(true)}
          onPlay={() => setPaused(false)}
          onVolumeChange={handleVolumeChange}
          ref={ref}
          src={entry.url}
          style={{
            height: 38,
            outline: 'none',
            width: '100%',
          }}
        />
      </Box>
    </>
  )
}

export default PreviewAudio
