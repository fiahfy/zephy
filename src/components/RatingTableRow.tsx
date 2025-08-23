import { TableRow } from '@mui/material'
import { type ReactNode, useMemo } from 'react'
import useButtonBehavior from '~/hooks/useButtonBehavior'
import { useAppDispatch } from '~/store'
import { goToRatings } from '~/store/window'
import { createContextMenuHandler } from '~/utils/context-menu'
import { buildZephyUrl } from '~/utils/url'

type Props = {
  children: ReactNode
  score: number
}

const RatingTableRow = (props: Props) => {
  const { children, score, ...others } = props

  const dispatch = useAppDispatch()

  const buttonHandlers = useButtonBehavior(() => dispatch(goToRatings(score)))

  const handleContextMenu = useMemo(() => {
    const path = buildZephyUrl({ pathname: 'ratings', params: { score } })
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
    ])
  }, [score])

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
      })}
      {...buttonHandlers}
    >
      {children}
    </TableRow>
  )
}

export default RatingTableRow
