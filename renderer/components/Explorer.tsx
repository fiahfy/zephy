import { Box } from '@mui/material'
import {
  FocusEvent,
  KeyboardEvent,
  createElement,
  useCallback,
  useMemo,
} from 'react'
import ExplorerGrid from '~/components/ExplorerGrid'
import ExplorerTable from '~/components/ExplorerTable'
import Outline from '~/components/Outline'
import useContextMenu from '~/hooks/useContextMenu'
import useDnd from '~/hooks/useDnd'
import { Content } from '~/interfaces'
import { useAppDispatch, useAppSelector } from '~/store'
import {
  blur,
  focus,
  select,
  selectContents,
  selectError,
  selectFocused,
  selectLoading,
  selectQuery,
  selectSelectedContents,
  unselect,
} from '~/store/explorer'
import {
  changeDirectory,
  selectCurrentDirectory,
  selectCurrentScrollTop,
  selectCurrentSortOption,
  selectCurrentViewMode,
  selectZephySchema,
  setCurrentScrollTop,
} from '~/store/window'

const Explorer = () => {
  const contents = useAppSelector(selectContents)
  const currentDirectory = useAppSelector(selectCurrentDirectory)
  const currentScrollTop = useAppSelector(selectCurrentScrollTop)
  const currentSortOption = useAppSelector(selectCurrentSortOption)
  const currentViewMode = useAppSelector(selectCurrentViewMode)
  const error = useAppSelector(selectError)
  const focused = useAppSelector(selectFocused)
  const loading = useAppSelector(selectLoading)
  const query = useAppSelector(selectQuery)
  const selectedContents = useAppSelector(selectSelectedContents)
  const zephySchema = useAppSelector(selectZephySchema)
  const dispatch = useAppDispatch()

  const { createMenuHandler } = useContextMenu()
  const { createCurrentDirectoryDroppableBinder, dropping } = useDnd()

  const open = useCallback(
    async (content: Content) =>
      content.type === 'directory'
        ? dispatch(changeDirectory(content.path))
        : await window.electronAPI.openPath(content.path),
    [dispatch],
  )

  const noDataText = useMemo(
    () =>
      loading
        ? 'Loading items...'
        : error
        ? 'The specified directory does not exist'
        : query
        ? 'No results found'
        : 'No items',
    [error, loading, query],
  )

  const handleKeyDownArrow = useCallback(
    (e: KeyboardEvent, content: Content) => {
      e.preventDefault()
      dispatch(select(content.path))
      dispatch(focus(content.path))
    },
    [dispatch],
  )

  const handleKeyDownEnter = useCallback(
    async (e: KeyboardEvent) => {
      e.preventDefault()
      const content = selectedContents[0]
      if (content) {
        await open(content)
      }
    },
    [open, selectedContents],
  )

  const handleScrollEnd = useCallback(
    (scrollTop: number) => {
      if (!loading) {
        dispatch(setCurrentScrollTop(scrollTop))
      }
    },
    [dispatch, loading],
  )

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
    [
      createMenuHandler,
      currentDirectory,
      currentSortOption.orderBy,
      currentViewMode,
      zephySchema,
    ],
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
      sx={{ height: '100%', position: 'relative' }}
      {...createCurrentDirectoryDroppableBinder()}
    >
      {createElement(
        currentViewMode === 'list' ? ExplorerTable : ExplorerGrid,
        {
          contents,
          focused,
          loading,
          noDataText,
          onKeyDownArrow: handleKeyDownArrow,
          onKeyDownEnter: handleKeyDownEnter,
          onScrollEnd: handleScrollEnd,
          scrollTop: currentScrollTop,
        },
      )}
      {dropping && <Outline />}
    </Box>
  )
}

export default Explorer
