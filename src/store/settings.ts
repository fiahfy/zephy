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
    replaceState(_state, action: PayloadAction<{ state: State }>) {
      return action.payload.state
    },
    setShouldOpenWithPhoty(
      state,
      action: PayloadAction<{ shouldOpenWithPhoty: boolean }>,
    ) {
      const { shouldOpenWithPhoty } = action.payload
      return { ...state, shouldOpenWithPhoty }
    },
    setShouldOpenWithVisty(
      state,
      action: PayloadAction<{ shouldOpenWithVisty: boolean }>,
    ) {
      const { shouldOpenWithVisty } = action.payload
      return { ...state, shouldOpenWithVisty }
    },
    setShouldShowHiddenFiles(
      state,
      action: PayloadAction<{ shouldShowHiddenFiles: boolean }>,
    ) {
      const { shouldShowHiddenFiles } = action.payload
      return { ...state, shouldShowHiddenFiles }
    },
    setTheme(state, action: PayloadAction<{ theme: State['theme'] }>) {
      const { theme } = action.payload
      return { ...state, theme }
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
    const encoded = encodeURIComponent(filePath)
    switch (fileType) {
      case 'image':
        return shouldOpenWithPhoty
          ? await window.electronAPI.openUrl(`photy://open?path=${encoded}`)
          : await window.electronAPI.openEntry(filePath)
      case 'video':
      case 'audio':
        return shouldOpenWithVisty
          ? await window.electronAPI.openUrl(`visty://open?path=${encoded}`)
          : await window.electronAPI.openEntry(filePath)
      default:
        return await window.electronAPI.openEntry(filePath)
    }
  }
