import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { AppState } from '~/store'

type State = number

const initialState: State = 0

export const windowIdSlice = createSlice({
  name: 'windowId',
  initialState,
  reducers: {
    setWindowId(_state, action: PayloadAction<{ windowId: State }>) {
      return action.payload.windowId
    },
  },
})

export const { setWindowId } = windowIdSlice.actions

export default windowIdSlice.reducer

export const selectWindowId = (state: AppState) => state.windowId
