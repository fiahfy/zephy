import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit'
import { Settings } from '~/interfaces'
import { AppState, AppThunk } from '~/store'
import { detectFileType } from '~/utils/file'

type State = Settings

const initialState: State = {
  shouldOpenWithPhoty: false,
  shouldOpenWithVisty: false,
  shouldShowHiddenFiles: false,
  theme: 'system',
}

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    replaceState(_state, action: PayloadAction<State>) {
      return action.payload
    },
    setShouldOpenWithPhoty(state, action: PayloadAction<boolean>) {
      return { ...state, shouldOpenWithPhoty: action.payload }
    },
    setShouldOpenWithVisty(state, action: PayloadAction<boolean>) {
      return { ...state, shouldOpenWithVisty: action.payload }
    },
    setShouldShowHiddenFiles(state, action: PayloadAction<boolean>) {
      return { ...state, shouldShowHiddenFiles: action.payload }
    },
    setTheme(state, action: PayloadAction<State['theme']>) {
      return { ...state, theme: action.payload }
    },
  },
})

export const {
  replaceState,
  setShouldOpenWithPhoty,
  setShouldOpenWithVisty,
  setShouldShowHiddenFiles,
  setTheme,
} = settingsSlice.actions

export default settingsSlice.reducer

export const selectSettings = (state: AppState) => state.settings

export const selectShouldOpenWithPhoty = createSelector(
  selectSettings,
  (settings) => settings.shouldOpenWithPhoty,
)

export const selectShouldOpenWithVisty = createSelector(
  selectSettings,
  (settings) => settings.shouldOpenWithVisty,
)

export const selectShouldShowHiddenFiles = createSelector(
  selectSettings,
  (settings) => settings.shouldShowHiddenFiles,
)

export const selectTheme = createSelector(
  selectSettings,
  (settings) => settings.theme,
)

export const openEntry =
  (filePath: string): AppThunk =>
  async (_, getState) => {
    const shouldOpenWithPhoty = selectShouldOpenWithPhoty(getState())
    const shouldOpenWithVisty = selectShouldOpenWithVisty(getState())
    const fileType = detectFileType(filePath)
    switch (fileType) {
      case 'image':
        return shouldOpenWithPhoty
          ? await window.electronAPI.openUrl(`photy://open?path=${filePath}`)
          : await window.electronAPI.openEntry(filePath)
      case 'video':
      case 'audio':
        return shouldOpenWithVisty
          ? await window.electronAPI.openUrl(`visty://open?path=${filePath}`)
          : await window.electronAPI.openEntry(filePath)
      default:
        return await window.electronAPI.openEntry(filePath)
    }
  }
