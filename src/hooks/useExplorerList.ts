import { useVirtualizer } from '@tanstack/react-virtual'
import {
  type KeyboardEvent,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import usePrevious from '~/hooks/usePrevious'
import type { Content } from '~/interfaces'
import { useAppDispatch, useAppSelector } from '~/store'
import {
  blur,
  focusByHorizontal,
  focusByVertical,
  focusTo,
  selectContentsByTabId,
  selectEditingByTabId,
  selectErrorByTabId,
  selectFocusedByTabId,
  selectFocusedContentsByTabId,
  selectLoadingByTabId,
  setAnchor,
  startEditing,
  unselectAll,
} from '~/store/explorer-list'
import {
  openContents,
  selectDirectoryPathByTabId,
  selectQueryByTabId,
  selectScrollPositionByTabId,
  selectSortOptionByTabIdAndUrl,
  selectUrlByTabId,
  selectViewModeByTabIdAndUrl,
  setScrollPosition,
} from '~/store/window'
import { createContextMenuHandler } from '~/utils/context-menu'

const useExplorerList = (
  tabId: number,
  columns: number,
  estimateSize: number,
  horizontal: boolean,
  ref: RefObject<HTMLElement | null>,
) => {
  const contents = useAppSelector((state) =>
    selectContentsByTabId(state, tabId),
  )
  const editing = useAppSelector((state) => selectEditingByTabId(state, tabId))
  const directoryPath = useAppSelector((state) =>
    selectDirectoryPathByTabId(state, tabId),
  )
  const error = useAppSelector((state) => selectErrorByTabId(state, tabId))
  const focused = useAppSelector((state) => selectFocusedByTabId(state, tabId))
  const focusedContent = useAppSelector((state) =>
    selectFocusedContentsByTabId(state, tabId),
  )
  const loading = useAppSelector((state) => selectLoadingByTabId(state, tabId))
  const query = useAppSelector((state) => selectQueryByTabId(state, tabId))
  const scrollPosition = useAppSelector((state) =>
    selectScrollPositionByTabId(state, tabId),
  )
  const url = useAppSelector((state) => selectUrlByTabId(state, tabId))
  const sortOption = useAppSelector((state) =>
    selectSortOptionByTabIdAndUrl(state, tabId, url),
  )
  const viewMode = useAppSelector((state) =>
    selectViewModeByTabIdAndUrl(state, tabId, url),
  )
  const dispatch = useAppDispatch()

  const chunks = useMemo(
    () =>
      contents.reduce((acc, _, i) => {
        if (i % columns === 0) {
          acc.push(contents.slice(i, i + columns))
        }
        return acc
      }, [] as Content[][]),
    [columns, contents],
  )

  const virtualizer = useVirtualizer({
    count: chunks.length,
    estimateSize: () => estimateSize,
    getScrollElement: () => ref.current,
    horizontal,
  })

  const previousEditing = usePrevious(editing)
  const previousFocused = usePrevious(focused)
  const previousLoading = usePrevious(loading)

  const [restoring, setRestoring] = useState(false)

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

  const onContextMenu = useMemo(
    () =>
      createContextMenuHandler([
        {
          type: 'newFolder',
          data: { path: directoryPath },
        },
        { type: 'separator' },
        { type: 'cutEntries', data: { paths: [] } },
        { type: 'copyEntries', data: { paths: [] } },
        {
          type: 'pasteEntries',
          data: { path: directoryPath },
        },
        { type: 'separator' },
        { type: 'view', data: { viewMode } },
        { type: 'separator' },
        {
          type: 'sortBy',
          data: { orderBy: sortOption.orderBy },
        },
      ]),
    [directoryPath, sortOption.orderBy, viewMode],
  )

  const onClick = useCallback(() => {
    dispatch(blur({ tabId }))
    dispatch(unselectAll({ tabId }))
  }, [dispatch, tabId])

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ': {
          const url = focusedContent?.url
          if (url) {
            dispatch(openContents(url))
          }
          return
        }
        case 'Enter':
          if (!e.nativeEvent.isComposing && focused) {
            dispatch(startEditing({ tabId, path: focused }))
          }
          return
        case 'ArrowUp':
          e.preventDefault()
          return (e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)
            ? dispatch(focusTo(tabId, 'first', columns, e.shiftKey))
            : dispatch(focusByVertical(tabId, -1, columns, e.shiftKey))
        case 'ArrowDown':
          e.preventDefault()
          return (e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)
            ? dispatch(focusTo(tabId, 'last', columns, e.shiftKey))
            : dispatch(focusByVertical(tabId, 1, columns, e.shiftKey))
        case 'ArrowLeft':
          e.preventDefault()
          if (horizontal) {
            return dispatch(focusByVertical(tabId, -1, columns, e.shiftKey))
          }
          return dispatch(focusByHorizontal(tabId, -1, columns, e.shiftKey))
        case 'ArrowRight':
          e.preventDefault()
          if (horizontal) {
            return dispatch(focusByVertical(tabId, 1, columns, e.shiftKey))
          }
          return dispatch(focusByHorizontal(tabId, 1, columns, e.shiftKey))
        case 'Shift':
          e.preventDefault()
          if (focused) {
            dispatch(setAnchor({ tabId, anchor: focused }))
          }
          return
      }
    },
    [columns, dispatch, focused, focusedContent?.url, horizontal, tabId],
  )

  // biome-ignore lint/correctness/useExhaustiveDependencies: false positive
  useEffect(() => virtualizer.measure(), [virtualizer, estimateSize])

  // biome-ignore lint/correctness/useExhaustiveDependencies: false positive
  useEffect(() => virtualizer.scrollToOffset(0), [virtualizer, sortOption])

  useEffect(() => {
    if (focused && previousFocused !== focused) {
      const index = contents.findIndex((content) => content.path === focused)
      if (index >= 0) {
        const rowIndex = Math.floor(index / columns)
        virtualizer.scrollToIndex(rowIndex)
      }
    }
  }, [columns, contents, focused, previousFocused, virtualizer])

  useEffect(() => {
    const el = ref?.current
    if (!el) {
      return
    }
    if (focused && previousEditing && !editing) {
      el.focus()
    }
  }, [editing, focused, previousEditing, ref])

  useEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }
    const handler = (e: Event) => {
      if (e.target instanceof HTMLElement) {
        if (!loading) {
          dispatch(
            setScrollPosition(
              horizontal ? e.target.scrollLeft : e.target.scrollTop,
            ),
          )
        }
      }
    }
    el.addEventListener('scrollend', handler)
    return () => el.removeEventListener('scrollend', handler)
  }, [dispatch, horizontal, loading, ref])

  useEffect(() => {
    if (!previousLoading && loading) {
      setRestoring(true)
    }
    if (previousLoading && !loading) {
      window.setTimeout(() => {
        virtualizer.scrollToOffset(scrollPosition)
        setRestoring(false)
      })
    }
    // NOTE: Do not clear timer
    // return () => clearTimeout(timer)
  }, [loading, previousLoading, scrollPosition, virtualizer])

  return {
    chunks,
    loading,
    noDataText,
    onClick,
    onContextMenu,
    onKeyDown,
    restoring,
    virtualizer,
  }
}

export default useExplorerList
