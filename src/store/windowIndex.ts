import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { AppState } from '~/store'

type State = number

const initialState: State = -1

export const windowIndexSlice = createSlice({
  name: 'windowIndex',
  initialState,
  reducers: {
    set(_state, action: PayloadAction<State>) {
      return action.payload
    },
  },
})

export const { set } = windowIndexSlice.actions

export default windowIndexSlice.reducer

export const selectWindowIndex = (state: AppState) => state.windowIndex
