import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit'
import { Settings } from 'interfaces'
import { AppState } from 'store'

type State = Settings

const initialState: State = {
  contentLayout: 'default',
  darkMode: false,
  fullscreen: true,
}

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setContentLayout(state, action: PayloadAction<State['contentLayout']>) {
      return { ...state, contentLayout: action.payload }
    },
    setDarkMode(state, action: PayloadAction<boolean>) {
      return { ...state, darkMode: action.payload }
    },
    setFullscreen(state, action: PayloadAction<boolean>) {
      return { ...state, fullscreen: action.payload }
    },
    replace(_state, action: PayloadAction<State>) {
      return action.payload
    },
  },
})

export const { replace, setContentLayout, setDarkMode, setFullscreen } =
  settingsSlice.actions

export default settingsSlice.reducer

export const selectSettings = (state: AppState) => state.settings

export const selectContentLayout = createSelector(
  selectSettings,
  (settings) => settings.contentLayout
)

export const selectDarkMode = createSelector(
  selectSettings,
  (settings) => settings.darkMode
)

export const selectFullscreen = createSelector(
  selectSettings,
  (settings) => settings.fullscreen
)
