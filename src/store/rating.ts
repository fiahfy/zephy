import {
  type PayloadAction,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit'
import type { AppState } from '~/store'

type Rating = {
  path: string
  score: number
}

type State = {
  ratings: Rating[]
}

const initialState: State = { ratings: [] }

export const ratingSlice = createSlice({
  name: 'rating',
  initialState,
  reducers: {
    replaceState(_state, action: PayloadAction<{ state: State }>) {
      return action.payload.state
    },
    rate(state, action: PayloadAction<{ path: string; score: number }>) {
      const { path, score } = action.payload
      const ratings = [
        ...state.ratings.filter((rating) => rating.path !== path),
        ...(score === 0 ? [] : [{ path, score }]),
      ]
      return { ...state, ratings }
    },
    removeRating(state, action: PayloadAction<{ path: string }>) {
      const { path } = action.payload
      const ratings = state.ratings.filter((rating) => rating.path !== path)
      return { ...state, ratings }
    },
    changeRatingPath(
      state,
      action: PayloadAction<{ oldPath: string; newPath: string }>,
    ) {
      const { oldPath, newPath } = action.payload
      const ratings = state.ratings.map((rating) =>
        rating.path === oldPath ? { ...rating, path: newPath } : rating,
      )
      return { ...state, ratings }
    },
  },
})

export const { replaceState, rate, changeRatingPath, removeRating } =
  ratingSlice.actions

export default ratingSlice.reducer

export const selectRating = (state: AppState) => state.rating

export const selectRatings = (rating: State) => rating.ratings

export const selectPathToScoreMap = createSelector(selectRatings, (ratings) =>
  ratings.reduce(
    (acc, rating) => {
      acc[rating.path] = rating.score
      return acc
    },
    {} as { [path: string]: number },
  ),
)

export const selectScoreByPath = createSelector(
  selectPathToScoreMap,
  (_rating: State, path: string) => path,
  (pathToScoreMap, path) => pathToScoreMap[path] ?? 0,
)

export const selectScoreToPathsMap = createSelector(selectRating, (rating) =>
  rating.ratings.reduce(
    (acc, rating) => {
      const paths = acc[rating.score] ?? []
      acc[rating.score] = [...paths, rating.path]
      return acc
    },
    {} as { [score: number]: string[] },
  ),
)
