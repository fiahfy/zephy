import { Box } from '@mui/material'
import { createElement } from 'react'

import ExplorerGrid from 'components/ExplorerGrid'
import ExplorerTable from 'components/ExplorerTable'
import { Content } from 'interfaces'
import { useAppDispatch, useAppSelector } from 'store'
import {
  move,
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

  const isContentSelected = (content: Content) => isSelected(content.path)

  const handleChangeSortOption = (sortOption: {
    order: 'asc' | 'desc'
    orderBy: keyof Content
  }) => dispatch(sort(sortOption.orderBy, sortOption.order))

  const handleClickContent = (content: Content) =>
    dispatch(select(content.path))

  const handleDoubleClickContent = async (content: Content) =>
    content.type === 'directory'
      ? dispatch(move(content.path))
      : await window.electronAPI.openPath(content.path)

  const handleFocusContent = (content: Content) =>
    dispatch(select(content.path))

  const handleKeyDownEnter = async () => {
    const content = selectedContents[0]
    if (!content) {
      return
    }
    if (content.type === 'directory') {
      dispatch(move(content.path))
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
    <Box sx={{ height: '100%' }}>
      {createElement(viewMode === 'list' ? ExplorerTable : ExplorerGrid, {
        contentSelected: isContentSelected,
        contents,
        loading,
        onChangeSortOption: handleChangeSortOption,
        onClickContent: handleClickContent,
        onDoubleClickContent: handleDoubleClickContent,
        onFocusContent: handleFocusContent,
        onKeyDownEnter: handleKeyDownEnter,
        onScroll: handleScroll,
        scrollTop: currentScrollTop,
        sortOption: currentSortOption,
      })}
    </Box>
  )
}

export default IndexPage
