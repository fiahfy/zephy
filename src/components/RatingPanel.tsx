import { Rating, Table, TableBody, TableCell } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import Panel from '~/components/Panel'
import RatingTableRow from '~/components/RatingTableRow'
import { useAppSelector } from '~/store'
import { selectScoreToPathsMap } from '~/store/rating'

const RatingPanel = () => {
  const scoreToPathsMap = useAppSelector(selectScoreToPathsMap)

  const [items, setItems] = useState<{ count: number; score: number }[]>([])

  const load = useCallback(async () => {
    let items = await Promise.all(
      Object.keys(scoreToPathsMap).map(async (score) => {
        const paths = scoreToPathsMap[Number(score)] ?? []
        const items = await window.electronAPI.getEntriesForPaths(paths)
        return {
          score: Number(score),
          count: items.length,
        }
      }),
    )
    items = items
      .filter((item) => item.count > 0)
      .toSorted((a, b) => b.score - a.score)
    setItems(items)
  }, [scoreToPathsMap])

  useEffect(() => {
    load()
  }, [load])

  return (
    <>
      {items.length > 0 && (
        <Panel title="Ratings">
          <Table size="small" sx={{ display: 'flex' }}>
            <TableBody sx={{ width: '100%' }}>
              {items.map((item) => (
                <RatingTableRow key={item.score} score={item.score}>
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
                  </TableCell>
                </RatingTableRow>
              ))}
            </TableBody>
          </Table>
        </Panel>
      )}
    </>
  )
}

export default RatingPanel
