import { Box } from '@mui/material'
import { KeyboardEvent, MouseEvent, createElement, useState } from 'react'

import ExplorerGrid from 'components/ExplorerGrid'
import ExplorerTable from 'components/ExplorerTable'
import useContextMenu from 'hooks/useContextMenu'
import { Content } from 'interfaces'
import { useAppDispatch, useAppSelector } from 'store'
import {
  changeDirectory,
  multiSelect,
  rangeSelect,
  scroll,
  select,
  selectContents,
  selectCurrentScrollTop,
  selectCurrentSortOption,
  selectIsSelected,
  selectLoading,
  selectSelectedContents,
  selectViewMode,
  sort,
  unselectAll,
} from 'store/window'

const IndexPage = () => {
  const contents = useAppSelector(selectContents)
  const currentScrollTop = useAppSelector(selectCurrentScrollTop)
  const currentSortOption = useAppSelector(selectCurrentSortOption)
  const isSelected = useAppSelector(selectIsSelected)
  const loading = useAppSelector(selectLoading)
  const selectedContents = useAppSelector(selectSelectedContents)
  const viewMode = useAppSelector(selectViewMode)
  const dispatch = useAppDispatch()

  const { createContentMenuHandler } = useContextMenu()

  const [focused, setFocused] = useState<string>()

  const handleClick = () => {
    dispatch(unselectAll())
    setFocused(undefined)
  }

  const isContentFocused = (content: Content) => content.path === focused

  const isContentSelected = (content: Content) => isSelected(content.path)

  const handleChangeSortOption = (sortOption: {
    order: 'asc' | 'desc'
    orderBy: keyof Content
  }) => dispatch(sort(sortOption.orderBy, sortOption.order))

  const handleClickContent = (e: MouseEvent, content: Content) => {
    e.stopPropagation()
    if (e.shiftKey) {
      dispatch(rangeSelect(content.path))
    } else if ((e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)) {
      dispatch(multiSelect(content.path))
    } else {
      dispatch(select(content.path))
    }
    setFocused(content.path)
  }

  const handleContextMenuContent = (e: MouseEvent, content: Content) =>
    createContentMenuHandler(content)(e)

  const handleDoubleClickContent = async (_e: MouseEvent, content: Content) =>
    content.type === 'directory'
      ? dispatch(changeDirectory(content.path))
      : await window.electronAPI.openPath(content.path)

  const handleKeyDownArrow = (e: KeyboardEvent, content: Content) => {
    e.preventDefault()
    dispatch(select(content.path))
    setFocused(content.path)
  }

  const handleKeyDownEnter = async (e: KeyboardEvent) => {
    e.preventDefault()
    const content = selectedContents[0]
    if (!content) {
      return
    }
    if (content.type === 'directory') {
      dispatch(changeDirectory(content.path))
    } else {
      await window.electronAPI.openPath(content.path)
    }
  }

  const handleScroll = (e: Event) => {
    if (!loading && e.target instanceof HTMLElement) {
      dispatch(scroll(e.target.scrollTop))
    }
  }

  return (
    <Box onClick={handleClick} sx={{ height: '100%' }}>
      {createElement(viewMode === 'list' ? ExplorerTable : ExplorerGrid, {
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
      })}
    </Box>
  )
}

export default IndexPage
