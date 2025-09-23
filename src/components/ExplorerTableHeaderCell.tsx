import { KeyboardArrowDown as KeyboardArrowDownIcon } from '@mui/icons-material'
import { TableCell, TableSortLabel, Typography } from '@mui/material'
import { type MouseEvent, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '~/store'
import {
  selectSortOptionByTabIdAndUrl,
  selectUrlByTabId,
  sort,
} from '~/store/window'

type Props = {
  dataKey:
    | 'dateCreated'
    | 'dateLastOpened'
    | 'dateModified'
    | 'name'
    | 'score'
    | 'size'
  height: number
  label: string
  tabId: number
  width?: number
}

const ExplorerTableHeaderCell = (props: Props) => {
  const { height, dataKey, label, tabId, width } = props

  const url = useAppSelector((state) => selectUrlByTabId(state, tabId))
  const sortOption = useAppSelector((state) =>
    selectSortOptionByTabIdAndUrl(state, tabId, url),
  )
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
      sortDirection={sortOption.orderBy === dataKey ? sortOption.order : false}
      sx={{
        borderBottom: 'none',
        display: 'flex',
        flexGrow: width ? 0 : 1,
        flexShrink: width ? 0 : 1,
        height,
        minWidth: width ? 0 : 100,
        px: 1,
        py: 0,
        width,
      }}
      variant="head"
    >
      <TableSortLabel
        IconComponent={KeyboardArrowDownIcon}
        active={sortOption.orderBy === dataKey}
        direction={sortOption.orderBy === dataKey ? sortOption.order : 'asc'}
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
