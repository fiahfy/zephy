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
  selectCurrentDirectory,
  selectCurrentScrollTop,
  selectCurrentSortOption,
  selectIsSelected,
  selectLayout,
  selectLoading,
  selectSelectedContents,
  sort,
} from 'store/window'
import { Box } from '@mui/material'
import { directoryContextMenuProps } from 'utils/contextMenu'

const IndexPage = () => {
  const contents = useAppSelector(selectContents)
  const currentDirectory = useAppSelector(selectCurrentDirectory)
  const currentScrollTop = useAppSelector(selectCurrentScrollTop)
  const currentSortOption = useAppSelector(selectCurrentSortOption)
  const isSelected = useAppSelector(selectIsSelected)
  const layout = useAppSelector(selectLayout)
  const loading = useAppSelector(selectLoading)
  const selectedContents = useAppSelector(selectSelectedContents)
  const dispatch = useAppDispatch()

  const isContentSelected = (content: Content) => isSelected(content.path)

  const handleChangeSortOption = (sortOption: {
    order: 'asc' | 'desc'
    orderBy: 'name' | 'rating' | 'dateModified'
  }) => {
    dispatch(sort(currentDirectory, sortOption))
  }

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
    <Box
      {...directoryContextMenuProps(currentDirectory)}
      sx={{ height: '100%' }}
    >
      {createElement(layout === 'list' ? ExplorerTable : ExplorerGrid, {
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
