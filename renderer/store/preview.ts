import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit'

import { AppState } from 'store'

type State = {
  volume: number
}

const initialState: State = {
  volume: 1,
}

export const previewSlice = createSlice({
  name: 'preview',
  initialState,
  reducers: {
    setVolume(state, action: PayloadAction<number>) {
      return { ...state, volume: action.payload }
    },
    replace(_state, action: PayloadAction<State>) {
      return action.payload
    },
  },
})

export const { replace, setVolume } = previewSlice.actions

export default previewSlice.reducer

export const selectPreview = (state: AppState) => state.preview

export const selectVolume = createSelector(
  selectPreview,
  (preview) => preview.volume,
)
