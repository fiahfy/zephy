import { KeyboardEvent, useCallback, useMemo } from 'react'
import { Content } from '~/interfaces'
import { useAppDispatch, useAppSelector } from '~/store'
import {
  focus,
  select,
  selectContentsByTabIndex,
  selectEditingByTabIndex,
  selectErrorByTabIndex,
  selectFocusedByTabIndex,
  selectLoadingByTabIndex,
  selectQueryByTabIndex,
  selectSelectedContentsByTabIndex,
} from '~/store/explorer'
import { openEntry } from '~/store/settings'
import {
  changeDirectory,
  selectScrollTopByTabIndex,
  setScrollTop,
} from '~/store/window'

const useExplorerList = (tabIndex: number) => {
  const contents = useAppSelector((state) =>
    selectContentsByTabIndex(state, tabIndex),
  )
  const editing = useAppSelector((state) =>
    selectEditingByTabIndex(state, tabIndex),
  )
  const error = useAppSelector((state) =>
    selectErrorByTabIndex(state, tabIndex),
  )
  const focused = useAppSelector((state) =>
    selectFocusedByTabIndex(state, tabIndex),
  )
  const loading = useAppSelector((state) =>
    selectLoadingByTabIndex(state, tabIndex),
  )
  const query = useAppSelector((state) =>
    selectQueryByTabIndex(state, tabIndex),
  )
  const scrollTop = useAppSelector((state) =>
    selectScrollTopByTabIndex(state, tabIndex),
  )
  const selectedContents = useAppSelector((state) =>
    selectSelectedContentsByTabIndex(state, tabIndex),
  )
  const dispatch = useAppDispatch()

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

  const onKeyDownArrow = useCallback(
    (e: KeyboardEvent, content: Content) => {
      e.preventDefault()
      dispatch(select(content.path))
      dispatch(focus(content.path))
    },
    [dispatch],
  )

  const onKeyDownEnter = useCallback(
    async (e: KeyboardEvent) => {
      e.preventDefault()
      const content = selectedContents[0]
      if (!content) {
        return
      }
      content.type === 'directory'
        ? dispatch(changeDirectory(content.path))
        : dispatch(openEntry(content.path))
    },
    [dispatch, selectedContents],
  )

  const onScrollEnd = useCallback(
    (scrollTop: number) => {
      if (!loading) {
        dispatch(setScrollTop(scrollTop))
      }
    },
    [dispatch, loading],
  )

  return {
    contents,
    editing,
    focused,
    loading,
    noDataText,
    onKeyDownArrow,
    onKeyDownEnter,
    onScrollEnd,
    scrollTop,
  }
}

export default useExplorerList
