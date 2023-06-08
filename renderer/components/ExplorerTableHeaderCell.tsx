import { TableCell, TableSortLabel, Typography } from '@mui/material'
import { ReactNode } from 'react'

import { Content } from 'interfaces'
import { defaultOrders } from 'store/window'

type Key = keyof Content
type Order = 'asc' | 'desc'

type Props = {
  dataKey: Key
  height: number
  label: ReactNode
  onChangeSortOption: (sortOption: { order: Order; orderBy: Key }) => void
  sortOption: { order: Order; orderBy: Key }
}

const ExplorerTableHeaderCell = (props: Props) => {
  const { height, dataKey, label, onChangeSortOption, sortOption } = props

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
        onClick={() => {
          const defaultOrder =
            defaultOrders[dataKey as keyof typeof defaultOrders] ?? 'asc'
          const reverseSign =
            sortOption.orderBy === dataKey && sortOption.order === defaultOrder
              ? -1
              : 1
          const defaultSign = defaultOrder === 'asc' ? 1 : -1
          onChangeSortOption({
            order: defaultSign * reverseSign === 1 ? 'asc' : 'desc',
            orderBy: dataKey,
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

export default ExplorerTableHeaderCell
