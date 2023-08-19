import { TableCell, TableSortLabel, Typography } from '@mui/material'
import { ReactNode, useCallback } from 'react'

import { Content } from 'interfaces'

type Key = keyof Content
type Order = 'asc' | 'desc'

type Props = {
  dataKey: Key
  height: number
  label: ReactNode
  onChangeOrderBy: (orderBy: Key) => void
  sortOption: { order: Order; orderBy: Key }
}

const ExplorerTableHeaderCell = (props: Props) => {
  const { height, dataKey, label, onChangeOrderBy, sortOption } = props

  const handleClick = useCallback(
    () => onChangeOrderBy(dataKey),
    [dataKey, onChangeOrderBy],
  )

  return (
    <TableCell
      component="div"
      sortDirection={sortOption.orderBy === dataKey ? sortOption.order : false}
      sx={{
        alignItems: 'center',
        borderBottom: 'none',
        display: 'flex',
        height,
        px: 1,
        py: 0,
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
