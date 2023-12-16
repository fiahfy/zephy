import { Rating, Table, TableBody, TableCell, Typography } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import Panel from '~/components/Panel'
import RatingTableRow from '~/components/RatingTableRow'
import useWatcher from '~/hooks/useWatcher'
import { useAppSelector } from '~/store'
import { selectPathsByScore } from '~/store/rating'

const RatingPanel = () => {
  const pathsByScore = useAppSelector(selectPathsByScore)

  const { watch } = useWatcher()

  const [selected, setSelected] = useState<number[]>([])
  const [items, setItems] = useState<{ count: number; score: number }[]>([])

  const load = useCallback(async () => {
    let items = await Promise.all(
      Object.keys(pathsByScore).map(async (score) => {
        const paths = pathsByScore[Number(score)] ?? []
        const items = await window.electronAPI.getDetailedEntriesForPaths(paths)
        return {
          score: Number(score),
          count: items.length,
        }
      }),
    )
    items = items
      .filter((item) => item.count > 0)
      .sort((a, b) => b.score - a.score)
    setItems(items)
  }, [pathsByScore])

  useEffect(() => {
    load()
  }, [load])

  useEffect(
    () =>
      watch('rating', [], async (_eventType, _directoryPath, filePath) => {
        const paths = Object.values(pathsByScore).flatMap((paths) => paths)
        if (paths.includes(filePath)) {
          load()
        }
      }),
    [load, pathsByScore, watch],
  )

  const handleBlur = useCallback(() => setSelected([]), [])

  const handleFocus = useCallback((score: number) => setSelected([score]), [])

  return (
    <>
      {items.length > 0 && (
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
      )}
    </>
  )
}

export default RatingPanel
