import { Box, Typography } from '@mui/material'
import { useEffect, useRef } from 'react'

import DirectoryPreview from 'components/DirectoryPreview'
import EntryInformation from 'components/EntryInformation'
import FilePreview from 'components/FilePreview'
import { useAppSelector } from 'store'
import { selectSelectedContents } from 'store/explorer'

const Inspector = () => {
  const contents = useAppSelector(selectSelectedContents)

  const ref = useRef<HTMLElement>(null)

  const content = contents[0]

  useEffect(() => {
    const el = ref.current
    if (el) {
      el.scrollTop = 0
    }
  }, [content, contents.length])

  return (
    <Box
      ref={ref}
      sx={{
        height: '100%',
        overflowX: 'hidden',
        overflowY: 'auto',
      }}
    >
      {!content && (
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            height: '100%',
            justifyContent: 'center',
            userSelect: 'none',
          }}
        >
          <Typography variant="caption">No Selected</Typography>
        </Box>
      )}
      {content && (
        <>
          <Typography
            paragraph
            sx={{
              background: (theme) => theme.palette.background.default,
              mb: 0,
              position: 'sticky',
              px: 1,
              top: 0,
              userSelect: 'none',
              zIndex: 1,
            }}
            variant="overline"
          >
            Preview
          </Typography>
          {content.type === 'directory' && (
            <DirectoryPreview content={content} />
          )}
          {content.type === 'file' && <FilePreview content={content} />}
          <EntryInformation contents={contents} />
        </>
      )}
    </Box>
  )
}

export default Inspector
