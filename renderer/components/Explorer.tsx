import { Box } from '@mui/material'
import {
  FocusEvent,
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
  selectCurrentDirectory,
  selectCurrentScrollTop,
  selectCurrentSortOption,
  selectCurrentViewMode,
  selectZephySchema,
  setCurrentScrollTop,
  sort,
} from 'store/window'
import { selectIsFavorite } from 'store/favorite'

const Explorer = () => {
  const contents = useAppSelector(selectContents)
  const currentDirectory = useAppSelector(selectCurrentDirectory)
  const currentScrollTop = useAppSelector(selectCurrentScrollTop)
  const currentSortOption = useAppSelector(selectCurrentSortOption)
  const currentViewMode = useAppSelector(selectCurrentViewMode)
  const error = useAppSelector(selectError)
  const focused = useAppSelector(selectFocused)
  const isEditing = useAppSelector(selectIsEditing)
  const isFavorite = useAppSelector(selectIsFavorite)
  const isFocused = useAppSelector(selectIsFocused)
  const isSelected = useAppSelector(selectIsSelected)
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

  const createContentMenuHandler = useCallback(
    (content: Content, selectedContents: Content[]) => {
      const directory = content.type === 'directory'
      const path = content.path
      const selectedPaths = selectedContents.map((content) => content.path)
      const paths = selectedPaths.includes(path) ? selectedPaths : [path]
      return createMenuHandler([
        ...(paths.length === 1
          ? [
              {
                id: directory ? 'openDirectory' : 'open',
                params: { path },
              },
              ...(directory
                ? [
                    {
                      id: 'openDirectoryInNewWindow',
                      params: { path },
                    },
                  ]
                : []),
              {
                id: 'revealInFinder',
                params: { path },
              },
              { id: 'separator' },
              {
                id: 'copyPath',
                params: { path },
              },
              { id: 'separator' },
              ...(directory
                ? [
                    {
                      id: 'toggleFavorite',
                      params: { path, favorite: isFavorite(path) },
                    },
                  ]
                : []),
              { id: 'separator' },
              {
                id: 'rename',
                params: { path },
              },
            ]
          : []),
        {
          id: 'moveToTrash',
          params: { paths },
        },
        { id: 'separator' },
        { id: 'cut', params: { paths } },
        { id: 'copy', params: { paths } },
        {
          id: 'paste',
          params: { path: zephySchema ? undefined : currentDirectory },
        },
      ])
    },
    [createMenuHandler, currentDirectory, isFavorite, zephySchema],
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
          onScrollEnd: handleScrollEnd,
          scrollTop: currentScrollTop,
          sortOption: currentSortOption,
        },
      )}
      {dropping && <Outline />}
    </Box>
  )
}

export default Explorer
