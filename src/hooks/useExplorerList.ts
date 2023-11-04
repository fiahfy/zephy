import { KeyboardEvent, useCallback, useMemo } from 'react'
import { Content } from '~/interfaces'
import { useAppDispatch, useAppSelector } from '~/store'
import {
  focus,
  select,
  selectContents,
  selectError,
  selectFocused,
  selectLoading,
  selectQuery,
  selectSelectedContents,
} from '~/store/explorer'
import { openEntry } from '~/store/settings'
import {
  changeDirectory,
  selectCurrentScrollTop,
  setCurrentScrollTop,
} from '~/store/window'

const useExplorerList = () => {
  const contents = useAppSelector(selectContents)
  const currentScrollTop = useAppSelector(selectCurrentScrollTop)
  const error = useAppSelector(selectError)
  const focused = useAppSelector(selectFocused)
  const loading = useAppSelector(selectLoading)
  const query = useAppSelector(selectQuery)
  const selectedContents = useAppSelector(selectSelectedContents)
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
        dispatch(setCurrentScrollTop(scrollTop))
      }
    },
    [dispatch, loading],
  )

  return {
    contents,
    focused,
    loading,
    noDataText,
    onKeyDownArrow,
    onKeyDownEnter,
    onScrollEnd,
    scrollTop: currentScrollTop,
  }
}

export default useExplorerList
