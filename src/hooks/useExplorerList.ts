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
  addSelection,
  blur,
  focus,
  select,
  selectAnchorByTabId,
  selectContentsByTabId,
  selectEditingByTabId,
  selectErrorByTabId,
  selectFocusedByTabId,
  selectLoadingByTabId,
  setAnchor,
  startEditing,
  unselectAll,
} from '~/store/explorer-list'
import {
  selectDirectoryPathByTabId,
  selectQueryByTabId,
  selectScrollTopByTabId,
  selectSortOptionByTabIdAndDirectoryPath,
  selectViewModeByTabIdAndDirectoryPath,
  setScrollTop,
} from '~/store/window'
import { createContextMenuHandler } from '~/utils/contextMenu'
import { isZephySchema } from '~/utils/url'

const useExplorerList = (
  tabId: number,
  columns: number,
  estimateSize: number,
  horizontal: boolean,
  ref: RefObject<HTMLElement | null>,
) => {
  const anchor = useAppSelector((state) => selectAnchorByTabId(state, tabId))
  const contents = useAppSelector((state) =>
    selectContentsByTabId(state, tabId),
  )
  const directoryPath = useAppSelector((state) =>
    selectDirectoryPathByTabId(state, tabId),
  )
  const editing = useAppSelector((state) => selectEditingByTabId(state, tabId))
  const error = useAppSelector((state) => selectErrorByTabId(state, tabId))
  const focused = useAppSelector((state) => selectFocusedByTabId(state, tabId))
  const loading = useAppSelector((state) => selectLoadingByTabId(state, tabId))
  const query = useAppSelector((state) => selectQueryByTabId(state, tabId))
  const scrollTop = useAppSelector((state) =>
    selectScrollTopByTabId(state, tabId),
  )
  const sortOption = useAppSelector((state) =>
    selectSortOptionByTabIdAndDirectoryPath(state, tabId, directoryPath),
  )
  const viewMode = useAppSelector((state) =>
    selectViewModeByTabIdAndDirectoryPath(state, tabId, directoryPath),
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
  }, [loading, previousLoading, scrollTop, virtualizer])

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => virtualizer.scrollToOffset(0), [sortOption])

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

  const zephySchema = useMemo(
    () => isZephySchema(directoryPath),
    [directoryPath],
  )

  const onClick = useCallback(() => {
    dispatch(blur(tabId))
    dispatch(unselectAll(tabId))
  }, [dispatch, tabId])

  const onContextMenu = useMemo(
    () =>
      createContextMenuHandler([
        {
          type: 'newFolder',
          data: { path: zephySchema ? undefined : directoryPath },
        },
        { type: 'separator' },
        { type: 'cutEntries', data: { paths: [] } },
        { type: 'copyEntries', data: { paths: [] } },
        {
          type: 'pasteEntries',
          data: { path: zephySchema ? undefined : directoryPath },
        },
        { type: 'separator' },
        { type: 'view', data: { viewMode } },
        { type: 'separator' },
        {
          type: 'sortBy',
          data: { orderBy: sortOption.orderBy },
        },
      ]),
    [directoryPath, sortOption.orderBy, viewMode, zephySchema],
  )

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!focused) {
        return
      }

      const focusBy = (offset: number) => {
        const index = contents.findIndex((c) => c.path === focused)
        if (index < 0) {
          return
        }

        const newIndex = index + offset
        const content = contents[newIndex]
        if (!content) {
          return
        }

        dispatch(select(tabId, content.path))
        dispatch(focus(tabId, content.path))
      }

      const focusByHorizontal = (offset: number, multiSelect: boolean) => {
        const index = contents.findIndex((c) => c.path === focused)
        if (index < 0) {
          return
        }

        const rowIndex = Math.floor(index / columns)
        const columnIndex = index % columns
        const newColumnIndex = columnIndex + offset

        if (newColumnIndex < 0 || newColumnIndex >= columns) {
          return
        }

        const newIndex = columns * rowIndex + newColumnIndex
        const content = contents[newIndex]
        if (!content) {
          return
        }

        if (multiSelect) {
          dispatch(unselectAll(tabId))
          dispatch(addSelection(tabId, content.path, anchor))
        } else {
          dispatch(select(tabId, content.path))
        }
        dispatch(focus(tabId, content.path))
      }

      const focusByVertical = (offset: number, multiSelect: boolean) => {
        const index = contents.findIndex((c) => c.path === focused)
        if (index < 0) {
          return
        }

        const rowIndex = Math.floor(index / columns)
        const columnIndex = index % columns
        const newRowIndex = rowIndex + offset

        const newIndex = columns * newRowIndex + columnIndex
        const content = contents[newIndex]
        if (!content) {
          return
        }

        if (multiSelect) {
          dispatch(unselectAll(tabId))
          dispatch(addSelection(tabId, content.path, anchor))
        } else {
          dispatch(select(tabId, content.path))
        }
        dispatch(focus(tabId, content.path))
      }

      const focusTo = (position: 'first' | 'last', multiSelect: boolean) => {
        const index = contents.findIndex((c) => c.path === focused)
        const columnIndex = index % columns
        const maxRowIndex = Math.floor(contents.length / columns)

        let newIndex: number
        if (index >= 0) {
          if (position === 'first') {
            newIndex = columnIndex
          } else {
            newIndex = maxRowIndex * columns + columnIndex
            if (newIndex >= contents.length) {
              newIndex -= columns
            }
          }
        } else {
          newIndex = 0
        }

        const content = contents[newIndex]
        if (!content) {
          return
        }

        if (multiSelect) {
          dispatch(unselectAll(tabId))
          dispatch(addSelection(tabId, content.path, anchor))
        } else {
          dispatch(select(tabId, content.path))
        }
        dispatch(focus(tabId, content.path))
      }

      switch (e.key) {
        case 'Enter':
          if (!e.nativeEvent.isComposing) {
            dispatch(startEditing(tabId, focused))
          }
          return
        case 'ArrowUp':
          e.preventDefault()
          return (e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)
            ? focusTo('first', e.shiftKey)
            : focusByVertical(-1, e.shiftKey)
        case 'ArrowDown':
          e.preventDefault()
          return (e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)
            ? focusTo('last', e.shiftKey)
            : focusByVertical(1, e.shiftKey)
        case 'ArrowLeft':
          e.preventDefault()
          return focusByHorizontal(-1, e.shiftKey)
        case 'ArrowRight':
          e.preventDefault()
          return focusByHorizontal(1, e.shiftKey)
        // TODO: focus external previous/next element
        case 'Tab':
          e.preventDefault()
          return focusBy(e.shiftKey ? -1 : 1)
        case 'Shift':
          e.preventDefault()
          return dispatch(setAnchor({ tabId, anchor: focused }))
      }
    },
    [anchor, columns, contents, focused, dispatch, tabId],
  )

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
