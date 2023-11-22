import { Rating, Table, TableBody, TableCell, Typography } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import Panel from '~/components/Panel'
import RatingTableRow from '~/components/RatingTableRow'
import { useAppSelector } from '~/store'
import { selectPathsByScore } from '~/store/rating'

const RatingPanel = () => {
  const pathsByScore = useAppSelector(selectPathsByScore)

  const [selected, setSelected] = useState<number[]>([])
  const [ratings, setRatings] = useState<{ count: number; score: number }[]>([])

  useEffect(() => {
    ;(async () => {
      let ratings = await Promise.all(
        Object.keys(pathsByScore).map(async (score) => {
          const paths = pathsByScore[Number(score)] ?? []
          const entries =
            await window.electronAPI.getDetailedEntriesForPaths(paths)
          return {
            score: Number(score),
            count: entries.length,
          }
        }),
      )
      ratings = ratings.sort((a, b) => b.score - a.score)
      setRatings(ratings)
    })()
  }, [pathsByScore])

  const handleBlur = useCallback(() => setSelected([]), [])

  const handleFocus = useCallback((score: number) => setSelected([score]), [])

  return (
    <Panel title="Ratings">
      <Table size="small" sx={{ display: 'flex' }}>
        <TableBody sx={{ width: '100%' }}>
          {ratings.map((rating) => (
            <RatingTableRow
              key={rating.score}
              onBlur={() => handleBlur()}
              onFocus={() => handleFocus(rating.score)}
              score={rating.score}
              selected={selected.includes(rating.score)}
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
                  value={rating.score}
                />
                <Typography noWrap variant="caption">
                  ({rating.count})
                </Typography>
              </TableCell>
            </RatingTableRow>
          ))}
        </TableBody>
      </Table>
    </Panel>
  )
}

export default RatingPanel
