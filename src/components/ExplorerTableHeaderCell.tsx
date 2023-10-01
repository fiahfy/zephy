import { TableCell, TableSortLabel, Typography } from '@mui/material'
import { MouseEvent, useCallback } from 'react'
import { Content } from '~/interfaces'
import { useAppDispatch, useAppSelector } from '~/store'
import { selectCurrentSortOption, sort } from '~/store/window'

type Key = keyof Content

type Props = {
  dataKey: Key
  height: number
  label: string
  width?: number
}

const ExplorerTableHeaderCell = (props: Props) => {
  const { height, dataKey, label, width } = props

  const currentSortOption = useAppSelector(selectCurrentSortOption)
  const dispatch = useAppDispatch()

  const handleClick = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation()
      dispatch(sort(dataKey))
    },
    [dataKey, dispatch],
  )

  return (
    <TableCell
      component="div"
      sortDirection={
        currentSortOption.orderBy === dataKey ? currentSortOption.order : false
      }
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
        active={currentSortOption.orderBy === dataKey}
        direction={
          currentSortOption.orderBy === dataKey
            ? currentSortOption.order
            : 'asc'
        }
        onClick={handleClick}
        sx={{ flexGrow: 1 }}
      >
        <Typography noWrap variant="caption">
          {label}
        </Typography>
      </TableSortLabel>
    </TableCell>
  )
}

export default ExplorerTableHeaderCell
