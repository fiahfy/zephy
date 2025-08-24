import { useCallback, useEffect, useState } from 'react'
import Panel from '~/components/Panel'
import RatingTable from '~/components/RatingTable'
import { useAppSelector } from '~/store'
import { selectScoreToPathsMap } from '~/store/rating'

const RatingPanel = () => {
  const scoreToPathsMap = useAppSelector(selectScoreToPathsMap)

  const [ratings, setRatings] = useState<{ count: number; score: number }[]>([])

  const load = useCallback(async () => {
    const ratings = (
      await Promise.all(
        Object.keys(scoreToPathsMap).map(async (score) => {
          const paths = scoreToPathsMap[Number(score)] ?? []
          const items = await window.electronAPI.getEntriesForPaths(paths)
          return {
            score: Number(score),
            count: items.length,
          }
        }),
      )
    )
      .filter((item) => item.count > 0)
      .toSorted((a, b) => b.score - a.score)
    setRatings(ratings)
  }, [scoreToPathsMap])

  useEffect(() => {
    load()
  }, [load])

  return (
    <>
      {ratings.length > 0 && (
        <Panel title="Ratings">
          <RatingTable ratings={ratings} />
        </Panel>
      )}
    </>
  )
}

export default RatingPanel
