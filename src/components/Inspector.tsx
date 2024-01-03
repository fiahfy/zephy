import { Box, Typography } from '@mui/material'
import { useEffect, useRef } from 'react'
import EntryInformation from '~/components/EntryInformation'
import Preview from '~/components/Preview'
import { useAppSelector } from '~/store'
import { selectCurrentSelected } from '~/store/explorer'

const Inspector = () => {
  const selected = useAppSelector(selectCurrentSelected)

  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (el) {
      el.scrollTop = 0
    }
  }, [selected])

  return (
    <Box ref={ref} sx={{ height: '100%' }}>
      {selected.length > 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          <Typography
            paragraph
            sx={{
              background: (theme) => theme.palette.background.default,
              mb: 0,
              position: 'sticky',
              px: 1,
              top: 0,
              zIndex: 1,
            }}
            variant="overline"
          >
            Preview
          </Typography>
          <Preview />
          <Box
            sx={{
              background: (theme) => theme.palette.background.default,
              bottom: 0,
              position: 'sticky',
              zIndex: 1,
            }}
          >
            <EntryInformation />
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            height: '100%',
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption">No selected</Typography>
        </Box>
      )}
    </Box>
  )
}

export default Inspector
