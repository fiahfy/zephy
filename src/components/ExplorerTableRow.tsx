import { TableRow } from '@mui/material'
import clsx from 'clsx'
import { useRef } from 'react'
import useExplorerItem from '~/hooks/useExplorerItem'
import type { Content } from '~/interfaces'

type Props = {
  children: React.ReactNode
  content: Content
  tabId: number
}

const ExplorerTableRow = (props: Props) => {
  const { children, content, tabId } = props

  const ref = useRef<HTMLDivElement>(null)

  const {
    focused,
    onClick,
    onContextMenu,
    onDoubleClick,
    onKeyDown,
    selected,
  } = useExplorerItem(tabId, content, ref)

  return (
    <TableRow
      className={clsx({ focused })}
      component="div"
      hover
      onClick={onClick}
      onContextMenu={onContextMenu}
      onDoubleClick={onDoubleClick}
      onKeyDown={onKeyDown}
      ref={ref}
      selected={selected}
      sx={{
        borderRadius: (theme) => theme.spacing(0.5),
        cursor: 'pointer',
        display: 'flex',
      }}
      tabIndex={0}
    >
      {children}
    </TableRow>
  )
}

export default ExplorerTableRow
