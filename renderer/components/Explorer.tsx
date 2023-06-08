import { Box } from '@mui/material'
import { KeyboardEvent, MouseEvent, createElement } from 'react'

import ExplorerGrid from 'components/ExplorerGrid'
import ExplorerTable from 'components/ExplorerTable'
import Outline from 'components/Outline'
import useContextMenu from 'hooks/useContextMenu'
import useFileDnd from 'hooks/useFileDnd'
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
  selectFocused,
  selectIsEditing,
  selectIsFocused,
  selectIsSelected,
  selectLoading,
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
  setCurrentSortOption,
} from 'store/window'

const Explorer = () => {
  const contents = useAppSelector(selectContents)
  const currentScrollTop = useAppSelector(selectCurrentScrollTop)
  const currentSortOption = useAppSelector(selectCurrentSortOption)
  const currentViewMode = useAppSelector(selectCurrentViewMode)
  const focused = useAppSelector(selectFocused)
  const isEditing = useAppSelector(selectIsEditing)
  const isFocused = useAppSelector(selectIsFocused)
  const isSelected = useAppSelector(selectIsSelected)
  const loading = useAppSelector(selectLoading)
  const selectedContents = useAppSelector(selectSelectedContents)
  const dispatch = useAppDispatch()

  const { createContentMenuHandler, createDirectoryMenuHandler } =
    useContextMenu()
  const { createDirectoryDroppableAttrs, dropping } = useFileDnd()

  const open = async (content: Content) =>
    content.type === 'directory'
      ? dispatch(changeDirectory(content.path))
      : await window.electronAPI.openPath(content.path)

  const {
    handleClick: handleClickContent,
    handleDoubleClick: handleDoubleClickContent,
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
    }
  )

  const isContentFocused = (content: Content) => isFocused(content.path)

  const isContentSelected = (content: Content) => isSelected(content.path)

  const handleChangeSortOption = (sortOption: {
    order: 'asc' | 'desc'
    orderBy: keyof Content
  }) => dispatch(setCurrentSortOption(sortOption))

  const handleContextMenuContent = (e: MouseEvent, content: Content) =>
    createContentMenuHandler(content)(e)

  const handleKeyDownArrow = (e: KeyboardEvent, content: Content) => {
    e.preventDefault()
    dispatch(select(content.path))
    dispatch(focus(content.path))
  }

  const handleKeyDownEnter = async (e: KeyboardEvent) => {
    e.preventDefault()
    const content = selectedContents[0]
    if (content) {
      await open(content)
    }
  }

  const handleScroll = (e: Event) => {
    if (!loading && e.target instanceof HTMLElement) {
      dispatch(setCurrentScrollTop(e.target.scrollTop))
    }
  }

  const handleClick = () => {
    dispatch(unselect())
    dispatch(blur())
  }

  return (
    <Box
      onClick={handleClick}
      onContextMenu={createDirectoryMenuHandler()}
      sx={{ height: '100%', position: 'relative' }}
      {...createDirectoryDroppableAttrs()}
    >
      {createElement(
        currentViewMode === 'list' ? ExplorerTable : ExplorerGrid,
        {
          contentFocused: isContentFocused,
          contentSelected: isContentSelected,
          contents,
          focused,
          loading,
          onChangeSortOption: handleChangeSortOption,
          onClickContent: handleClickContent,
          onContextMenuContent: handleContextMenuContent,
          onDoubleClickContent: handleDoubleClickContent,
          onKeyDownArrow: handleKeyDownArrow,
          onKeyDownEnter: handleKeyDownEnter,
          onScroll: handleScroll,
          scrollTop: currentScrollTop,
          sortOption: currentSortOption,
        }
      )}
      {dropping && <Outline />}
    </Box>
  )
}

export default Explorer
