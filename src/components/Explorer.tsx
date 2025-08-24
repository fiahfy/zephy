import { Box } from '@mui/material'
import { createElement, useMemo } from 'react'
import ExplorerGallery from '~/components/ExplorerGallery'
import ExplorerImageList from '~/components/ExplorerImageList'
import ExplorerTable from '~/components/ExplorerTable'
import useDroppable from '~/hooks/useDroppable'
import ExplorerProvider from '~/providers/ExplorerProvider'
import { useAppSelector } from '~/store'
import { selectUrlByTabId, selectViewModeByTabIdAndUrl } from '~/store/window'
import { getPath } from '~/utils/url'

type Props = {
  tabId: number
}

const Explorer = (props: Props) => {
  const { tabId } = props

  const url = useAppSelector((state) => selectUrlByTabId(state, tabId))
  const viewMode = useAppSelector((state) =>
    selectViewModeByTabIdAndUrl(state, tabId, url),
  )

  const directoryPath = useMemo(() => getPath(url), [url])

  const { droppableStyle, ...dropHandlers } = useDroppable(directoryPath)

  const Component = useMemo(() => {
    switch (viewMode) {
      case 'gallery':
        return ExplorerGallery
      case 'thumbnail':
        return ExplorerImageList
      default:
        return ExplorerTable
    }
  }, [viewMode])

  return (
    <ExplorerProvider>
      <Box sx={{ height: '100%', ...droppableStyle }} {...dropHandlers}>
        {createElement(Component, {
          tabId,
        })}
      </Box>
    </ExplorerProvider>
  )
}

export default Explorer
