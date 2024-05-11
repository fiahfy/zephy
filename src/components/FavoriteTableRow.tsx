import { TableRow } from '@mui/material'
import { ReactNode, useCallback } from 'react'
import useDropEntry from '~/hooks/useDropEntry'
import useEntryItem from '~/hooks/useEntryItem'
import { Entry } from '~/interfaces'
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
  const { droppableStyle, ...dropHandlers } = useDropEntry(entry)

  const handleClick = useCallback(
    () => dispatch(changeDirectory(entry.path)),
    [dispatch, entry.path],
  )

  return (
    <TableRow
      {...others}
      className="outlined"
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
