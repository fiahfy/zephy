import { Box, Typography } from '@mui/material'
import { useEffect, useRef } from 'react'

import EntryInformation from 'components/EntryInformation'
import Panel from 'components/Panel'
import Preview from 'components/Preview'
import { useAppSelector } from 'store'
import { selectSelected } from 'store/explorer'

const Inspector = () => {
  const selected = useAppSelector(selectSelected)

  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (el) {
      el.scrollTop = 0
    }
  }, [selected])

  return (
    <Box
      ref={ref}
      sx={{
        height: '100%',
        overflowX: 'hidden',
        overflowY: 'auto',
      }}
    >
      {selected.length > 0 ? (
        <Panel footer={<EntryInformation />} title="Preview">
          <Preview />
        </Panel>
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
