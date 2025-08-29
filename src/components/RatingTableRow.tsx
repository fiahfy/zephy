import { TableRow } from '@mui/material'
import { type ReactNode, useMemo } from 'react'
import useButtonBehavior from '~/hooks/useButtonBehavior'
import { useAppDispatch } from '~/store'
import { changeUrl, newTab } from '~/store/window'
import { createContextMenuHandler } from '~/utils/context-menu'
import { buildZephyUrl } from '~/utils/url'

type Props = {
  children: ReactNode
  score: number
}

const RatingTableRow = (props: Props) => {
  const { children, score } = props

  const dispatch = useAppDispatch()

  const url = useMemo(
    () => buildZephyUrl({ pathname: 'ratings', params: { score } }),
    [score],
  )

  const buttonHandlers = useButtonBehavior((e) => {
    if (e && ((e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey))) {
      dispatch(newTab(url))
    } else {
      dispatch(changeUrl(url))
    }
  })

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
    ])
  }, [url])

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
      })}
      {...buttonHandlers}
    >
      {children}
    </TableRow>
  )
}

export default RatingTableRow
