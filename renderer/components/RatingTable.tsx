import {
  Rating,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material'
import { useCallback, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '~/store'
import { selectPathsByScore } from '~/store/rating'
import { goToRatings } from '~/store/window'

const RatingTable = () => {
  const pathsByScore = useAppSelector(selectPathsByScore)
  const dispatch = useAppDispatch()

  const [selected, setSelected] = useState<number[]>([])

  const items = useMemo(() => {
    return Object.keys(pathsByScore)
      .map((score) => ({
        score: Number(score),
        count: pathsByScore[Number(score)]?.length ?? 0,
      }))
      .sort((a, b) => b.score - a.score)
  }, [pathsByScore])

  const handleBlur = useCallback(() => setSelected([]), [])

  const handleClick = useCallback(
    (score: number) => dispatch(goToRatings(score)),
    [dispatch],
  )

  const handleFocus = useCallback((score: number) => setSelected([score]), [])

  return (
    <Table size="small" sx={{ display: 'flex', userSelect: 'none' }}>
      <TableBody sx={{ width: '100%' }}>
        {items.map((item) => (
          <TableRow
            hover
            key={item.score}
            onBlur={() => handleBlur()}
            onClick={() => handleClick(item.score)}
            onFocus={() => handleFocus(item.score)}
            selected={selected.includes(item.score)}
            sx={{
              cursor: 'pointer',
              display: 'flex',
              width: '100%',
              '&:focus-visible': {
                outline: '-webkit-focus-ring-color auto 1px',
              },
            }}
            tabIndex={0}
            title={''}
          >
            <TableCell
              sx={{
                alignItems: 'center',
                borderBottom: 'none',
                display: 'flex',
                height: 20,
                gap: 1,
                px: 1,
                py: 0,
                width: '100%',
              }}
            >
              <Rating
                precision={0.5}
                readOnly
                size="small"
                value={item.score}
              />
              <Typography noWrap variant="caption">
                ({item.count})
              </Typography>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default RatingTable
