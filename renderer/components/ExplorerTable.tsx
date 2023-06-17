import {
  Box,
  LinearProgress,
  TableCell,
  TableSortLabel,
  Typography,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import {
  FocusEvent,
  KeyboardEvent,
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
} from 'react-virtualized'
import EntryIcon from 'components/EntryIcon'
import NoOutlineRating from 'components/enhanced/NoOutlineRating'
import { useContextMenu } from 'hooks/useContextMenu'
import usePrevious from 'hooks/usePrevious'
import { Content } from 'interfaces'
import { useAppDispatch, useAppSelector } from 'store'
import { rate, selectGetRating } from 'store/rating'
import { defaultOrders } from 'store/window'
import { formatDate, formatFileSize } from 'utils/entry'

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
  contentSelected: (content: Content) => boolean
  contents: Content[]
  loading: boolean
  onChangeSortOption: (sortOption: { order: Order; orderBy: Key }) => void
  onClickContent: (content: Content) => void
  onDoubleClickContent: (content: Content) => void
  onFocusContent: (content: Content) => void
  onKeyDownEnter: (e: KeyboardEvent<HTMLDivElement>) => void
  onScroll: (e: Event) => void
  scrollTop: number
  sortOption: { order: Order; orderBy: Key }
}

const ExplorerTable = (props: Props) => {
  const {
    contentSelected,
    contents,
    loading,
    onChangeSortOption,
    onClickContent,
    onDoubleClickContent,
    onFocusContent,
    onKeyDownEnter,
    onScroll,
    scrollTop,
    sortOption,
  } = props

  const getRating = useAppSelector(selectGetRating)
  const dispatch = useAppDispatch()

  const { openEntry } = useContextMenu()
  const previousLoading = usePrevious(loading)

  const ref = useRef<HTMLDivElement>(null)

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

  const getWidths = useCallback((wrapperWidth: number) => {
    const widths = columns.map((column) => column.width)
    const flexibleNum = widths.filter((width) => width === undefined).length
    if (flexibleNum === 0) {
      return widths
    }
    const sumWidth = widths.reduce<number>(
      (carry, width) => carry + (width ?? 0),
      0
    )
    // 10px is custom scrollbar width
    const flexibleWidth = (wrapperWidth - sumWidth - 10) / flexibleNum
    return widths.map((width) => (width === undefined ? flexibleWidth : width))
  }, [])

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const row = Number(document.activeElement?.getAttribute('aria-rowindex'))
    switch (e.key) {
      case 'Enter':
        if (!e.nativeEvent.isComposing) {
          onKeyDownEnter(e)
        }
        break
      case 'ArrowUp': {
        const el = ref.current?.querySelector<HTMLDivElement>(
          `[aria-rowindex="${row - 1}"]`
        )
        el && el.focus()
        break
      }
      case 'ArrowDown': {
        const el = ref.current?.querySelector<HTMLDivElement>(
          `[aria-rowindex="${row + 1}"]`
        )
        el && el.focus()
        break
      }
    }
  }

  const handleFocus = (e: FocusEvent<HTMLDivElement>) => {
    const index = Number(e.target.getAttribute('aria-rowindex')) - 1
    if (index < 0) {
      return
    }
    const content = contents[index]
    content && onFocusContent(content)
  }

  const handleRowClick = (info: RowMouseEventHandlerParams) =>
    onClickContent(info.rowData)

  const handleRowDoubleClick = (info: RowMouseEventHandlerParams) =>
    onDoubleClickContent(info.rowData)

  const headerRenderer = ({ dataKey, label }: TableHeaderProps) => {
    return (
      <TableCell
        component="div"
        sortDirection={
          sortOption.orderBy === dataKey ? sortOption.order : false
        }
        sx={{
          alignItems: 'center',
          borderBottom: 'none',
          display: 'flex',
          height: headerHeight,
          px: 1,
          py: 0,
        }}
        variant="head"
      >
        <TableSortLabel
          active={sortOption.orderBy === dataKey}
          direction={sortOption.orderBy === dataKey ? sortOption.order : 'asc'}
          onClick={() => {
            const defaultOrder =
              defaultOrders[dataKey as keyof typeof defaultOrders] ?? 'asc'
            const reverseSign =
              sortOption.orderBy === dataKey &&
              sortOption.order === defaultOrder
                ? -1
                : 1
            const defaultSign = defaultOrder === 'asc' ? 1 : -1
            onChangeSortOption({
              order: defaultSign * reverseSign === 1 ? 'asc' : 'desc',
              orderBy: dataKey as Key,
            })
          }}
        >
          <Typography noWrap variant="caption">
            {label}
          </Typography>
        </TableSortLabel>
      </TableCell>
    )
  }

  const cellRenderer = ({ dataKey, rowData }: TableCellProps) => {
    const align = columns.find((column) => column.key === dataKey)?.align
    return (
      <TableCell
        align={align}
        component="div"
        onContextMenu={openEntry(rowData.path, rowData.type === 'directory')}
        sx={{
          alignItems: 'center',
          borderBottom: 'none',
          display: 'flex',
          height: rowHeight,
          px: 1,
          py: 0,
        }}
      >
        <Box
          component="span"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {
            {
              name: (
                <Box sx={{ alignItems: 'center', display: 'flex' }}>
                  <Box sx={{ alignItems: 'center', display: 'flex', mr: 1 }}>
                    <EntryIcon entry={rowData} size="small" />
                  </Box>
                  <Typography noWrap title={rowData.name} variant="caption">
                    {rowData.name}
                  </Typography>
                </Box>
              ),
              rating: (
                <Box sx={{ display: 'flex' }}>
                  <NoOutlineRating
                    color="primary"
                    onChange={(_e, value) =>
                      dispatch(rate({ path: rowData.path, rating: value ?? 0 }))
                    }
                    precision={0.5}
                    size="small"
                    value={getRating(rowData.path)}
                  />
                </Box>
              ),
              size: (
                <Typography noWrap variant="caption">
                  {rowData.type === 'file' && formatFileSize(rowData.size)}
                </Typography>
              ),
              dateModified: (
                <Typography noWrap variant="caption">
                  {formatDate(rowData.dateModified)}
                </Typography>
              ),
            }[dataKey]
          }
        </Box>
      </TableCell>
    )
  }

  return (
    <Box
      onFocus={handleFocus}
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
                theme.palette.action.selectedOpacity
              ),
            '&:hover': {
              backgroundColor: (theme) =>
                alpha(
                  theme.palette.primary.main,
                  theme.palette.action.selectedOpacity +
                    theme.palette.action.hoverOpacity
                ),
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
              gridStyle={{
                overflowY: 'scroll',
              }}
              headerHeight={headerHeight}
              height={height}
              onRowClick={handleRowClick}
              onRowDoubleClick={handleRowDoubleClick}
              rowClassName={({ index }) => {
                // @see https://github.com/bvaughn/react-virtualized/issues/1357
                const content = contents[index]
                return content && contentSelected(content) ? 'selected' : ''
              }}
              rowCount={contents.length}
              rowGetter={({ index }) => contents[index]}
              rowHeight={rowHeight}
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
