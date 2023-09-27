import { Box } from '@mui/material'
import { FocusEvent, createElement, useCallback, useMemo } from 'react'
import ExplorerGrid from '~/components/ExplorerGrid'
import ExplorerTable from '~/components/ExplorerTable'
import useDnd from '~/hooks/useDnd'
import { useAppDispatch, useAppSelector } from '~/store'
import { blur, unselect } from '~/store/explorer'
import {
  selectCurrentDirectory,
  selectCurrentSortOption,
  selectCurrentViewMode,
  selectZephySchema,
} from '~/store/window'
import { createMenuHandler } from '~/utils/contextMenu'

const Explorer = () => {
  const currentDirectory = useAppSelector(selectCurrentDirectory)
  const currentSortOption = useAppSelector(selectCurrentSortOption)
  const currentViewMode = useAppSelector(selectCurrentViewMode)
  const zephySchema = useAppSelector(selectZephySchema)
  const dispatch = useAppDispatch()

  const { createCurrentDirectoryDroppableBinder, droppableStyle } = useDnd()

  const handleClick = useCallback(() => {
    dispatch(unselect())
    dispatch(blur())
  }, [dispatch])

  const handleContextMenu = useMemo(
    () =>
      createMenuHandler([
        {
          id: 'newFolder',
          params: { path: zephySchema ? undefined : currentDirectory },
        },
        { id: 'separator' },
        { id: 'cut', params: { paths: [] } },
        { id: 'copy', params: { paths: [] } },
        {
          id: 'paste',
          params: { path: zephySchema ? undefined : currentDirectory },
        },
        { id: 'separator' },
        { id: 'view', params: { viewMode: currentViewMode } },
        { id: 'separator' },
        {
          id: 'sortBy',
          params: { orderBy: currentSortOption.orderBy },
        },
      ]),
    [currentDirectory, currentSortOption.orderBy, currentViewMode, zephySchema],
  )

  const handleBlur = useCallback(
    () => window.electronAPI.applicationMenu.update({ isEditable: true }),
    [],
  )

  const handleFocus = useCallback((e: FocusEvent) => {
    const isEditable =
      e.target instanceof HTMLInputElement && e.target.type === 'text'
    window.electronAPI.applicationMenu.update({ isEditable })
  }, [])

  return (
    <Box
      onBlur={handleBlur}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onFocus={handleFocus}
      sx={{ height: '100%', ...droppableStyle }}
      {...createCurrentDirectoryDroppableBinder()}
    >
      {createElement(currentViewMode === 'list' ? ExplorerTable : ExplorerGrid)}
    </Box>
  )
}

export default Explorer
