import { TableRow } from '@mui/material'
import { FocusEvent, ReactNode, useCallback } from 'react'
import { useAppDispatch } from '~/store'
import { goToRatings } from '~/store/window'

type Props = {
  children: ReactNode
  onBlur: (e: FocusEvent) => void
  onFocus: (e: FocusEvent) => void
  score: number
  selected: boolean
}

const RatingTableRow = (props: Props) => {
  const { children, score, ...others } = props

  const dispatch = useAppDispatch()

  const handleClick = useCallback(
    () => dispatch(goToRatings(score)),
    [dispatch, score],
  )

  return (
    <TableRow
      {...others}
      hover
      onClick={handleClick}
      sx={{
        cursor: 'pointer',
        display: 'flex',
        width: '100%',
        '&:focus-visible': {
          outline: '-webkit-focus-ring-color auto 1px',
        },
      }}
      tabIndex={0}
    >
      {children}
    </TableRow>
  )
}

export default RatingTableRow
