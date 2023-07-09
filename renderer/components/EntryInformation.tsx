import { Box, Typography } from '@mui/material'
import { useEffect, useState } from 'react'

import EntryInformationTable from 'components/EntryInformationTable'
import { Content, Metadata } from 'interfaces'
import { getMetadata } from 'utils/file'

type Props = {
  contents: Content[]
}

const EntryInformation = (props: Props) => {
  const { contents } = props

  const content = contents[0]

  const [metadata, setMetadata] = useState<Metadata>()

  useEffect(() => {
    let unmounted = false

    ;(async () => {
      if (contents.length > 1) {
        return
      }
      if (!content) {
        return
      }
      const metadata = await getMetadata(content.path)
      if (unmounted) {
        return
      }
      setMetadata(metadata)
    })()

    return () => {
      unmounted = true
    }
  }, [content, contents.length])

  return (
    <>
      {content && (
        <Box
          sx={{
            background: (theme) => theme.palette.background.default,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            position: 'sticky',
            py: 1,
            zIndex: 1,
          }}
        >
          <Typography
            align="center"
            fontWeight="bold"
            paragraph
            sx={{
              mb: 0,
              px: 1,
              userSelect: 'none',
            }}
            variant="caption"
          >
            {contents.length > 1 ? `${contents.length} items` : content.name}
          </Typography>
          <EntryInformationTable contents={contents} metadata={metadata} />
        </Box>
      )}
    </>
  )
}

export default EntryInformation
