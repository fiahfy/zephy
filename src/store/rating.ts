import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit'
import { AppState } from '~/store'

type State = {
  ratings: { [path: string]: number }
}

const initialState: State = { ratings: {} }

export const ratingSlice = createSlice({
  name: 'rating',
  initialState,
  reducers: {
    rate(state, action: PayloadAction<{ path: string; rating: number }>) {
      const { path, rating } = action.payload
      const ratings = {
        ...state.ratings,
        [path]: rating,
      }
      return { ...state, ratings }
    },
    replace(_state, action: PayloadAction<State>) {
      return action.payload
    },
  },
})

export const { rate, replace } = ratingSlice.actions

export default ratingSlice.reducer

export const selectRating = (state: AppState) => state.rating

export const selectRatings = createSelector(
  selectRating,
  (rating) => rating.ratings,
)

export const selectGetScore = createSelector(
  selectRatings,
  (ratings) => (path: string) => ratings[path] ?? 0,
)

export const selectPathsByScore = createSelector(selectRatings, (ratings) =>
  Object.keys(ratings).reduce(
    (acc, path) => {
      const score = ratings[path]
      if (score) {
        const paths = acc[score] ?? []
        return {
          ...acc,
          [score]: [...paths, path],
        }
      }
      return acc
    },
    {} as { [score: number]: string[] },
  ),
)