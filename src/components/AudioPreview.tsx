import {
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material'
import { Box, GlobalStyles } from '@mui/material'
import {
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Entry } from '~/interfaces'
import { useAppDispatch, useAppSelector } from '~/store'
import { selectLoop, selectVolume, setLoop, setVolume } from '~/store/preview'
import { createMenuHandler } from '~/utils/contextMenu'

type Props = {
  entry: Entry
}

const AudioPreview = (props: Props) => {
  const { entry } = props

  const loop = useAppSelector(selectLoop)
  const volume = useAppSelector(selectVolume)
  const dispatch = useAppDispatch()

  const ref = useRef<HTMLAudioElement>(null)
  const [paused, setPaused] = useState(true)

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
      el.loop = data.enabled
      dispatch(setLoop(data.enabled))
    })
    return () => removeListener()
  }, [dispatch])

  useEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }

    el.loop = loop
    el.volume = volume
  }, [dispatch, loop, volume])

  useEffect(() => setPaused(true), [entry])

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
    () => createMenuHandler([{ type: 'loop', data: { enabled: loop } }]),
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
      dispatch(setVolume(el.volume))
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
          display: 'flex',
          flexDirection: 'column',
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
          <Icon fontSize="large" />
        </Box>
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

export default AudioPreview
