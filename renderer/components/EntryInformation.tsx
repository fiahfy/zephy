import { Box, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'

import EntryInformationTable from 'components/EntryInformationTable'
import { DetailedEntry, Metadata } from 'interfaces'
import { getMetadata } from 'utils/file'

type Props = {
  entries: DetailedEntry[]
}

const EntryInformation = (props: Props) => {
  const { entries } = props

  const [metadata, setMetadata] = useState<Metadata>()

  const entry = useMemo(() => entries[0], [entries])

  useEffect(() => {
    let unmounted = false

    ;(async () => {
      if (entries.length > 1) {
        return
      }
      if (!entry?.path) {
        return
      }
      const metadata = await getMetadata(entry.path)
      if (unmounted) {
        return
      }
      setMetadata(metadata)
    })()

    return () => {
      unmounted = true
    }
  }, [entries.length, entry?.path])

  return (
    <>
      {entry && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            py: 1,
          }}
        >
          <Typography
            align="center"
            fontWeight="bold"
            paragraph
            sx={{
              mb: 0,
              overflowWrap: 'break-word',
              px: 1,
            }}
            variant="caption"
          >
            {entries.length > 1 ? `${entries.length} items` : entry.name}
          </Typography>
          <EntryInformationTable entries={entries} metadata={metadata} />
        </Box>
      )}
    </>
  )
}

export default EntryInformation
