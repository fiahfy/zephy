import { TableRow } from '@mui/material'
import { type ReactNode, useCallback } from 'react'
import useDroppable from '~/hooks/useDroppable'
import useEntryItem from '~/hooks/useEntryItem'
import type { Entry } from '~/interfaces'
import { useAppDispatch } from '~/store'
import { changeDirectory } from '~/store/window'

type Props = {
  children: ReactNode
  entry: Entry
}

const FavoriteTableRow = (props: Props) => {
  const { children, entry, ...others } = props

  const dispatch = useAppDispatch()

  const { onContextMenu } = useEntryItem(entry)
  const { droppableStyle, ...dropHandlers } = useDroppable(
    entry.type === 'directory' ? entry.path : undefined,
  )

  const handleClick = useCallback(
    () => dispatch(changeDirectory(entry.path)),
    [dispatch, entry.path],
  )

  return (
    <TableRow
      {...others}
      hover
      onClick={handleClick}
      onContextMenu={onContextMenu}
      sx={{
        borderRadius: (theme) => theme.spacing(0.5),
        cursor: 'pointer',
        display: 'flex',
        width: '100%',
        ...droppableStyle,
      }}
      tabIndex={0}
      {...dropHandlers}
    >
      {children}
    </TableRow>
  )
}

export default FavoriteTableRow
