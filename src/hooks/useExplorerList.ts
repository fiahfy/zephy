import { KeyboardEvent, useCallback, useMemo } from 'react'
import { Content } from '~/interfaces'
import { useAppDispatch, useAppSelector } from '~/store'
import {
  focus,
  select,
  selectGetContents,
  selectGetEditing,
  selectGetError,
  selectGetFocused,
  selectGetLoading,
  selectGetQuery,
  selectGetSelectedContents,
} from '~/store/explorer'
import { openEntry } from '~/store/settings'
import {
  changeDirectory,
  selectGetScrollTop,
  setScrollTop,
} from '~/store/window'

const useExplorerList = (tabIndex: number) => {
  const contents = useAppSelector(selectGetContents)(tabIndex)
  const editing = useAppSelector(selectGetEditing)(tabIndex)
  const error = useAppSelector(selectGetError)(tabIndex)
  const focused = useAppSelector(selectGetFocused)(tabIndex)
  const loading = useAppSelector(selectGetLoading)(tabIndex)
  const query = useAppSelector(selectGetQuery)(tabIndex)
  const scrollTop = useAppSelector(selectGetScrollTop)(tabIndex)
  const selectedContents = useAppSelector(selectGetSelectedContents)(tabIndex)
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
