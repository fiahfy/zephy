import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit'
import { AppState } from '~/store'

type State = {
  loop: boolean
  volume: number
}

const initialState: State = {
  loop: false,
  volume: 1,
}

export const previewSlice = createSlice({
  name: 'preview',
  initialState,
  reducers: {
    replaceState(_state, action: PayloadAction<State>) {
      return action.payload
    },
    setLoop(state, action: PayloadAction<boolean>) {
      return { ...state, loop: action.payload }
    },
    setVolume(state, action: PayloadAction<number>) {
      return { ...state, volume: action.payload }
    },
  },
})

export const { replaceState, setLoop, setVolume } = previewSlice.actions

export default previewSlice.reducer

export const selectPreview = (state: AppState) => state.preview

export const selectLoop = createSelector(
  selectPreview,
  (preview) => preview.loop,
)

export const selectVolume = createSelector(
  selectPreview,
  (preview) => preview.volume,
)
