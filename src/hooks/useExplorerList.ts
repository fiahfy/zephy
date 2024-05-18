import { useVirtualizer } from '@tanstack/react-virtual'
import { RefObject, useEffect, useMemo, useState } from 'react'
import useExplorer from '~/hooks/useExplorer'
import usePrevious from '~/hooks/usePrevious'
import { Content } from '~/interfaces'
import { useAppDispatch, useAppSelector } from '~/store'
import {
  selectContentsByTabIndex,
  selectErrorByTabIndex,
  selectFocusedByTabIndex,
  selectLoadingByTabIndex,
  selectQueryByTabIndex,
} from '~/store/explorer'
import { selectScrollTopByTabIndex, setScrollTop } from '~/store/window'

const useExplorerList = (
  tabIndex: number,
  columns: number,
  estimateSize: number,
  ref: RefObject<HTMLElement>,
) => {
  const contents = useAppSelector((state) =>
    selectContentsByTabIndex(state, tabIndex),
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
  const dispatch = useAppDispatch()

  const { setColumns } = useExplorer()

  const chunks = useMemo(
    () =>
      contents.reduce(
        (acc, _, i) =>
          i % columns ? acc : [...acc, contents.slice(i, i + columns)],
        [] as Content[][],
      ),
    [columns, contents],
  )

  const virtualizer = useVirtualizer({
    count: chunks.length,
    estimateSize: () => estimateSize,
    getScrollElement: () => ref.current,
  })

  const previousFocused = usePrevious(focused)
  const previousLoading = usePrevious(loading)

  const [restoring, setRestoring] = useState(false)

  useEffect(() => {
    setColumns(columns)
  }, [columns, setColumns])

  useEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }
    const handler = (e: Event) => {
      if (e.target instanceof HTMLElement) {
        if (!loading) {
          dispatch(setScrollTop(e.target.scrollTop))
        }
      }
    }
    el.addEventListener('scrollend', handler)
    return () => el.removeEventListener('scrollend', handler)
  }, [dispatch, loading, ref])

  useEffect(() => {
    if (!previousLoading && loading) {
      setRestoring(true)
    }
    if (previousLoading && !loading) {
      setTimeout(() => {
        virtualizer.scrollToOffset(scrollTop)
        setRestoring(false)
      })
    }
  }, [contents, loading, previousLoading, scrollTop, virtualizer])

  useEffect(() => {
    if (focused && previousFocused !== focused) {
      const index = contents.findIndex((content) => content.path === focused)
      if (index >= 0) {
        const rowIndex = Math.floor(index / columns)
        virtualizer.scrollToIndex(rowIndex)
      }
    }
  }, [columns, contents, focused, loading, previousFocused, virtualizer])

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

  return {
    chunks,
    loading,
    noDataText,
    restoring,
    virtualizer,
  }
}

export default useExplorerList
