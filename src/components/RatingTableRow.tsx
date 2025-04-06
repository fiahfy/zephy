import { TableRow } from '@mui/material'
import { type ReactNode, useCallback, useMemo } from 'react'
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

  const handleClick = useCallback(
    () => dispatch(goToRatings(score)),
    [dispatch, score],
  )

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
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      sx={{
        borderRadius: (theme) => theme.spacing(0.5),
        cursor: 'pointer',
        display: 'flex',
        width: '100%',
      }}
      tabIndex={0}
    >
      {children}
    </TableRow>
  )
}

export default RatingTableRow
