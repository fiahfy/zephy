import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit'
import { Settings } from '~/interfaces'
import { AppState } from '~/store'

type State = Settings

const initialState: State = {
  shouldShowHiddenFiles: false,
  theme: 'system',
}

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<State['theme']>) {
      return { ...state, theme: action.payload }
    },
    setShouldShowHiddenFiles(state, action: PayloadAction<boolean>) {
      return { ...state, shouldShowHiddenFiles: action.payload }
    },
    replace(_state, action: PayloadAction<State>) {
      return action.payload
    },
  },
})

export const { replace, setShouldShowHiddenFiles, setTheme } =
  settingsSlice.actions

export default settingsSlice.reducer

export const selectSettings = (state: AppState) => state.settings

export const selectTheme = createSelector(
  selectSettings,
  (settings) => settings.theme,
)

export const selectShouldShowHiddenFiles = createSelector(
  selectSettings,
  (settings) => settings.shouldShowHiddenFiles,
)
