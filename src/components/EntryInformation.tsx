import { Box, Typography } from '@mui/material'
import pluralize from 'pluralize'
import { useEffect, useMemo, useState } from 'react'
import EntryInformationTable from '~/components/EntryInformationTable'
import { Metadata } from '~/interfaces'
import { useAppSelector } from '~/store'
import { selectCurrentSelectedContents } from '~/store/explorer'

const EntryInformation = () => {
  const entries = useAppSelector(selectCurrentSelectedContents)

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
      const metadata = await (async () => {
        try {
          return await window.electronAPI.getEntryMetadata(entry.path)
        } catch (e) {
          return undefined
        }
      })()
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
              userSelect: 'text',
            }}
            variant="caption"
          >
            {entries.length > 1
              ? pluralize('item', entries.length, true)
              : entry.name}
          </Typography>
          <EntryInformationTable entries={entries} metadata={metadata} />
        </Box>
      )}
    </>
  )
}

export default EntryInformation
