import { TableRow } from '@mui/material'
import clsx from 'clsx'
import type { ReactNode } from 'react'
import useDraggable from '~/hooks/useDraggable'
import useDroppable from '~/hooks/useDroppable'
import useExplorerItem from '~/hooks/useExplorerItem'
import type { Content } from '~/interfaces'

type Props = {
  children: ReactNode
  content: Content
  tabId: number
}

const ExplorerTableRow = (props: Props) => {
  const { children, content, tabId } = props

  const {
    draggingPaths,
    focused,
    onClick,
    onContextMenu,
    onDoubleClick,
    onMouseDown,
    selected,
  } = useExplorerItem(tabId, content)

  const { draggable, ...dragHandlers } = useDraggable(draggingPaths)
  const { droppableStyle, ...dropHandlers } = useDroppable(
    content.type === 'directory' ? content.path : undefined,
  )

  return (
    <TableRow
      className={clsx({ 'Mui-focused': focused })}
      component="div"
      draggable={draggable}
      hover
      onClick={onClick}
      onContextMenu={onContextMenu}
      onDoubleClick={onDoubleClick}
      onMouseDown={onMouseDown}
      selected={selected}
      sx={(theme) => ({
        borderRadius: theme.spacing(0.5),
        cursor: 'pointer',
        display: 'flex',
        '.explorer-list:focus-within &.Mui-focused': {
          outline: `${theme.palette.primary.main} solid 1px`,
          outlineOffset: '-1px',
        },
        ...droppableStyle,
      })}
      {...dragHandlers}
      {...dropHandlers}
    >
      {children}
    </TableRow>
  )
}

export default ExplorerTableRow
