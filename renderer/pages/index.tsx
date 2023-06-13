import { createElement, useCallback, useMemo } from 'react'
import ExplorerGrid from 'components/ExplorerGrid'
import ExplorerTable from 'components/ExplorerTable'
import { ExplorerContent } from 'interfaces'
import { useAppDispatch, useAppSelector } from 'store'
import { selectGetRating } from 'store/rating'
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
  selectQuery,
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
  const getRating = useAppSelector(selectGetRating)
  const isSelected = useAppSelector(selectIsSelected)
  const layout = useAppSelector(selectLayout)
  const loading = useAppSelector(selectLoading)
  const query = useAppSelector(selectQuery)
  const selectedContents = useAppSelector(selectSelectedContents)
  const dispatch = useAppDispatch()

  const comparator = useCallback(
    (a: ExplorerContent, b: ExplorerContent) => {
      let result = 0
      const aValue = a[currentSortOption.orderBy]
      const bValue = b[currentSortOption.orderBy]
      if (aValue !== undefined && bValue !== undefined) {
        if (aValue > bValue) {
          result = 1
        } else if (aValue < bValue) {
          result = -1
        }
      } else {
        result = 0
      }
      const orderSign = currentSortOption.order === 'desc' ? -1 : 1
      return orderSign * result
    },
    [currentSortOption]
  )

  const explorerContents = useMemo(
    () =>
      contents
        .filter(
          (content) =>
            !query || content.name.toLowerCase().includes(query.toLowerCase())
        )
        .map((content) => ({
          ...content,
          rating: getRating(content.path),
        }))
        .sort((a, b) => comparator(a, b)),
    [comparator, contents, getRating, query]
  )

  const isContentSelected = (content: ExplorerContent) =>
    isSelected(content.path)

  const handleChangeSortOption = (sortOption: {
    order: 'asc' | 'desc'
    orderBy: 'name' | 'rating' | 'dateModified'
  }) => {
    dispatch(sort(currentDirectory, sortOption))
  }

  const handleClickContent = (content: ExplorerContent) =>
    dispatch(select(content.path))

  const handleDoubleClickContent = async (content: ExplorerContent) =>
    content.type === 'directory'
      ? dispatch(move(content.path))
      : await window.electronAPI.openPath(content.path)

  const handleFocusContent = (content: ExplorerContent) =>
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
        contents: explorerContents,
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
