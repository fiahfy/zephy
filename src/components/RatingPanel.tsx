import { Rating, Table, TableBody, TableCell } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import Panel from '~/components/Panel'
import RatingTableRow from '~/components/RatingTableRow'
import useWatcher from '~/hooks/useWatcher'
import { useAppSelector } from '~/store'
import { selectScoreToPathsMap } from '~/store/rating'

const RatingPanel = () => {
  const scoreToPathsMap = useAppSelector(selectScoreToPathsMap)

  const { watch } = useWatcher()

  const [items, setItems] = useState<{ score: number }[]>([])

  const load = useCallback(async () => {
    const items = Object.keys(scoreToPathsMap)
      .map((score) => ({ score: Number(score) }))
      .sort((a, b) => b.score - a.score)
    setItems(items)
  }, [scoreToPathsMap])

  useEffect(() => {
    load()
  }, [load])

  useEffect(
    () =>
      watch('rating', [], async (_eventType, _directoryPath, filePath) => {
        const paths = Object.values(scoreToPathsMap).flat()
        if (paths.includes(filePath)) {
          load()
        }
      }),
    [load, scoreToPathsMap, watch],
  )

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
