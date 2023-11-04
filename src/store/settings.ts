import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit'
import { Settings } from '~/interfaces'
import { AppState, AppThunk } from '~/store'
import { detectFileType } from '~/utils/file'

type State = Settings

const initialState: State = {
  shouldOpenWithVisty: false,
  shouldShowHiddenFiles: false,
  theme: 'system',
}

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setShouldOpenWithVisty(state, action: PayloadAction<boolean>) {
      return { ...state, shouldOpenWithVisty: action.payload }
    },
    setShouldShowHiddenFiles(state, action: PayloadAction<boolean>) {
      return { ...state, shouldShowHiddenFiles: action.payload }
    },
    setTheme(state, action: PayloadAction<State['theme']>) {
      return { ...state, theme: action.payload }
    },
    replace(_state, action: PayloadAction<State>) {
      return action.payload
    },
  },
})

export const {
  replace,
  setShouldOpenWithVisty,
  setShouldShowHiddenFiles,
  setTheme,
} = settingsSlice.actions

export default settingsSlice.reducer

export const selectSettings = (state: AppState) => state.settings

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
    const shouldOpenWithVisty = selectShouldOpenWithVisty(getState())
    const fileType = detectFileType(filePath)
    switch (fileType) {
      case 'video':
      case 'audio':
        return shouldOpenWithVisty
          ? await window.electronAPI.openUrl(`visty://open?path=${filePath}`)
          : await window.electronAPI.openEntry(filePath)
      default:
        return await window.electronAPI.openEntry(filePath)
    }
  }
