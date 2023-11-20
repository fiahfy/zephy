import { Box } from '@mui/material'
import { FocusEvent, createElement, useCallback, useMemo } from 'react'
import ExplorerGrid from '~/components/ExplorerGrid'
import ExplorerTable from '~/components/ExplorerTable'
import useDnd from '~/hooks/useDnd'
import { useAppDispatch, useAppSelector } from '~/store'
import { blur, unselectAll } from '~/store/explorer'
import {
  selectCurrentDirectoryPath,
  selectCurrentSortOption,
  selectCurrentViewMode,
} from '~/store/window'
import { createContextMenuHandler } from '~/utils/contextMenu'
import { isZephySchema } from '~/utils/url'

const Explorer = () => {
  const currentDirectoryPath = useAppSelector(selectCurrentDirectoryPath)
  const currentSortOption = useAppSelector(selectCurrentSortOption)
  const currentViewMode = useAppSelector(selectCurrentViewMode)
  const dispatch = useAppDispatch()

  const { createDroppableBinder, droppableStyle } = useDnd()

  const zephySchema = useMemo(
    () => isZephySchema(currentDirectoryPath),
    [currentDirectoryPath],
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
          data: { path: zephySchema ? undefined : currentDirectoryPath },
        },
        { type: 'separator' },
        { type: 'cutEntries', data: { paths: [] } },
        { type: 'copyEntries', data: { paths: [] } },
        {
          type: 'pasteEntries',
          data: { path: zephySchema ? undefined : currentDirectoryPath },
        },
        { type: 'separator' },
        { type: 'view', data: { viewMode: currentViewMode } },
        { type: 'separator' },
        {
          type: 'sortBy',
          data: { orderBy: currentSortOption.orderBy },
        },
      ]),
    [
      currentDirectoryPath,
      currentSortOption.orderBy,
      currentViewMode,
      zephySchema,
    ],
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
    <Box
      onBlur={handleBlur}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onFocus={handleFocus}
      sx={{ height: '100%', ...droppableStyle }}
      {...createDroppableBinder({
        path: currentDirectoryPath,
        name: '',
        type: 'directory',
        url: '',
      })}
    >
      {createElement(
        currentViewMode === 'thumbnail' ? ExplorerGrid : ExplorerTable,
      )}
    </Box>
  )
}

export default Explorer
