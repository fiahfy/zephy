import { Box, LinearProgress } from '@mui/material'
import {
  KeyboardEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { AutoSizer, Grid, GridCellProps } from 'react-virtualized'

import ExplorerGridItem from 'components/ExplorerGridItem'
import usePrevious from 'hooks/usePrevious'
import { Content } from 'interfaces'

const rowHeight = 256

type Props = {
  contentFocused: (content: Content) => boolean
  contentSelected: (content: Content) => boolean
  contents: Content[]
  focused: string | undefined
  loading: boolean
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
    onClickContent,
    onContextMenuContent,
    onDoubleClickContent,
    onKeyDownArrow,
    onKeyDownEnter,
    onScroll,
    scrollTop,
  } = props

  const previousLoading = usePrevious(loading)

  const ref = useRef<HTMLElement>(null)
  const [wrapperWidth, setWrapperWidth] = useState(0)

  useEffect(() => {
    const el = ref.current?.querySelector('.ReactVirtualized__Grid')
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
    const el = ref.current?.querySelector('.ReactVirtualized__Grid')
    if (!el) {
      return
    }
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [onScroll])

  useEffect(() => {
    const el = ref.current?.querySelector('.ReactVirtualized__Grid')
    if (!el) {
      return
    }
    if (previousLoading && !loading) {
      el.scrollTop = scrollTop
    }
  }, [loading, previousLoading, scrollTop])

  useEffect(() => {
    const el = ref.current?.querySelector('.ReactVirtualized__Grid')
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
    () => Math.ceil(wrapperWidth / rowHeight) || 1,
    [wrapperWidth],
  )

  const chunks = useMemo(
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
        chunks[row - 1]?.[column - 1] ?? (focused ? undefined : chunks[0]?.[0])
      if (content) {
        onKeyDownArrow(e, content)
      }
    },
    [chunks, onKeyDownArrow],
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const el = ref.current?.querySelector('.focused')
      const row = Number(el?.getAttribute('data-grid-row'))
      const column = Number(el?.getAttribute('data-grid-column'))
      switch (e.key) {
        case 'Enter':
          if (!e.nativeEvent.isComposing) {
            onKeyDownEnter(e)
          }
          return
        case 'ArrowUp':
          return focus(e, row - 1, column, !!el)
        case 'ArrowDown':
          return focus(e, row + 1, column, !!el)
        case 'ArrowLeft':
          return focus(e, row, column - 1, !!el)
        case 'ArrowRight':
          return focus(e, row, column + 1, !!el)
      }
    },
    [focus, onKeyDownEnter],
  )

  const cellRenderer = useCallback(
    ({ columnIndex, key, rowIndex, style }: GridCellProps) => {
      const content = chunks[rowIndex]?.[columnIndex]
      return (
        content && (
          <Box key={key} style={style} sx={{ p: 0.0625 }}>
            <ExplorerGridItem
              columnIndex={columnIndex}
              content={content}
              focused={contentFocused(content)}
              onClick={(e) => onClickContent(e, content)}
              onContextMenu={(e) => onContextMenuContent(e, content)}
              onDoubleClick={(e) => onDoubleClickContent(e, content)}
              rowIndex={rowIndex}
              selected={contentSelected(content)}
            />
          </Box>
        )
      )
    },
    [
      chunks,
      contentFocused,
      contentSelected,
      onClickContent,
      onContextMenuContent,
      onDoubleClickContent,
    ],
  )

  return (
    <Box
      onKeyDown={handleKeyDown}
      ref={ref}
      sx={{
        height: '100%',
        '.ReactVirtualized__Grid:focus-visible .focused': {
          outline: '-webkit-focus-ring-color auto 1px',
        },
      }}
    >
      <AutoSizer>
        {({ height, width }) => (
          <Grid
            cellRenderer={cellRenderer}
            columnCount={columns}
            columnWidth={wrapperWidth / columns}
            height={height}
            rowCount={chunks.length}
            rowHeight={rowHeight}
            style={{
              outline: 'none',
              overflowY: 'scroll',
            }}
            width={width}
          />
        )}
      </AutoSizer>
      {loading && <LinearProgress />}
    </Box>
  )
}

export default ExplorerGrid
