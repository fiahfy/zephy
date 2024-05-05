import { TableRow } from '@mui/material'
import clsx from 'clsx'
import useExplorerItem from '~/hooks/useExplorerItem'
import { Content } from '~/interfaces'

type Props = {
  children: React.ReactNode
  content: Content
  tabIndex: number
}

const ExplorerTableRow = (props: Props) => {
  const { children, content, tabIndex } = props

  const { focused, onClick, onContextMenu, onDoubleClick, selected } =
    useExplorerItem(tabIndex, content)

  return (
    <TableRow
      className={clsx({ focused })}
      component="div"
      hover
      onClick={onClick}
      onContextMenu={onContextMenu}
      onDoubleClick={onDoubleClick}
      selected={selected}
      sx={{
        borderRadius: (theme) => theme.spacing(0.5),
        cursor: 'pointer',
        display: 'flex',
      }}
    >
      {children}
    </TableRow>
  )
}

export default ExplorerTableRow
