import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit'

import { Settings } from 'interfaces'
import { AppState } from 'store'

type State = Settings

const initialState: State = {
  darkMode: false,
  shouldShowHiddenFiles: false,
}

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setDarkMode(state, action: PayloadAction<boolean>) {
      return { ...state, darkMode: action.payload }
    },
    setShouldShowHiddenFiles(state, action: PayloadAction<boolean>) {
      return { ...state, shouldShowHiddenFiles: action.payload }
    },
    replace(_state, action: PayloadAction<State>) {
      return action.payload
    },
  },
})

export const { replace, setDarkMode, setShouldShowHiddenFiles } =
  settingsSlice.actions

export default settingsSlice.reducer

export const selectSettings = (state: AppState) => state.settings

export const selectDarkMode = createSelector(
  selectSettings,
  (settings) => settings.darkMode,
)

export const selectShouldShowHiddenFiles = createSelector(
  selectSettings,
  (settings) => settings.shouldShowHiddenFiles,
)
