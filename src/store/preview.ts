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
    replaceState(_state, action: PayloadAction<{ state: State }>) {
      return action.payload.state
    },
    setLoop(state, action: PayloadAction<{ loop: boolean }>) {
      const { loop } = action.payload
      return { ...state, loop }
    },
    setVolume(state, action: PayloadAction<{ volume: number }>) {
      const { volume } = action.payload
      return { ...state, volume }
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
