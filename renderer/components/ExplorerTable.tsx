import { Box, LinearProgress, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import clsx from 'clsx'
import {
  KeyboardEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
} from 'react'

import ExplorerTableCell from 'components/ExplorerTableCell'
import ExplorerTableHeaderCell from 'components/ExplorerTableHeaderCell'
import usePrevious from 'hooks/usePrevious'
import { Content } from 'interfaces'
import { useVirtualizer } from '@tanstack/react-virtual'

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
  onScroll: (e: Event) => void
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
    onScroll,
    scrollTop,
    sortOption,
  } = props

  const previousLoading = usePrevious(loading)

  const parentRef = useRef<HTMLDivElement>(null)

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

  const focus = useCallback(
    (e: KeyboardEvent, row: number, focused: boolean) => {
      const content = contents[row - 1] ?? (focused ? undefined : contents[0])
      if (content) {
        onKeyDownArrow(e, content)
      }
    },
    [contents, onKeyDownArrow],
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      console.log(1)
      const el = parentRef.current?.querySelector('.focused')
      const row = Number(el?.getAttribute('aria-rowindex'))
      switch (e.key) {
        case 'Enter':
          if (!e.nativeEvent.isComposing) {
            onKeyDownEnter(e)
          }
          return
        case 'ArrowUp':
          return focus(e, row - 1, !!el)
        case 'ArrowDown':
          return focus(e, row + 1, !!el)
      }
    },
    [focus, onKeyDownEnter],
  )

  const virtualizer = useVirtualizer({
    count: contents.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 20,
  })

  return (
    <Box
      onKeyDown={handleKeyDown}
      ref={parentRef}
      sx={{
        height: '100%',
        outline: 'none',
        overflowY: 'scroll',
        '&:focus-visible': {
          '.focused': {
            outline: '-webkit-focus-ring-color auto 1px',
          },
        },
      }}
      tabIndex={0}
    >
      <Box sx={{ height: `${virtualizer.getTotalSize()}px` }}>
        <Box
          sx={{
            background: (theme) => theme.palette.background.default,
            display: 'flex',
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}
        >
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
        {virtualizer.getVirtualItems().map((virtualRow, index) => {
          const content = contents[virtualRow.index] as Content
          return (
            <Box
              aria-rowindex={virtualRow.index + 1}
              className={clsx({
                focused: contentFocused(content),
                selected: contentSelected(content),
              })}
              component="div"
              key={content.path}
              onClick={(e) => onClickContent(e, content)}
              onContextMenu={(e) => onContextMenuContent(e, content)}
              onDoubleClick={(e) => onDoubleClickContent(e, content)}
              sx={{
                cursor: 'pointer',
                display: 'flex',
                height: `${virtualRow.size}px`,
                transform: `translateY(${
                  virtualRow.start - index * virtualRow.size
                }px)`,
                '&:hover': {
                  backgroundColor: (theme) => theme.palette.action.hover,
                },
                '&.selected': {
                  backgroundColor: (theme) =>
                    alpha(
                      theme.palette.primary.main,
                      theme.palette.action.selectedOpacity,
                    ),
                  '&:hover': {
                    backgroundColor: (theme) =>
                      alpha(
                        theme.palette.primary.main,
                        theme.palette.action.selectedOpacity +
                          theme.palette.action.hoverOpacity,
                      ),
                  },
                },
              }}
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
            justifyContent: 'center',
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
