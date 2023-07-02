import { Box, LinearProgress } from '@mui/material'
import {
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
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
  contentSelected: (content: Content) => boolean
  contents: Content[]
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
    contentSelected,
    contents,
    loading,
    onClickContent,
    onContextMenuContent,
    onDoubleClickContent,
    onKeyDownArrow,
    onKeyDownEnter,
    onScroll,
    scrollTop,
  } = props

  const ref = useRef<HTMLElement>(null)
  const [wrapperWidth, setWrapperWidth] = useState(0)
  const previousLoading = usePrevious(loading)

  useEffect(() => {
    const el = ref.current?.querySelector('.ReactVirtualized__Grid')
    if (!el) {
      return
    }
    el.addEventListener('scroll', onScroll)
    const handleResize = (entries: ResizeObserverEntry[]) => {
      const entry = entries[0]
      if (entry) {
        setWrapperWidth(entry.contentRect.width)
      }
    }
    const observer = new ResizeObserver(handleResize)
    observer.observe(el)
    return () => {
      el.removeEventListener('scroll', onScroll)
      observer.disconnect()
    }
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

  const columns = useMemo(
    () => Math.ceil(wrapperWidth / rowHeight) || 1,
    [wrapperWidth]
  )

  const chunks = useMemo(
    () =>
      contents.reduce(
        (carry, _, i) =>
          i % columns ? carry : [...carry, contents.slice(i, i + columns)],
        [] as Content[][]
      ),
    [columns, contents]
  )

  const focus = (e: KeyboardEvent, row: number, column: number) => {
    const content = chunks[row - 1]?.[column - 1]
    if (content) {
      onKeyDownArrow(e, content)
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    const row = Number(document.activeElement?.getAttribute('data-grid-row'))
    const column = Number(
      document.activeElement?.getAttribute('data-grid-column')
    )
    switch (e.key) {
      case 'Enter':
        if (!e.nativeEvent.isComposing) {
          onKeyDownEnter(e)
        }
        return
      case 'ArrowUp':
        return focus(e, row - 1, column)
      case 'ArrowDown':
        return focus(e, row + 1, column)
      case 'ArrowLeft':
        return focus(e, row, column - 1)
      case 'ArrowRight':
        return focus(e, row, column + 1)
    }
  }

  const cellRenderer = ({
    columnIndex,
    key,
    rowIndex,
    style,
  }: GridCellProps) => {
    const content = chunks[rowIndex]?.[columnIndex]
    return (
      content && (
        <Box key={key} style={style} sx={{ p: 0.0625 }}>
          <ExplorerGridItem
            columnIndex={columnIndex}
            content={content}
            onClick={(e) => onClickContent(e, content)}
            onContextMenu={(e) => onContextMenuContent(e, content)}
            onDoubleClick={(e) => onDoubleClickContent(e, content)}
            rowIndex={rowIndex}
            selected={contentSelected(content)}
          />
        </Box>
      )
    )
  }

  return (
    <Box onKeyDown={handleKeyDown} ref={ref} sx={{ height: '100%' }}>
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
              overflowY: 'scroll',
            }}
            tabIndex={null}
            width={width}
          />
        )}
      </AutoSizer>
      {loading && <LinearProgress />}
    </Box>
  )
}

export default ExplorerGrid
