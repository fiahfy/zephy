import { SyntheticEvent, useCallback, useMemo } from 'react'
import NoOutlineRating from '~/components/mui/NoOutlineRating'
import { useAppDispatch, useAppSelector } from '~/store'
import { rate, selectRating, selectScoreByPath } from '~/store/rating'

type Props = {
  path: string
}

const Rating = (props: Props) => {
  const { path } = props

  const score = useAppSelector((state) =>
    selectScoreByPath(selectRating(state), path),
  )
  const dispatch = useAppDispatch()

  const handleChangeScore = useCallback(
    (_e: SyntheticEvent, value: number | null) =>
      dispatch(rate({ path: path, score: value ?? 0 })),
    [dispatch, path],
  )

  // Rating component rendering is slow, so avoid unnecessary rendering
  const rating = useMemo(
    () => (
      <NoOutlineRating
        onChange={handleChangeScore}
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
        precision={0.5}
        size="small"
        value={score}
      />
    ),
    [handleChangeScore, score],
  )

  return rating
}

export default Rating
