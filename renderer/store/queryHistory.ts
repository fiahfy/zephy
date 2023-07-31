import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit'

import { AppState } from 'store'

type State = {
  histories: string[]
}

const initialState: State = { histories: [] }

export const querySlice = createSlice({
  name: 'queryHistory',
  initialState,
  reducers: {
    add(state, action: PayloadAction<string>) {
      const query = action.payload
      if (!query) {
        return state
      }
      const histories = [
        ...state.histories.filter((history) => history !== query),
        query,
      ]
      return { ...state, histories }
    },
    remove(state, action: PayloadAction<string>) {
      const query = action.payload
      if (!query) {
        return state
      }
      const histories = state.histories.filter((history) => history !== query)
      return { ...state, histories }
    },
    replace(_state, action: PayloadAction<State>) {
      return action.payload
    },
  },
})

export const { add, remove, replace } = querySlice.actions

export default querySlice.reducer

export const selectQueryHistory = (state: AppState) => state.queryHistory

export const selectQueryHistories = createSelector(
  selectQueryHistory,
  (queryHistory) => queryHistory.histories,
)
