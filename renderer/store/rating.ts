import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit'

import { AppState } from 'store'

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

export const selectGetRating = createSelector(
  selectRatings,
  (ratings) => (path: string) => ratings[path] ?? 0,
)
