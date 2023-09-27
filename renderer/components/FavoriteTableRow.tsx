import { TableRow } from '@mui/material'
import { FocusEvent, ReactNode, useCallback } from 'react'
import Outline from '~/components/Outline'
import useDnd from '~/hooks/useDnd'
import useEntryItem from '~/hooks/useEntryItem'
import { Entry } from '~/interfaces'
import { useAppDispatch } from '~/store'
import { changeDirectory } from '~/store/window'

type Props = {
  children: ReactNode
  entry: Entry
  onBlur: (e: FocusEvent) => void
  onFocus: (e: FocusEvent) => void
  selected: boolean
}

const FavoriteTableRow = (props: Props) => {
  const { children, entry, ...others } = props

  const dispatch = useAppDispatch()

  const { onContextMenu } = useEntryItem(entry)
  const { createDroppableBinder, dropping } = useDnd()

  const handleClick = useCallback(
    () => dispatch(changeDirectory(entry.path)),
    [dispatch, entry.path],
  )

  return (
    <TableRow
      {...others}
      component="div"
      hover
      onClick={handleClick}
      onContextMenu={onContextMenu}
      sx={{
        cursor: 'pointer',
        display: 'flex',
        position: 'relative',
        width: '100%',
        '&:focus-visible': {
          outline: '-webkit-focus-ring-color auto 1px',
        },
      }}
      tabIndex={0}
      {...createDroppableBinder(entry)}
    >
      {children}
      {dropping && <Outline />}
    </TableRow>
  )
}

export default FavoriteTableRow
