import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit'
import { AppState } from '~/store'

type State = {
  histories: string[]
}

const initialState: State = { histories: [] }

export const querySlice = createSlice({
  name: 'query',
  initialState,
  reducers: {
    replace(_state, action: PayloadAction<State>) {
      return action.payload
    },
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
  },
})

export const { add, remove, replace } = querySlice.actions

export default querySlice.reducer

export const selectQuery = (state: AppState) => state.query

export const selectQueryHistories = createSelector(
  selectQuery,
  (query) => query.histories,
)
