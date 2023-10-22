import { Box } from '@mui/material'
import { FocusEvent, createElement, useCallback, useMemo } from 'react'
import ExplorerGrid from '~/components/ExplorerGrid'
import ExplorerTable from '~/components/ExplorerTable'
import useDnd from '~/hooks/useDnd'
import { useAppDispatch, useAppSelector } from '~/store'
import { blur, unselect } from '~/store/explorer'
import {
  selectCurrentDirectoryPath,
  selectCurrentSortOption,
  selectCurrentViewMode,
  selectZephySchema,
} from '~/store/window'
import { createMenuHandler } from '~/utils/contextMenu'

const Explorer = () => {
  const currentDirectoryPath = useAppSelector(selectCurrentDirectoryPath)
  const currentSortOption = useAppSelector(selectCurrentSortOption)
  const currentViewMode = useAppSelector(selectCurrentViewMode)
  const zephySchema = useAppSelector(selectZephySchema)
  const dispatch = useAppDispatch()

  const { createDroppableBinder, droppableStyle } = useDnd()

  const handleClick = useCallback(() => {
    dispatch(unselect())
    dispatch(blur())
  }, [dispatch])

  const handleContextMenu = useMemo(
    () =>
      createMenuHandler([
        {
          type: 'newFolder',
          data: { path: zephySchema ? undefined : currentDirectoryPath },
        },
        { type: 'separator' },
        { type: 'cut', data: { paths: [] } },
        { type: 'copy', data: { paths: [] } },
        {
          type: 'paste',
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
