import { Box, LinearProgress, Typography } from '@mui/material'
import { useVirtualizer } from '@tanstack/react-virtual'
import {
  KeyboardEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import ExplorerGridItem from 'components/ExplorerGridItem'
import usePrevious from 'hooks/usePrevious'
import { Content } from 'interfaces'

const maxItemSize = 256

type Props = {
  contentFocused: (content: Content) => boolean
  contentSelected: (content: Content) => boolean
  contents: Content[]
  focused: string | undefined
  loading: boolean
  noDataText: string
  onClickContent: (e: MouseEvent, content: Content) => void
  onContextMenuContent: (e: MouseEvent, content: Content) => void
  onDoubleClickContent: (e: MouseEvent, content: Content) => void
  onKeyDownArrow: (e: KeyboardEvent, content: Content) => void
  onKeyDownEnter: (e: KeyboardEvent) => void
  onScrollEnd: (scrollTop: number) => void
  scrollTop: number
}

const ExplorerGrid = (props: Props) => {
  const {
    contentFocused,
    contentSelected,
    contents,
    focused,
    loading,
    noDataText,
    onClickContent,
    onContextMenuContent,
    onDoubleClickContent,
    onKeyDownArrow,
    onKeyDownEnter,
    onScrollEnd,
    scrollTop,
  } = props

  const previousLoading = usePrevious(loading)

  const parentRef = useRef<HTMLDivElement>(null)

  const [wrapperWidth, setWrapperWidth] = useState(0)

  const columns = useMemo(
    () => Math.ceil(wrapperWidth / maxItemSize) || 1,
    [wrapperWidth],
  )

  const size = useMemo(() => wrapperWidth / columns, [columns, wrapperWidth])

  const rows = useMemo(
    () =>
      contents.reduce(
        (acc, _, i) =>
          i % columns ? acc : [...acc, contents.slice(i, i + columns)],
        [] as Content[][],
      ),
    [columns, contents],
  )

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => size,
    overscan: 5,
  })

  useEffect(() => {
    const el = parentRef.current
    if (!el) {
      return
    }
    const handleResize = (entries: ResizeObserverEntry[]) => {
      const entry = entries[0]
      if (entry) {
        setWrapperWidth(entry.contentRect.width)
      }
    }
    const observer = new ResizeObserver(handleResize)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const el = parentRef.current
    if (!el) {
      return
    }
    const handler = (e: Event) => {
      if (e.target instanceof HTMLElement) {
        onScrollEnd(e.target.scrollTop)
      }
    }
    el.addEventListener('scrollend', handler)
    return () => el.removeEventListener('scrollend', handler)
  }, [onScrollEnd])

  useEffect(() => {
    if (previousLoading && !loading) {
      virtualizer.scrollToOffset(scrollTop)
    }
  }, [loading, previousLoading, scrollTop, virtualizer])

  useEffect(() => {
    if (focused) {
      const index = contents.findIndex((content) => content.path === focused)
      if (index >= 0) {
        const rowIndex = Math.floor(index / columns)
        virtualizer.scrollToIndex(rowIndex)
      }
    }
  }, [columns, contents, focused, loading, virtualizer])

  const focusBy = useCallback(
    (e: KeyboardEvent, rowOffset: number, columnOffset: number) => {
      const index = contents.findIndex((content) => content.path === focused)
      const rowIndex = Math.floor(index / columns)
      const columnIndex = index % columns
      const content =
        index >= 0
          ? rows[rowIndex + rowOffset]?.[columnIndex + columnOffset]
          : rows[0]?.[0]
      if (content) {
        onKeyDownArrow(e, content)
      }
    },
    [columns, contents, focused, onKeyDownArrow, rows],
  )

  const focusTo = useCallback(
    (e: KeyboardEvent, position: 'first' | 'last') => {
      const content = contents[position === 'first' ? 0 : contents.length - 1]
      if (content) {
        onKeyDownArrow(e, content)
      }
    },
    [contents, onKeyDownArrow],
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Enter':
          if (!e.nativeEvent.isComposing) {
            onKeyDownEnter(e)
          }
          return
        case 'ArrowUp':
          return (e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)
            ? focusTo(e, 'first')
            : focusBy(e, -1, 0)
        case 'ArrowDown':
          return (e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)
            ? focusTo(e, 'last')
            : focusBy(e, 1, 0)
        case 'ArrowLeft':
          return focusBy(e, 0, -1)
        case 'ArrowRight':
          return focusBy(e, 0, 1)
      }
    },
    [focusBy, focusTo, onKeyDownEnter],
  )

  return (
    <Box
      onKeyDown={handleKeyDown}
      sx={{
        height: '100%',
        outline: 'none',
        position: 'relative',
        '&:focus-visible': {
          '.focused': {
            outline: '-webkit-focus-ring-color auto 1px',
          },
        },
      }}
      tabIndex={0}
    >
      <Box
        ref={parentRef}
        sx={{
          height: '100%',
          overflowX: 'hidden',
          overflowY: 'scroll',
        }}
      >
        {wrapperWidth > 0 && (
          <>
            <Box sx={{ height: `${virtualizer.getTotalSize()}px` }}>
              {virtualizer.getVirtualItems().map((virtualRow, rowIndex) => {
                const columns = rows[virtualRow.index] as Content[]
                return (
                  <Box
                    key={virtualRow.index}
                    sx={{
                      display: 'flex',
                      height: size,
                      transform: `translateY(${
                        virtualRow.start - rowIndex * virtualRow.size
                      }px)`,
                    }}
                  >
                    {columns.map((content, columnIndex) => (
                      <Box key={content.path} sx={{ p: 0.0625, width: size }}>
                        <ExplorerGridItem
                          aria-colindex={columnIndex + 1}
                          aria-rowindex={virtualRow.index + 1}
                          content={content}
                          focused={contentFocused(content)}
                          onClick={(e) => onClickContent(e, content)}
                          onContextMenu={(e) =>
                            onContextMenuContent(e, content)
                          }
                          onDoubleClick={(e) =>
                            onDoubleClickContent(e, content)
                          }
                          selected={contentSelected(content)}
                        />
                      </Box>
                    ))}
                  </Box>
                )
              })}
            </Box>
            {contents.length === 0 && (
              <Box
                sx={{
                  alignItems: 'center',
                  display: 'flex',
                  height: '100%',
                  inset: 0,
                  justifyContent: 'center',
                  position: 'absolute',
                }}
              >
                <Typography variant="caption">{noDataText}</Typography>
              </Box>
            )}
            {loading && (
              <LinearProgress
                sx={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  zIndex: 1,
                }}
              />
            )}
          </>
        )}
      </Box>
    </Box>
  )
}

export default ExplorerGrid
