import { Box, GlobalStyles, Typography } from '@mui/material'
import fileUrl from 'file-url'
import { useEffect, useRef } from 'react'

import { Entry } from 'interfaces'
import { useAppDispatch, useAppSelector } from 'store'
import { selectVolume, setVolume } from 'store/preview'

type Props = {
  entry: Entry
}

const AudioPreview = (props: Props) => {
  const { entry } = props

  const volume = useAppSelector(selectVolume)
  const dispatch = useAppDispatch()

  const ref = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }
    el.volume = volume

    const handler = () => dispatch(setVolume(el.volume))

    el.addEventListener('volumechange', handler)

    return () => el.removeEventListener('volumechange', handler)
  }, [dispatch, volume])

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
