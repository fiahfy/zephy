import {
  type PayloadAction,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit'
import type { AppState } from '~/store'

type State = {
  histories: string[]
}

const initialState: State = { histories: [] }

export const querySlice = createSlice({
  name: 'query',
  initialState,
  reducers: {
    replaceState(_state, action: PayloadAction<{ state: State }>) {
      return action.payload.state
    },
    addQuery(state, action: PayloadAction<{ query: string }>) {
      const { query } = action.payload
      if (!query) {
        return state
      }
      const histories = [
        ...state.histories.filter((history) => history !== query),
        query,
      ]
      return { ...state, histories }
    },
    removeQuery(state, action: PayloadAction<{ query: string }>) {
      const { query } = action.payload
      if (!query) {
        return state
      }
      const histories = state.histories.filter((history) => history !== query)
      return { ...state, histories }
    },
  },
})

export const { replaceState, addQuery, removeQuery } = querySlice.actions

export default querySlice.reducer

export const selectQuery = (state: AppState) => state.query

export const selectQueryHistories = createSelector(
  selectQuery,
  (query) => query.histories,
)
