import { Box } from '@mui/material'
import {
  KeyboardEvent,
  MouseEvent,
  createElement,
  useCallback,
  useMemo,
} from 'react'

import ExplorerGrid from 'components/ExplorerGrid'
import ExplorerTable from 'components/ExplorerTable'
import Outline from 'components/Outline'
import useContextMenu from 'hooks/useContextMenu'
import useDnd from 'hooks/useDnd'
import usePreventClickOnDoubleClick from 'hooks/usePreventClickOnDoubleClick'
import { Content } from 'interfaces'
import { useAppDispatch, useAppSelector } from 'store'
import {
  blur,
  focus,
  multiSelect,
  rangeSelect,
  select,
  selectContents,
  selectError,
  selectFocused,
  selectIsEditing,
  selectIsFocused,
  selectIsSelected,
  selectLoading,
  selectQuery,
  selectSelectedContents,
  startEditing,
  unselect,
} from 'store/explorer'
import {
  changeDirectory,
  selectCurrentScrollTop,
  selectCurrentSortOption,
  selectCurrentViewMode,
  setCurrentScrollTop,
  sort,
} from 'store/window'

const Explorer = () => {
  const contents = useAppSelector(selectContents)
  const currentScrollTop = useAppSelector(selectCurrentScrollTop)
  const currentSortOption = useAppSelector(selectCurrentSortOption)
  const currentViewMode = useAppSelector(selectCurrentViewMode)
  const error = useAppSelector(selectError)
  const focused = useAppSelector(selectFocused)
  const isEditing = useAppSelector(selectIsEditing)
  const isFocused = useAppSelector(selectIsFocused)
  const isSelected = useAppSelector(selectIsSelected)
  const loading = useAppSelector(selectLoading)
  const selectedContents = useAppSelector(selectSelectedContents)
  const query = useAppSelector(selectQuery)
  const dispatch = useAppDispatch()

  const { createContentMenuHandler, currentDirectoryMenuHandler } =
    useContextMenu()
  const { createCurrentDirectoryDroppableBinder, dropping } = useDnd()

  const open = useCallback(
    async (content: Content) =>
      content.type === 'directory'
        ? dispatch(changeDirectory(content.path))
        : await window.electronAPI.openPath(content.path),
    [dispatch],
  )

  const {
    onClick: handleClickContent,
    onDoubleClick: handleDoubleClickContent,
  } = usePreventClickOnDoubleClick(
    (e: MouseEvent, content: Content) => {
      // prevent container event
      e.stopPropagation()
      if (e.shiftKey) {
        dispatch(rangeSelect(content.path))
      } else if ((e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)) {
        dispatch(multiSelect(content.path))
      } else {
        dispatch(select(content.path))
      }
      dispatch(focus(content.path))
    },
    (_e: MouseEvent, content: Content) => {
      if (
        !isEditing(content.path) &&
        selectedContents.length === 1 &&
        selectedContents[0]?.path === content.path
      ) {
        dispatch(startEditing(content.path))
      }
    },
    (e: MouseEvent, content: Content) => {
      // prevent container event
      e.stopPropagation()
      if (!isEditing(content.path)) {
        open(content)
      }
    },
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

  const isContentFocused = useCallback(
    (content: Content) => isFocused(content.path),
    [isFocused],
  )

  const isContentSelected = useCallback(
    (content: Content) => isSelected(content.path),
    [isSelected],
  )

  const handleChangeOrderBy = useCallback(
    (orderBy: keyof Content) => dispatch(sort(orderBy)),
    [dispatch],
  )

  const handleContextMenuContent = useCallback(
    (e: MouseEvent, content: Content) =>
      createContentMenuHandler(content, selectedContents)(e),
    [createContentMenuHandler, selectedContents],
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

  const handleScroll = useCallback(
    (e: Event) => {
      if (!loading && e.target instanceof HTMLElement) {
        dispatch(setCurrentScrollTop(e.target.scrollTop))
      }
    },
    [dispatch, loading],
  )

  const handleClick = useCallback(() => {
    dispatch(unselect())
    dispatch(blur())
  }, [dispatch])

  return (
    <Box
      onClick={handleClick}
      onContextMenu={currentDirectoryMenuHandler}
      sx={{ height: '100%', position: 'relative' }}
      {...createCurrentDirectoryDroppableBinder()}
    >
      {createElement(
        currentViewMode === 'list' ? ExplorerTable : ExplorerGrid,
        {
          contentFocused: isContentFocused,
          contentSelected: isContentSelected,
          contents,
          focused,
          loading,
          noDataText,
          onChangeOrderBy: handleChangeOrderBy,
          onClickContent: handleClickContent,
          onContextMenuContent: handleContextMenuContent,
          onDoubleClickContent: handleDoubleClickContent,
          onKeyDownArrow: handleKeyDownArrow,
          onKeyDownEnter: handleKeyDownEnter,
          onScroll: handleScroll,
          scrollTop: currentScrollTop,
          sortOption: currentSortOption,
        },
      )}
      {dropping && <Outline />}
    </Box>
  )
}

export default Explorer
