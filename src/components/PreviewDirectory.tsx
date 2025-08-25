import { Box, Stack } from '@mui/material'
import { useVirtualizer } from '@tanstack/react-virtual'
import throttle from 'lodash.throttle'
import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import PreviewDirectoryItem from '~/components/PreviewDirectoryItem'
import PreviewEmptyState from '~/components/PreviewEmptyState'
import usePrevious from '~/hooks/usePrevious'
import useWatcher from '~/hooks/useWatcher'
import type { Content } from '~/interfaces'
import { useAppDispatch, useAppSelector } from '~/store'
import {
  blur,
  focusByHorizontal,
  focusByVertical,
  focusTo,
  handle,
  load,
  selectContents,
  selectError,
  selectFocused,
  selectLoading,
  selectPreviewContentPath,
  setAnchor,
  startEditing,
  unselectAll,
} from '~/store/preview'
import { createContextMenuHandler } from '~/utils/context-menu'

const maxItemSize = 256

const PreviewDirectory = () => {
  const contents = useAppSelector(selectContents)
  const error = useAppSelector(selectError)
  const focused = useAppSelector(selectFocused)
  const loading = useAppSelector(selectLoading)
  const previewContentPath = useAppSelector(selectPreviewContentPath)
  const dispatch = useAppDispatch()

  const { unwatch, watch } = useWatcher()

  const [wrapperWidth, setWrapperWidth] = useState(0)

  const ref = useRef<HTMLDivElement>(null)

  const columns = useMemo(
    () => Math.ceil(wrapperWidth / maxItemSize) || 1,
    [wrapperWidth],
  )

  const size = useMemo(() => wrapperWidth / columns, [columns, wrapperWidth])

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
    estimateSize: () => size,
    getScrollElement: () => ref.current,
  })

  const previousFocused = usePrevious(focused)

  const noDataText = useMemo(
    () =>
      loading
        ? 'Loading items...'
        : error
          ? 'The specified directory does not exist'
          : 'No items',
    [loading, error],
  )

  const onContextMenu = useMemo(() => {
    if (!previewContentPath) {
      return
    }
    return createContextMenuHandler([
      {
        type: 'newFolder',
        data: { path: previewContentPath },
      },
      { type: 'separator' },
      { type: 'cutEntries', data: { paths: [] } },
      { type: 'copyEntries', data: { paths: [] } },
      {
        type: 'pasteEntries',
        data: { path: previewContentPath },
      },
    ])
  }, [previewContentPath])

  const onClick = useCallback(() => {
    dispatch(blur())
    dispatch(unselectAll())
  }, [dispatch])

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Enter':
          if (!e.nativeEvent.isComposing && focused) {
            dispatch(startEditing({ path: focused }))
          }
          return
        case 'ArrowUp':
          e.preventDefault()
          return (e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)
            ? dispatch(focusTo('first', columns, e.shiftKey))
            : dispatch(focusByVertical(-1, columns, e.shiftKey))
        case 'ArrowDown':
          e.preventDefault()
          return (e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)
            ? dispatch(focusTo('last', columns, e.shiftKey))
            : dispatch(focusByVertical(1, columns, e.shiftKey))
        case 'ArrowLeft':
          e.preventDefault()
          return dispatch(focusByHorizontal(-1, columns, e.shiftKey))
        case 'ArrowRight':
          return dispatch(focusByHorizontal(1, columns, e.shiftKey))
        case 'Shift':
          e.preventDefault()
          if (focused) {
            dispatch(setAnchor({ anchor: focused }))
          }
          return
      }
    },
    [columns, dispatch, focused],
  )

  // biome-ignore lint/correctness/useExhaustiveDependencies: false positive
  useEffect(() => virtualizer.measure(), [virtualizer, size])

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
    if (!loading) {
      virtualizer.scrollToOffset(0)
    }
  }, [loading, virtualizer])

  useEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }
    const handleResize = throttle((entries: ResizeObserverEntry[]) => {
      const entry = entries[0]
      if (entry) {
        setWrapperWidth(entry.contentRect.width)
      }
    }, 100)
    const observer = new ResizeObserver(handleResize)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: false positive
  useEffect(() => {
    dispatch(load())
  }, [dispatch, previewContentPath])

  useEffect(() => {
    if (!previewContentPath) {
      return
    }
    const key = 'preview-list'
    watch(
      key,
      [previewContentPath],
      async (eventType, directoryPath, filePath) =>
        dispatch(handle(eventType, directoryPath, filePath)),
    )
    return () => unwatch(key)
  }, [dispatch, previewContentPath, unwatch, watch])
  return (
    <>
      <Box
        className="preview-list"
        onClick={onClick}
        onContextMenu={onContextMenu}
        onKeyDown={onKeyDown}
        ref={ref}
        sx={{
          height: '100%',
          outline: 'none',
          overflowX: 'hidden',
          overflowY: 'scroll',
          display: chunks.length === 0 ? 'none' : 'block',
        }}
        tabIndex={0}
      >
        {wrapperWidth > 0 && (
          <Box
            sx={{
              height: `${virtualizer.getTotalSize()}px`,
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const columns = chunks[virtualRow.index] as Content[]
              return (
                <Stack
                  direction="row"
                  key={virtualRow.index}
                  sx={{
                    height: `${virtualRow.size}px`,
                    position: 'absolute',
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {columns.map((content) => (
                    <Box
                      key={content.path}
                      sx={{ p: 0.0625, width: virtualRow.size }}
                    >
                      <PreviewDirectoryItem content={content} />
                    </Box>
                  ))}
                </Stack>
              )
            })}
          </Box>
        )}
      </Box>
      {chunks.length === 0 && <PreviewEmptyState message={noDataText} />}
    </>
  )
}

export default PreviewDirectory
