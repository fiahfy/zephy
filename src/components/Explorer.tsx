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

  const { createDroppableBinder, droppableStyle } = useDnd()

  const handleClick = useCallback(() => {
    dispatch(unselect())
    dispatch(blur())
  }, [dispatch])

  const handleContextMenu = useMemo(
    () =>
      createMenuHandler([
        {
          id: 'newFolder',
          data: { path: zephySchema ? undefined : currentDirectory },
        },
        { id: 'separator' },
        { id: 'cut', data: { paths: [] } },
        { id: 'copy', data: { paths: [] } },
        {
          id: 'paste',
          data: { path: zephySchema ? undefined : currentDirectory },
        },
        { id: 'separator' },
        { id: 'view', data: { viewMode: currentViewMode } },
        { id: 'separator' },
        {
          id: 'sortBy',
          data: { orderBy: currentSortOption.orderBy },
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
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement
    window.electronAPI.applicationMenu.update({ isEditable })
  }, [])

  return (
    <Box
      onBlur={handleBlur}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onFocus={handleFocus}
      sx={{ height: '100%', ...droppableStyle }}
      {...createDroppableBinder({
        path: currentDirectory,
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
