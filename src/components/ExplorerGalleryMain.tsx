import { Box } from '@mui/material'
import { useMemo } from 'react'
import ExplorerGalleryMainContent from '~/components/ExplorerGalleryMainContent'
import ExplorerGalleryMainEmptyState from '~/components/ExplorerGalleryMainEmptyState'
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
        <ExplorerGalleryMainEmptyState message="No selected" />
      )}
    </Box>
  )
}

export default ExplorerGalleryMain
