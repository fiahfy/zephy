import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import { AppState, AppThunk } from 'store'
import { initialize } from 'store/window'

type State = number

const initialState: State = 0

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

export const load = (): AppThunk => async (dispatch) => {
  const windowIndex = await window.electronAPI.getWindowIndex()
  if (!windowIndex) {
    return
  }
  dispatch(set(windowIndex))
  dispatch(initialize(windowIndex))
}
