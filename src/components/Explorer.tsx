import { Box } from '@mui/material'
import { FocusEvent, createElement, useCallback, useMemo } from 'react'
import ExplorerGrid from '~/components/ExplorerGrid'
import ExplorerTable from '~/components/ExplorerTable'
import { ExplorerProvider } from '~/contexts/ExplorerContext'
import useDropEntry from '~/hooks/useDropEntry'
import { useAppDispatch, useAppSelector } from '~/store'
import { blur, unselectAll } from '~/store/explorer'
import {
  selectDirectoryPathByTabIndex,
  selectSortOptionByDirectoryPath,
  selectViewModeByDirectoryPath,
} from '~/store/window'
import { createContextMenuHandler } from '~/utils/contextMenu'
import { isZephySchema } from '~/utils/url'

type Props = {
  tabIndex: number
}

const Explorer = (props: Props) => {
  const { tabIndex } = props

  const directoryPath = useAppSelector((state) =>
    selectDirectoryPathByTabIndex(state, tabIndex),
  )
  const sortOption = useAppSelector((state) =>
    selectSortOptionByDirectoryPath(state, directoryPath),
  )
  const viewMode = useAppSelector((state) =>
    selectViewModeByDirectoryPath(state, directoryPath),
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

  const handleBlur = useCallback(
    () => window.electronAPI.updateApplicationMenu({ isEditable: true }),
    [],
  )

  const handleFocus = useCallback((e: FocusEvent) => {
    const isEditable =
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement
    window.electronAPI.updateApplicationMenu({ isEditable })
  }, [])

  return (
    <ExplorerProvider>
      <Box
        onBlur={handleBlur}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onFocus={handleFocus}
        sx={{ height: '100%', ...droppableStyle }}
        {...dropHandlers}
      >
        {createElement(
          viewMode === 'thumbnail' ? ExplorerGrid : ExplorerTable,
          {
            tabIndex,
          },
        )}
      </Box>
    </ExplorerProvider>
  )
}

export default Explorer
