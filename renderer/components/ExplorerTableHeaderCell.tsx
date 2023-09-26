import { TableCell, TableSortLabel, Typography } from '@mui/material'
import { ReactNode, useCallback } from 'react'
import { Content } from '~/interfaces'

type Key = keyof Content
type Order = 'asc' | 'desc'

type Props = {
  dataKey: Key
  height: number
  label: ReactNode
  onChangeOrderBy: (orderBy: Key) => void
  sortOption: { order: Order; orderBy: Key }
  width?: number
}

const ExplorerTableHeaderCell = (props: Props) => {
  const { height, dataKey, label, onChangeOrderBy, sortOption, width } = props

  const handleClick = useCallback(
    () => onChangeOrderBy(dataKey),
    [dataKey, onChangeOrderBy],
  )

  return (
    <TableCell
      component="div"
      sortDirection={sortOption.orderBy === dataKey ? sortOption.order : false}
      sx={{
        borderBottom: 'none',
        display: 'flex',
        flexGrow: width ? 0 : 1,
        flexShrink: width ? 0 : 1,
        height,
        minWidth: 0,
        px: 1,
        py: 0,
        width,
      }}
      variant="head"
    >
      <TableSortLabel
        active={sortOption.orderBy === dataKey}
        direction={sortOption.orderBy === dataKey ? sortOption.order : 'asc'}
        onClick={handleClick}
      >
        <Typography noWrap variant="caption">
          {label}
        </Typography>
      </TableSortLabel>
    </TableCell>
  )
}

export default ExplorerTableHeaderCell
