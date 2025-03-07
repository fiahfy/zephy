import { Box } from '@mui/material'
import { createElement } from 'react'
import ExplorerGrid from '~/components/ExplorerGrid'
import ExplorerTable from '~/components/ExplorerTable'
import useDropEntry from '~/hooks/useDropEntry'
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

  const { droppableStyle, ...dropHandlers } = useDropEntry({
    path: directoryPath,
    name: '',
    type: 'directory',
    url: '',
  })

  return (
    <ExplorerProvider>
      <Box sx={{ height: '100%', ...droppableStyle }} {...dropHandlers}>
        {createElement(
          viewMode === 'thumbnail' ? ExplorerGrid : ExplorerTable,
          {
            tabId,
          },
        )}
      </Box>
    </ExplorerProvider>
  )
}

export default Explorer
