import { Box, ImageList, Typography } from '@mui/material'
import { useEffect, useMemo, useRef } from 'react'

import DirectoryPreviewList from 'components/DirectoryPreviewList'
import EntryInformation from 'components/EntryInformation'
import FilePreviewList from 'components/FilePreviewList'
import MessagePreviewListItem from 'components/MessagePreviewListItem'
import { useAppSelector } from 'store'
import { selectSelectedContents } from 'store/explorer'

const Inspector = () => {
  const contents = useAppSelector(selectSelectedContents)

  const ref = useRef<HTMLElement>(null)

  const content = useMemo(() => contents[0], [contents])

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
      {content ? (
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
          {contents.length > 1 ? (
            <ImageList cols={1} sx={{ m: 0 }}>
              <MessagePreviewListItem message="No Preview" />
            </ImageList>
          ) : (
            <>
              {content.type === 'directory' && (
                <DirectoryPreviewList entry={content} />
              )}
              {content.type === 'file' && <FilePreviewList entry={content} />}
            </>
          )}

          <EntryInformation entries={contents} />
        </>
      ) : (
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
    </Box>
  )
}

export default Inspector
