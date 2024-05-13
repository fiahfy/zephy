import { SyntheticEvent, useCallback, useMemo } from 'react'
import NoOutlineRating from '~/components/mui/NoOutlineRating'
import { useAppDispatch } from '~/store'
import { rate } from '~/store/rating'

type Props = {
  path: string
  score: number
}

const Rating = (props: Props) => {
  const { path, score } = props

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
