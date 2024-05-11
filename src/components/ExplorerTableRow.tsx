import { TableRow } from '@mui/material'
import clsx from 'clsx'
import { useRef } from 'react'
import useExplorerItem from '~/hooks/useExplorerItem'
import { Content } from '~/interfaces'

type Props = {
  children: React.ReactNode
  content: Content
  tabIndex: number
}

const ExplorerTableRow = (props: Props) => {
  const { children, content, tabIndex } = props

  const ref = useRef<HTMLDivElement>(null)

  const {
    focused,
    onClick,
    onContextMenu,
    onDoubleClick,
    onKeyDown,
    selected,
  } = useExplorerItem(tabIndex, content, ref)

  return (
    <TableRow
      className={clsx({ focused, outlined: true })}
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
