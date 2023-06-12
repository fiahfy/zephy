import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { AppState, AppThunk } from 'store'
import { initialize } from 'store/window'

type State = number

const initialState: State = 0

export const windowIdSlice = createSlice({
  name: 'window',
  initialState,
  reducers: {
    set(_state, action: PayloadAction<State>) {
      return action.payload
    },
  },
})

export const { set } = windowIdSlice.actions

export default windowIdSlice.reducer

export const selectWindowId = (state: AppState) => state.windowId

export const load = (): AppThunk => async (dispatch) => {
  const windowId = await window.electronAPI.getWindowId()
  if (!windowId) {
    return
  }
  dispatch(set(windowId))
  dispatch(initialize(windowId))
}
