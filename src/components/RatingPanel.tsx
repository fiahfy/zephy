import { Rating, Table, TableBody, TableCell, Typography } from '@mui/material'
import { useCallback, useMemo, useState } from 'react'
import Panel from '~/components/Panel'
import RatingTableRow from '~/components/RatingTableRow'
import { useAppSelector } from '~/store'
import { selectPathsByScore } from '~/store/rating'

const RatingPanel = () => {
  const pathsByScore = useAppSelector(selectPathsByScore)

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

  const handleFocus = useCallback((score: number) => setSelected([score]), [])

  return (
    <Panel title="Ratings">
      <Table size="small" sx={{ display: 'flex' }}>
        <TableBody sx={{ width: '100%' }}>
          {items.map((item) => (
            <RatingTableRow
              key={item.score}
              onBlur={() => handleBlur()}
              onFocus={() => handleFocus(item.score)}
              score={item.score}
              selected={selected.includes(item.score)}
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
            </RatingTableRow>
          ))}
        </TableBody>
      </Table>
    </Panel>
  )
}

export default RatingPanel
