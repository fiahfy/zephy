import { TableRow } from '@mui/material'
import { type ReactNode, useMemo } from 'react'
import useButtonBehavior from '~/hooks/useButtonBehavior'
import useDroppable from '~/hooks/useDroppable'
import { useAppDispatch } from '~/store'
import { changeDirectory } from '~/store/window'
import { createContextMenuHandler } from '~/utils/context-menu'

type Props = {
  children: ReactNode
  path: string
}

const FavoriteTableRow = (props: Props) => {
  const { children, path, ...others } = props

  const dispatch = useAppDispatch()

  const buttonHandlers = useButtonBehavior(() =>
    dispatch(changeDirectory(path)),
  )

  const { droppableStyle, ...dropHandlers } = useDroppable(path)

  const handleContextMenu = useMemo(() => {
    return createContextMenuHandler([
      {
        type: 'open',
        data: { path },
      },
      {
        type: 'openInNewWindow',
        data: { path },
      },
      {
        type: 'openInNewTab',
        data: { path },
      },
      { type: 'separator' },
      {
        type: 'toggleFavorite',
        data: { path, favorite: true },
      },
    ])
  }, [path])

  return (
    <TableRow
      {...others}
      hover
      onContextMenu={handleContextMenu}
      sx={(theme) => ({
        borderRadius: theme.spacing(0.5),
        cursor: 'pointer',
        display: 'flex',
        width: '100%',
        '&:focus': {
          outline: `${theme.palette.primary.main} solid 1px`,
          outlineOffset: '-1px',
        },
        ...droppableStyle,
      })}
      {...dropHandlers}
      {...buttonHandlers}
    >
      {children}
    </TableRow>
  )
}

export default FavoriteTableRow
