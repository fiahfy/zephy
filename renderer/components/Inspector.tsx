import { Box, ImageList, Typography } from '@mui/material'
import { useEffect, useMemo, useRef } from 'react'

import DirectoryPreviewList from 'components/DirectoryPreviewList'
import EntryInformation from 'components/EntryInformation'
import FilePreviewList from 'components/FilePreviewList'
import MessagePreviewListItem from 'components/MessagePreviewListItem'
import Panel from 'components/Panel'
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
  }, [content?.path, contents.length])

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
        <Panel footer={<EntryInformation entries={contents} />} title="Preview">
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
        </Panel>
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
