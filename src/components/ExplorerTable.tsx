import { Box, Table } from '@mui/material'
import { useMemo, useRef } from 'react'
import ExplorerEmptyState from '~/components/ExplorerEmptyState'
import ExplorerLoadingProgress from '~/components/ExplorerLoadingProgress'
import ExplorerTableCell from '~/components/ExplorerTableCell'
import ExplorerTableHeaderCell from '~/components/ExplorerTableHeaderCell'
import ExplorerTableRow from '~/components/ExplorerTableRow'
import useExplorerList from '~/hooks/useExplorerList'
import type { Content } from '~/interfaces'
import { useAppSelector } from '~/store'
import {
  selectDateCreatedColumnVisible,
  selectDateLastOpenedColumnVisible,
  selectDateModifiedColumnVisible,
  selectRatingColumnVisible,
  selectSizeColumnVisible,
} from '~/store/preferences'
import { createContextMenuHandler } from '~/utils/contextMenu'

const headerHeight = 32
const rowHeight = 20

type Key = keyof Content

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
    key: 'score',
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
    key: 'dateCreated',
    label: 'Date Created',
    width: 130,
  },
  {
    align: 'left',
    key: 'dateModified',
    label: 'Date Modified',
    width: 130,
  },
  {
    align: 'left',
    key: 'dateLastOpened',
    label: 'Date Last Opened',
    width: 130,
  },
]

type Props = {
  tabId: number
}

const ExplorerTable = (props: Props) => {
  const { tabId } = props

  const dateCreatedColumnVisible = useAppSelector(
    selectDateCreatedColumnVisible,
  )
  const dateLastOpenedColumnVisible = useAppSelector(
    selectDateLastOpenedColumnVisible,
  )
  const dateModifiedColumnVisible = useAppSelector(
    selectDateModifiedColumnVisible,
  )
  const ratingColumnVisible = useAppSelector(selectRatingColumnVisible)
  const sizeColumnVisible = useAppSelector(selectSizeColumnVisible)

  const ref = useRef<HTMLDivElement>(null)

  const {
    chunks,
    loading,
    noDataText,
    onClick,
    onContextMenu,
    onKeyDown,
    restoring,
    virtualizer,
  } = useExplorerList(tabId, 1, rowHeight, false, ref)

  const filteredColumns = useMemo(
    () =>
      columns.filter((column) => {
        switch (column.key) {
          case 'dateCreated':
            return dateCreatedColumnVisible
          case 'dateModified':
            return dateModifiedColumnVisible
          case 'dateLastOpened':
            return dateLastOpenedColumnVisible
          case 'score':
            return ratingColumnVisible
          case 'size':
            return sizeColumnVisible
          default:
            return true
        }
      }),
    [
      dateCreatedColumnVisible,
      dateLastOpenedColumnVisible,
      dateModifiedColumnVisible,
      sizeColumnVisible,
      ratingColumnVisible,
    ],
  )

  const handleContextMenu = useMemo(
    () =>
      createContextMenuHandler([
        {
          type: 'toggleDateCreatedColumn',
          data: { checked: dateCreatedColumnVisible },
        },
        {
          type: 'toggleDateModifiedColumn',
          data: { checked: dateModifiedColumnVisible },
        },
        {
          type: 'toggleDateLastOpenedColumn',
          data: { checked: dateLastOpenedColumnVisible },
        },
        {
          type: 'toggleSizeColumn',
          data: { checked: sizeColumnVisible },
        },
        {
          type: 'toggleRatingColumn',
          data: { checked: ratingColumnVisible },
        },
      ]),
    [
      dateCreatedColumnVisible,
      dateLastOpenedColumnVisible,
      dateModifiedColumnVisible,
      sizeColumnVisible,
      ratingColumnVisible,
    ],
  )

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
      }}
    >
      {chunks.length > 0 && (
        <Box
          onContextMenu={handleContextMenu}
          sx={{
            display: 'flex',
            flexShrink: 0,
            overflowX: 'hidden',
            pr: '10px',
          }}
        >
          {filteredColumns.map((column) => (
            <ExplorerTableHeaderCell
              dataKey={column.key}
              height={headerHeight}
              key={column.key}
              label={column.label}
              tabId={tabId}
              width={column.width}
            />
          ))}
        </Box>
      )}
      <Box
        className="explorer-list"
        onClick={onClick}
        onContextMenu={onContextMenu}
        onKeyDown={onKeyDown}
        ref={ref}
        sx={{
          flexGrow: 1,
          outline: 'none',
          overflowX: 'hidden',
          overflowY: 'scroll',
          visibility: restoring ? 'hidden' : undefined,
        }}
        tabIndex={0}
      >
        <Table
          component="div"
          sx={{
            display: 'block',
            height: `${virtualizer.getTotalSize()}px`,
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow, index) => {
            const content = chunks[virtualRow.index][0] as Content
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
                <ExplorerTableRow content={content} tabId={tabId}>
                  {filteredColumns.map((column) => (
                    <ExplorerTableCell
                      align={column.align}
                      content={content}
                      dataKey={column.key}
                      height={rowHeight}
                      key={column.key}
                      tabId={tabId}
                      width={column.width}
                    />
                  ))}
                </ExplorerTableRow>
              </Box>
            )
          })}
        </Table>
      </Box>
      {chunks.length === 0 && <ExplorerEmptyState message={noDataText} />}
      {loading && <ExplorerLoadingProgress />}
    </Box>
  )
}

export default ExplorerTable
