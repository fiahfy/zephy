import { Box, LinearProgress, Table, Typography } from '@mui/material'
import { useRef } from 'react'
import ExplorerTableCell from '~/components/ExplorerTableCell'
import ExplorerTableHeaderCell from '~/components/ExplorerTableHeaderCell'
import ExplorerTableRow from '~/components/ExplorerTableRow'
import useExplorerList from '~/hooks/useExplorerList'
import type { Content } from '~/interfaces'

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
  // {
  //   align: 'left',
  //   key: 'dateCreated',
  //   label: 'Date Created',
  //   width: 130,
  // },
  {
    align: 'left',
    key: 'dateModified',
    label: 'Date Modified',
    width: 130,
  },
  // {
  //   align: 'left',
  //   key: 'dateLastOpened',
  //   label: 'Date Last Opened',
  //   width: 130,
  // },
]

type Props = {
  tabId: number
}

const ExplorerTable = (props: Props) => {
  const { tabId } = props

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
  } = useExplorerList(tabId, 1, rowHeight, ref)

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexShrink: 0,
          overflowX: 'hidden',
          pr: '10px',
        }}
      >
        {columns.map((column) => (
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
          sx={{ display: 'block', height: `${virtualizer.getTotalSize()}px` }}
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
                  {columns.map((column) => (
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
      {chunks.length === 0 && (
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
          sx={{ inset: '0 0 auto', position: 'absolute', zIndex: 1 }}
        />
      )}
    </Box>
  )
}

export default ExplorerTable
