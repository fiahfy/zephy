import { Box, Typography } from '@mui/material'
import { useMemo } from 'react'
import ExplorerGalleryMainContent from '~/components/ExplorerGalleryMainContent'
import { useAppSelector } from '~/store'
import { selectSelectedContentsByTabId } from '~/store/explorer-list'

type Props = {
  tabId: number
}

const ExplorerGalleryMain = (props: Props) => {
  const { tabId } = props

  const contents = useAppSelector((state) =>
    selectSelectedContentsByTabId(state, tabId),
  )

  const content = useMemo(() => contents[0], [contents])

  return (
    <Box sx={{ flexGrow: 1, minHeight: 0 }}>
      {content ? (
        <ExplorerGalleryMainContent content={content} />
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

export default ExplorerGalleryMain
