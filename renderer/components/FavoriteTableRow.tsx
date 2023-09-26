import { TableRow } from '@mui/material'
import { FocusEvent, MouseEvent, ReactNode } from 'react'
import Outline from '~/components/Outline'
import useDnd from '~/hooks/useDnd'
import { Entry } from '~/interfaces'

type Props = {
  children: ReactNode
  entry: Entry
  onBlur: (e: FocusEvent) => void
  onClick: (e: MouseEvent) => void
  onContextMenu: (e: MouseEvent) => void
  onFocus: (e: FocusEvent) => void
  selected: boolean
}

const FavoriteTableRow = (props: Props) => {
  const { children, entry, ...others } = props

  const { createDroppableBinder, dropping } = useDnd()

  return (
    <TableRow
      {...others}
      component="div"
      hover
      key={entry.path}
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
      title={entry.name}
      {...createDroppableBinder(entry)}
    >
      {children}
      {dropping && <Outline />}
    </TableRow>
  )
}

export default FavoriteTableRow
