import { TableRow } from '@mui/material'
import clsx from 'clsx'
import useExplorerItem from '~/hooks/useExplorerItem'
import type { Content } from '~/interfaces'

type Props = {
  children: React.ReactNode
  content: Content
  tabId: number
}

const ExplorerTableRow = (props: Props) => {
  const { children, content, tabId } = props

  const { focused, onClick, onContextMenu, onDoubleClick, selected } =
    useExplorerItem(tabId, content)

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
        '.explorer-container:focus-within &.focused': {
          outline: (theme) => `${theme.palette.primary.main} solid 1px`,
          outlineOffset: '-1px',
        },
      }}
    >
      {children}
    </TableRow>
  )
}

export default ExplorerTableRow
