import { Box, LinearProgress, Typography } from '@mui/material'
import { useVirtualizer } from '@tanstack/react-virtual'
import {
  KeyboardEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
} from 'react'

import ExplorerTableCell from '~/components/ExplorerTableCell'
import ExplorerTableHeaderCell from '~/components/ExplorerTableHeaderCell'
import ExplorerTableRow from '~/components/ExplorerTableRow'
import usePrevious from '~/hooks/usePrevious'
import { Content } from '~/interfaces'

const headerHeight = 32
const rowHeight = 20

type Key = keyof Content
type Order = 'asc' | 'desc'

type ColumnType = {
  align: 'left' | 'right'
  key: Key
  label: string
  width?: number
}

const columns: ColumnType[] = [
  {
    align: 'left',
    key: 'name',
    label: 'Name',
  },
  {
    align: 'left',
    key: 'rating',
    label: 'Rating',
    width: 110,
  },
  {
    align: 'right',
    key: 'size',
    label: 'Size',
    width: 90,
  },
  {
    align: 'left',
    key: 'dateModified',
    label: 'Date Modified',
    width: 130,
  },
]

type Props = {
  contentFocused: (content: Content) => boolean
  contentSelected: (content: Content) => boolean
  contents: Content[]
  focused: string | undefined
  loading: boolean
  noDataText: string
  onChangeOrderBy: (orderBy: Key) => void
  onClickContent: (e: MouseEvent, content: Content) => void
  onContextMenuContent: (e: MouseEvent, content: Content) => void
  onDoubleClickContent: (e: MouseEvent, content: Content) => void
  onKeyDownArrow: (e: KeyboardEvent, content: Content) => void
  onKeyDownEnter: (e: KeyboardEvent) => void
  onScrollEnd: (scrollTop: number) => void
  scrollTop: number
  sortOption: { order: Order; orderBy: Key }
}

const ExplorerTable = (props: Props) => {
  const {
    contentFocused,
    contentSelected,
    contents,
    focused,
    loading,
    noDataText,
    onChangeOrderBy,
    onClickContent,
    onContextMenuContent,
    onDoubleClickContent,
    onKeyDownArrow,
    onKeyDownEnter,
    onScrollEnd,
    scrollTop,
    sortOption,
  } = props

  const previousLoading = usePrevious(loading)

  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: contents.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 20,
  })

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
        virtualizer.scrollToIndex(index)
      }
    }
  }, [contents, focused, loading, virtualizer])

  const focusBy = useCallback(
    (e: KeyboardEvent, offset: number) => {
      const index = contents.findIndex((content) => content.path === focused)
      const content = index >= 0 ? contents[index + offset] : contents[0]
      if (content) {
        onKeyDownArrow(e, content)
      }
    },
    [contents, focused, onKeyDownArrow],
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
            : focusBy(e, -1)
        case 'ArrowDown':
          return (e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)
            ? focusTo(e, 'last')
            : focusBy(e, 1)
      }
    },
    [focusBy, focusTo, onKeyDownEnter],
  )

  return (
    <Box
      onKeyDown={handleKeyDown}
      sx={{
        display: 'flex',
        flexDirection: 'column',
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
      <Box sx={{ display: 'flex', pr: '10px' }}>
        {columns.map((column) => (
          <ExplorerTableHeaderCell
            dataKey={column.key}
            height={headerHeight}
            key={column.key}
            label={column.label}
            onChangeOrderBy={onChangeOrderBy}
            sortOption={sortOption}
            width={column.width}
          />
        ))}
      </Box>
      <Box
        ref={parentRef}
        sx={{
          flexGrow: 1,
          overflowX: 'hidden',
          overflowY: 'scroll',
        }}
      >
        <Box sx={{ height: `${virtualizer.getTotalSize()}px` }}>
          {virtualizer.getVirtualItems().map((virtualRow, index) => {
            const content = contents[virtualRow.index] as Content
            return (
              <Box
                key={content.path}
                sx={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${
                    virtualRow.start - index * virtualRow.size
                  }px)`,
                }}
              >
                <ExplorerTableRow
                  aria-rowindex={virtualRow.index + 1}
                  focused={contentFocused(content)}
                  onClick={(e) => onClickContent(e, content)}
                  onContextMenu={(e) => onContextMenuContent(e, content)}
                  onDoubleClick={(e) => onDoubleClickContent(e, content)}
                  selected={contentSelected(content)}
                >
                  {columns.map((column) => (
                    <ExplorerTableCell
                      align={column.align}
                      content={content}
                      dataKey={column.key}
                      height={rowHeight}
                      key={column.key}
                      width={column.width}
                    />
                  ))}
                </ExplorerTableRow>
              </Box>
            )
          })}
        </Box>
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
          sx={{ position: 'absolute', left: 0, right: 0, top: 0, zIndex: 1 }}
        />
      )}
    </Box>
  )
}

export default ExplorerTable
