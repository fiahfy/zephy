import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { AppState } from '~/store'

type State = number

const initialState: State = -1

export const windowIndexSlice = createSlice({
  name: 'windowIndex',
  initialState,
  reducers: {
    setWindowIndex(_state, action: PayloadAction<{ windowIndex: State }>) {
      return action.payload.windowIndex
    },
  },
})

export const { setWindowIndex } = windowIndexSlice.actions

export default windowIndexSlice.reducer

export const selectWindowIndex = (state: AppState) => state.windowIndex
