import { Box, LinearProgress } from '@mui/material'
import { alpha } from '@mui/material/styles'
import clsx from 'clsx'
import {
  KeyboardEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
} from 'react'
import {
  AutoSizer,
  Column,
  RowMouseEventHandlerParams,
  Table,
  TableCellProps,
  TableHeaderProps,
  TableRowProps,
} from 'react-virtualized'

import ExplorerTableCell from 'components/ExplorerTableCell'
import ExplorerTableHeaderCell from 'components/ExplorerTableHeaderCell'
import usePrevious from 'hooks/usePrevious'
import { Content } from 'interfaces'

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
  onChangeSortOption: (sortOption: { order: Order; orderBy: Key }) => void
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
    onChangeSortOption,
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

  const ref = useRef<HTMLElement>(null)

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

  const getWidths = useCallback((wrapperWidth: number) => {
    const widths = columns.map((column) => column.width)
    const flexibleNum = widths.filter((width) => width === undefined).length
    if (flexibleNum === 0) {
      return widths
    }
    const sumWidth = widths.reduce<number>(
      (acc, width) => acc + (width ?? 0),
      0,
    )
    // 10px is custom scrollbar width
    const flexibleWidth = (wrapperWidth - sumWidth - 10) / flexibleNum
    return widths.map((width) => (width === undefined ? flexibleWidth : width))
  }, [])

  const focus = (e: KeyboardEvent, row: number, focused: boolean) => {
    const content = contents[row - 1] ?? (focused ? undefined : contents[0])
    if (content) {
      onKeyDownArrow(e, content)
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    const el = ref.current?.querySelector('.focused')
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
  }

  const handleRowClick = (info: RowMouseEventHandlerParams) =>
    onClickContent(info.event, info.rowData)

  const handleRowDoubleClick = (info: RowMouseEventHandlerParams) =>
    onDoubleClickContent(info.event, info.rowData)

  const handleRowRightClick = (info: RowMouseEventHandlerParams) =>
    onContextMenuContent(info.event, info.rowData)

  const headerRenderer = ({ dataKey, label }: TableHeaderProps) => (
    <ExplorerTableHeaderCell
      dataKey={dataKey as Key}
      height={headerHeight}
      label={label}
      onChangeSortOption={onChangeSortOption}
      sortOption={sortOption}
    />
  )

  // @see https://github.com/bvaughn/react-virtualized/blob/master/source/Table/defaultRowRenderer.js
  const rowRenderer = ({
    className,
    columns,
    index,
    key,
    onRowClick,
    onRowDoubleClick,
    onRowMouseOut,
    onRowMouseOver,
    onRowRightClick,
    rowData,
    style,
  }: TableRowProps) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const a11yProps: any = { 'aria-rowindex': index + 1 }

    if (
      onRowClick ||
      onRowDoubleClick ||
      onRowMouseOut ||
      onRowMouseOver ||
      onRowRightClick
    ) {
      a11yProps['aria-label'] = 'row'
      // a11yProps.tabIndex = 0

      if (onRowClick) {
        a11yProps.onClick = (event: MouseEvent) =>
          onRowClick({ event, index, rowData })
      }
      if (onRowDoubleClick) {
        a11yProps.onDoubleClick = (event: MouseEvent) =>
          onRowDoubleClick({ event, index, rowData })
      }
      if (onRowMouseOut) {
        a11yProps.onMouseOut = (event: MouseEvent) =>
          onRowMouseOut({ event, index, rowData })
      }
      if (onRowMouseOver) {
        a11yProps.onMouseOver = (event: MouseEvent) =>
          onRowMouseOver({ event, index, rowData })
      }
      if (onRowRightClick) {
        a11yProps.onContextMenu = (event: MouseEvent) =>
          onRowRightClick({ event, index, rowData })
      }
    }

    return (
      <div
        {...a11yProps}
        className={className}
        key={key}
        role="row"
        style={style}
      >
        {columns}
      </div>
    )
  }

  const cellRenderer = ({ dataKey, rowData }: TableCellProps) => {
    const align = columns.find((column) => column.key === dataKey)?.align
    return (
      <ExplorerTableCell
        align={align}
        content={rowData}
        dataKey={dataKey as Key}
        height={rowHeight}
      />
    )
  }

  return (
    <Box
      onKeyDown={handleKeyDown}
      ref={ref}
      sx={{
        height: '100%',
        '.ReactVirtualized__Table__headerRow': {
          display: 'flex',
          '.ReactVirtualized__Table__headerColumn': {
            overflow: 'hidden',
          },
        },
        '.ReactVirtualized__Grid': {
          outline: 'none',
          '&:focus-visible': {
            '.ReactVirtualized__Table__row.focused': {
              outline: '-webkit-focus-ring-color auto 1px',
            },
          },
          '.ReactVirtualized__Table__row': {
            cursor: 'pointer',
            display: 'flex',
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
          },
        },
      }}
    >
      <AutoSizer>
        {({ height, width }) => {
          const widths = getWidths(width)
          return (
            <Table
              gridStyle={{ overflowY: 'scroll' }}
              headerHeight={headerHeight}
              height={height}
              onRowClick={handleRowClick}
              onRowDoubleClick={handleRowDoubleClick}
              onRowRightClick={handleRowRightClick}
              rowClassName={({ index }) => {
                // @see https://github.com/bvaughn/react-virtualized/issues/1357
                const content = contents[index]
                return content
                  ? clsx({
                      focused: contentFocused(content),
                      selected: contentSelected(content),
                    })
                  : ''
              }}
              rowCount={contents.length}
              rowGetter={({ index }) => contents[index]}
              rowHeight={rowHeight}
              rowRenderer={rowRenderer}
              width={width}
            >
              {columns.map(({ key, label }, index) => (
                <Column
                  cellRenderer={cellRenderer}
                  dataKey={key}
                  headerRenderer={headerRenderer}
                  key={key}
                  label={label}
                  width={widths[index] ?? 0}
                />
              ))}
            </Table>
          )
        }}
      </AutoSizer>
      {loading && <LinearProgress />}
    </Box>
  )
}

export default ExplorerTable
