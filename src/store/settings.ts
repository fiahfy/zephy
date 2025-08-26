import {
  createSelector,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit'
import type { AppState, AppThunk } from '~/store'
import { detectFileType } from '~/utils/file'
import { getPath } from '~/utils/url'

type State = {
  shouldOpenWithPhoty: boolean
  shouldOpenWithVisty: boolean
  shouldShowHiddenFiles: boolean
  theme: 'light' | 'dark' | 'system'
}

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

export const openUrl =
  (url: string): AppThunk =>
  async (_, getState) => {
    const path = getPath(url)
    if (!path) {
      return
    }

    const encoded = encodeURIComponent(path)
    const fileType = detectFileType(path)
    switch (fileType) {
      case 'image': {
        const shouldOpenWithPhoty = selectShouldOpenWithPhoty(getState())
        return shouldOpenWithPhoty
          ? window.electronAPI.openUrl(`photy://open?path=${encoded}`)
          : window.electronAPI.openEntry(path)
      }
      case 'video':
      case 'audio': {
        const shouldOpenWithVisty = selectShouldOpenWithVisty(getState())
        return shouldOpenWithVisty
          ? window.electronAPI.openUrl(`visty://open?path=${encoded}`)
          : window.electronAPI.openEntry(path)
      }
      default:
        return window.electronAPI.openEntry(path)
    }
  }
