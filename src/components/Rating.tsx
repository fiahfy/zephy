import { Rating as MuiRating } from '@mui/material'
import { SyntheticEvent, useCallback, useMemo } from 'react'
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
      <MuiRating
        onChange={handleChangeScore}
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        precision={0.5}
        size="small"
        sx={{
          '&.Mui-focusVisible': {
            '.MuiRating-iconActive': {
              outline: 'none',
            },
          },
          '.MuiRating-labelEmptyValueActive': {
            outline: 'none',
          },
        }}
        value={score}
      />
    ),
    [handleChangeScore, score],
  )

  return rating
}

export default Rating
