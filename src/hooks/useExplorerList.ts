import { useVirtualizer } from '@tanstack/react-virtual'
import debounce from 'lodash.debounce'
import throttle from 'lodash.throttle'
import {
  type KeyboardEvent,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
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
  selectCurrentByTabId,
  selectDirectoryPathByTabId,
  selectQueryByTabId,
  selectScrollPositionByTabId,
  selectSortOptionByTabIdAndUrl,
  selectUrlByTabId,
  selectViewModeByTabIdAndUrl,
  setScrollPosition,
} from '~/store/window'
import { createContextMenuHandler } from '~/utils/context-menu'
import usePrevious from './usePrevious'

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
  const current = useAppSelector((state) => selectCurrentByTabId(state, tabId))
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

  const [restoring, setRestoring] = useState(false)

  const canShow = useMemo(() => current && !loading, [current, loading])
  const previousCanShow = usePrevious(canShow)

  const previousFocused = usePrevious(focused)

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
    // NOTE: estimateSize が決定していない場合は出力を防ぐため 0 とする
    count: estimateSize ? chunks.length : 0,
    estimateSize: () => estimateSize,
    getScrollElement: () => ref.current,
    horizontal,
  })

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
            e.preventDefault()
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
  useEffect(
    () => virtualizer.scrollToOffset(0),
    [virtualizer, sortOption.order, sortOption.orderBy, query],
  )

  const scroll = useMemo(
    () =>
      throttle(
        (rowIndex: number) => {
          window.setTimeout(() => virtualizer.scrollToIndex(rowIndex))
        },
        300,
        { leading: false },
      ),
    [virtualizer],
  )

  useEffect(() => {
    // NOTE: mount 時に反応してしまうため、切り替わったタイミングのみで発火するようにする
    if (!previousFocused || !focused) {
      return
    }
    if (previousFocused === focused) {
      return
    }
    const index = contents.findIndex((content) => content.path === focused)
    if (index < 0) {
      return
    }
    const rowIndex = Math.floor(index / columns)
    scroll(rowIndex)
  }, [columns, contents, focused, previousFocused, scroll])

  useEffect(() => {
    const el = ref?.current
    if (!el) {
      return
    }
    if (focused && !editing) {
      el.focus()
    }
  }, [editing, focused, ref])

  useEffect(() => {
    // NOTE: mount 時と scrollPosition に反応してしまうため、切り替わったタイミングのみで発火するようにする
    if (previousCanShow === true && !canShow) {
      setRestoring(true)
    }
    if (previousCanShow === false && canShow) {
      window.setTimeout(() => {
        virtualizer.scrollToOffset(scrollPosition)
        window.setTimeout(() => setRestoring(false))
      })
    }
    //   // NOTE: Do not clear timer
    //   // return () => clearTimeout(timer)
  }, [canShow, previousCanShow, scrollPosition, virtualizer])

  useEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }

    const storeScrollPosition = (element: HTMLElement) => {
      const scrollPosition = horizontal ? element.scrollLeft : element.scrollTop
      dispatch(setScrollPosition(tabId, scrollPosition))
    }

    let scrolled = false

    const handleScroll = () => {
      scrolled = true
    }
    const handleScrollEnd = debounce((e: Event) => {
      if (e.target instanceof HTMLElement) {
        storeScrollPosition(e.target)
      }
    }, 300)
    el.addEventListener('scroll', handleScroll)
    el.addEventListener('scrollend', handleScrollEnd)
    return () => {
      el.removeEventListener('scroll', handleScroll)
      el.removeEventListener('scrollend', handleScrollEnd)
      // NOTE: useEffect が2回実行されるため1回目の unmount での動作を防ぐ
      if (scrolled) {
        storeScrollPosition(el)
      }
    }
  }, [dispatch, horizontal, ref, tabId])

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
