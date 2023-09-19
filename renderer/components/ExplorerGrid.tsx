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
  onScroll: (e: Event) => void
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
    onScroll,
    scrollTop,
  } = props

  const previousLoading = usePrevious(loading)

  const parentRef = useRef<HTMLDivElement>(null)

  const [wrapperWidth, setWrapperWidth] = useState(0)

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
  }, [onScroll])

  useEffect(() => {
    const el = parentRef.current
    if (!el) {
      return
    }
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [onScroll])

  useEffect(() => {
    const el = parentRef.current
    if (!el) {
      return
    }
    if (previousLoading && !loading) {
      el.scrollTop = scrollTop
    }
  }, [loading, previousLoading, scrollTop])

  useEffect(() => {
    const el = parentRef.current
    if (!el) {
      return
    }
    const focusedEl = el.querySelector('.focused')
    if (!focusedEl) {
      return
    }
    focusedEl.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [focused])

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

  const focus = useCallback(
    (e: KeyboardEvent, row: number, column: number, focused: boolean) => {
      const content =
        rows[row - 1]?.[column - 1] ?? (focused ? undefined : rows[0]?.[0])
      if (content) {
        onKeyDownArrow(e, content)
      }
    },
    [onKeyDownArrow, rows],
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const el = parentRef.current?.querySelector('.focused')
      const row = Number(el?.getAttribute('aria-rowindex'))
      const col = Number(el?.getAttribute('aria-colindex'))
      switch (e.key) {
        case 'Enter':
          if (!e.nativeEvent.isComposing) {
            onKeyDownEnter(e)
          }
          return
        case 'ArrowUp':
          return focus(e, row - 1, col, !!el)
        case 'ArrowDown':
          return focus(e, row + 1, col, !!el)
        case 'ArrowLeft':
          return focus(e, row, col - 1, !!el)
        case 'ArrowRight':
          return focus(e, row, col + 1, !!el)
      }
    },
    [focus, onKeyDownEnter],
  )

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => size,
    overscan: 20,
  })

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
                      <Box key={columnIndex} sx={{ p: 0.0625, width: size }}>
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
