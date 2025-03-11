import { Box, Typography } from '@mui/material'
import { useEffect, useRef } from 'react'
import EntryInformationTable from '~/components/EntryInformationTable'
import Preview from '~/components/Preview'
import { useAppSelector } from '~/store'
import { selectCurrentSelectedContents } from '~/store/explorer-list'

const Inspector = () => {
  const contents = useAppSelector(selectCurrentSelectedContents)

  const ref = useRef<HTMLElement>(null)

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const el = ref.current
    if (el) {
      el.scrollTop = 0
    }
  }, [contents])

  return (
    <Box ref={ref} sx={{ height: '100%' }}>
      {contents.length > 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          <Typography
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
          <Preview entries={contents} />
          <Box
            sx={{
              background: (theme) => theme.palette.background.default,
              bottom: 0,
              position: 'sticky',
              py: 1,
              zIndex: 1,
            }}
          >
            <EntryInformationTable entries={contents} />
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
