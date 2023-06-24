import { Box, LinearProgress } from '@mui/material'
import {
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
  onClickContent: (e: MouseEvent<HTMLDivElement>, content: Content) => void
  onDoubleClickContent: (content: Content) => void
  onFocusContent: (content: Content) => void
  onKeyDownEnter: (e: KeyboardEvent<HTMLDivElement>) => void
  onScroll: (e: Event) => void
  scrollTop: number
}

const ExplorerGrid = (props: Props) => {
  const {
    contentSelected,
    contents,
    loading,
    onClickContent,
    onDoubleClickContent,
    onFocusContent,
    onKeyDownEnter,
    onScroll,
    scrollTop,
  } = props

  const ref = useRef<HTMLDivElement>(null)
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

  const size = useMemo(
    () => Math.ceil(wrapperWidth / rowHeight) || 1,
    [wrapperWidth]
  )

  const chunks = useMemo(
    () =>
      contents.reduce(
        (carry, _, i) =>
          i % size ? carry : [...carry, contents.slice(i, i + size)],
        [] as Content[][]
      ),
    [contents, size]
  )

  const focus = (row: number, column: number) => {
    const el = ref.current?.querySelector<HTMLDivElement>(
      `[data-grid-row="${row}"][data-grid-column="${column}"]`
    )
    const content = chunks[row - 1]?.[column - 1]
    if (el && content) {
      el.focus()
      onFocusContent(content)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
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
        return focus(row - 1, column)
      case 'ArrowDown':
        return focus(row + 1, column)
      case 'ArrowLeft':
        return focus(row, column - 1)
      case 'ArrowRight':
        return focus(row, column + 1)
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
            onDoubleClick={() => onDoubleClickContent(content)}
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
            columnCount={size}
            columnWidth={wrapperWidth / size}
            height={height}
            rowCount={chunks.length}
            rowHeight={rowHeight}
            style={{
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
