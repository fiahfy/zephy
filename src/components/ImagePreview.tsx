import {
  FullscreenExit as FullscreenExitIcon,
  Fullscreen as FullscreenIcon,
} from '@mui/icons-material'
import { Box, IconButton } from '@mui/material'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import EmptyPreview from '~/components/EmptyPreview'
import type { Entry } from '~/interfaces'

type Props = {
  entry: Entry
}

const ImagePreview = (props: Props) => {
  const { entry } = props

  const [status, setStatus] = useState<'error' | 'loaded' | 'loading'>(
    'loading',
  )
  const [fullscreen, setFullscreen] = useState(false)

  const ref = useRef<HTMLImageElement>(null)

  useEffect(() => {
    ;(async () => {
      setStatus('loading')
      const success = await (async () => {
        try {
          await new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = () => resolve(undefined)
            img.onerror = (e) => reject(e)
            img.src = entry.url
          })
          return true
        } catch (e) {
          return false
        }
      })()
      setStatus(success ? 'loaded' : 'error')
    })()
  }, [entry.url])

  const message = useMemo(() => {
    switch (status) {
      case 'loading':
        return 'Loading...'
      case 'error':
        return 'Failed to load'
      case 'loaded':
        return 'No preview'
    }
  }, [status])

  const title = useMemo(
    () => (fullscreen ? 'Exit full screen' : 'Full screen'),
    [fullscreen],
  )

  const Icon = useMemo(
    () => (fullscreen ? FullscreenExitIcon : FullscreenIcon),
    [fullscreen],
  )

  const handleClick = useCallback(() => {
    const img = ref.current
    if (!img) {
      return
    }
    if (document.fullscreenElement) {
      document.exitFullscreen()
      setFullscreen(false)
    } else {
      img.requestFullscreen()
      setFullscreen(true)
    }
  }, [])

  return (
    <>
      {status === 'loaded' ? (
        <Box ref={ref} sx={{ maxHeight: '100%', position: 'relative' }}>
          <img
            alt=""
            src={entry.url}
            style={{
              backgroundColor: 'black',
              display: 'block',
              height: '100%',
              minHeight: 128,
              objectFit: 'contain',
              width: '100%',
            }}
          />
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{
              bottom: 0,
              m: 1,
              position: 'absolute',
              right: 0,
            }}
            title={title}
          >
            <Icon fontSize="small" />
          </IconButton>
        </Box>
      ) : (
        <EmptyPreview message={message} />
      )}
    </>
  )
}

export default ImagePreview
