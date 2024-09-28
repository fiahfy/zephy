import { Box } from '@mui/material'
import { createElement, useCallback, useMemo } from 'react'
import ExplorerGrid from '~/components/ExplorerGrid'
import ExplorerTable from '~/components/ExplorerTable'
import useDropEntry from '~/hooks/useDropEntry'
import ExplorerProvider from '~/providers/ExplorerProvider'
import { useAppDispatch, useAppSelector } from '~/store'
import { blur, unselectAll } from '~/store/explorer'
import {
  selectDirectoryPathByTabId,
  selectSortOptionByTabIdAndDirectoryPath,
  selectViewModeByTabIdAndDirectoryPath,
} from '~/store/window'
import { createContextMenuHandler } from '~/utils/contextMenu'
import { isZephySchema } from '~/utils/url'

type Props = {
  tabId: number
}

const Explorer = (props: Props) => {
  const { tabId } = props

  const directoryPath = useAppSelector((state) =>
    selectDirectoryPathByTabId(state, tabId),
  )
  const sortOption = useAppSelector((state) =>
    selectSortOptionByTabIdAndDirectoryPath(state, tabId, directoryPath),
  )
  const viewMode = useAppSelector((state) =>
    selectViewModeByTabIdAndDirectoryPath(state, tabId, directoryPath),
  )
  const dispatch = useAppDispatch()

  const { droppableStyle, ...dropHandlers } = useDropEntry({
    path: directoryPath,
    name: '',
    type: 'directory',
    url: '',
  })

  const zephySchema = useMemo(
    () => isZephySchema(directoryPath),
    [directoryPath],
  )

  const handleClick = useCallback(() => {
    dispatch(unselectAll())
    dispatch(blur())
  }, [dispatch])

  const handleContextMenu = useMemo(
    () =>
      createContextMenuHandler([
        {
          type: 'newFolder',
          data: { path: zephySchema ? undefined : directoryPath },
        },
        { type: 'separator' },
        { type: 'cutEntries', data: { paths: [] } },
        { type: 'copyEntries', data: { paths: [] } },
        {
          type: 'pasteEntries',
          data: { path: zephySchema ? undefined : directoryPath },
        },
        { type: 'separator' },
        { type: 'view', data: { viewMode } },
        { type: 'separator' },
        {
          type: 'sortBy',
          data: { orderBy: sortOption.orderBy },
        },
      ]),
    [directoryPath, sortOption.orderBy, viewMode, zephySchema],
  )

  return (
    <ExplorerProvider>
      <Box
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        sx={{ height: '100%', ...droppableStyle }}
        {...dropHandlers}
      >
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
