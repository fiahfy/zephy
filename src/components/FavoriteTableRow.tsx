import { TableRow } from '@mui/material'
import { type ReactNode, useMemo } from 'react'
import useButtonBehavior from '~/hooks/useButtonBehavior'
import useDroppable from '~/hooks/useDroppable'
import { useAppDispatch } from '~/store'
import { changeUrl, newTab } from '~/store/window'
import { createContextMenuHandler } from '~/utils/context-menu'

type Props = {
  children: ReactNode
  path: string
}

const FavoriteTableRow = (props: Props) => {
  const { children, path } = props

  const dispatch = useAppDispatch()

  const url = useMemo(() => window.electronAPI.pathToFileURL(path), [path])

  const buttonHandlers = useButtonBehavior((e) => {
    if (!url) {
      return
    }
    if (e && ((e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey))) {
      dispatch(newTab(url))
    } else {
      dispatch(changeUrl(url))
    }
  })

  const { droppableStyle, ...dropHandlers } = useDroppable(path)

  const handleContextMenu = useMemo(() => {
    return createContextMenuHandler([
      {
        type: 'open',
        data: { url },
      },
      {
        type: 'openInNewWindow',
        data: { url },
      },
      {
        type: 'openInNewTab',
        data: { url },
      },
      { type: 'separator' },
      {
        type: 'toggleFavorite',
        data: { path, favorite: true },
      },
    ])
  }, [path, url])

  return (
    <TableRow
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
