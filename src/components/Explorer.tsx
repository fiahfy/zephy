import { Box } from '@mui/material'
import { createElement, useMemo } from 'react'
import ExplorerGallery from '~/components/ExplorerGallery'
import ExplorerGrid from '~/components/ExplorerGrid'
import ExplorerTable from '~/components/ExplorerTable'
import useDroppable from '~/hooks/useDroppable'
import ExplorerProvider from '~/providers/ExplorerProvider'
import { useAppSelector } from '~/store'
import {
  selectDirectoryPathByTabId,
  selectViewModeByTabIdAndDirectoryPath,
} from '~/store/window'

type Props = {
  tabId: number
}

const Explorer = (props: Props) => {
  const { tabId } = props

  const directoryPath = useAppSelector((state) =>
    selectDirectoryPathByTabId(state, tabId),
  )
  const viewMode = useAppSelector((state) =>
    selectViewModeByTabIdAndDirectoryPath(state, tabId, directoryPath),
  )

  const { droppableStyle, ...dropHandlers } = useDroppable(directoryPath)

  const Component = useMemo(() => {
    switch (viewMode) {
      case 'gallery':
        return ExplorerGallery
      case 'thumbnail':
        return ExplorerGrid
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
