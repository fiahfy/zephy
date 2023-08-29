import { Box, GlobalStyles, Typography } from '@mui/material'
import fileUrl from 'file-url'
import { useEffect, useRef } from 'react'

import useContextMenu from 'hooks/useContextMenu'
import { Entry } from 'interfaces'
import { useAppDispatch, useAppSelector } from 'store'
import { selectLoop, selectVolume, setLoop, setVolume } from 'store/preview'

type Props = {
  entry: Entry
}

const AudioPreview = (props: Props) => {
  const { entry } = props

  const loop = useAppSelector(selectLoop)
  const volume = useAppSelector(selectVolume)
  const dispatch = useAppDispatch()

  const { mediaMenuHandler } = useContextMenu()

  const ref = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const removeListener = window.electronAPI.message.addListener((message) => {
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

    const handler = () => dispatch(setVolume(el.volume))

    el.addEventListener('volumechange', handler)

    return () => el.removeEventListener('volumechange', handler)
  }, [dispatch, loop, volume])

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
        onContextMenu={mediaMenuHandler}
        sx={{
          aspectRatio: '16 / 9',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            flexGrow: 1,
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption">Sound only</Typography>
        </Box>
        <audio
          controls
          id="custom-audio"
          ref={ref}
          src={fileUrl(entry.path)}
          style={{ width: '100%' }}
        />
      </Box>
    </>
  )
}

export default AudioPreview
