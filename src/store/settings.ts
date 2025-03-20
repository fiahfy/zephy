import {
  type PayloadAction,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit'
import type { Settings } from '~/interfaces'
import type { AppState, AppThunk } from '~/store'
import { detectFileType } from '~/utils/file'

type State = Settings

const initialState: State = {
  dateCreatedColumnVisible: true,
  dateLastOpenedColumnVisible: true,
  dateModifiedColumnVisible: true,
  ratingColumnVisible: true,
  shouldOpenWithPhoty: false,
  shouldOpenWithVisty: false,
  shouldShowHiddenFiles: false,
  sizeColumnVisible: true,
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
    toggleDateCreatedColumnVisible(state) {
      return {
        ...state,
        dateCreatedColumnVisible: !state.dateCreatedColumnVisible,
      }
    },
    toggleDateLastOpenedColumnVisible(state) {
      return {
        ...state,
        dateLastOpenedColumnVisible: !state.dateLastOpenedColumnVisible,
      }
    },
    toggleDateModifiedColumnVisible(state) {
      return {
        ...state,
        dateModifiedColumnVisible: !state.dateModifiedColumnVisible,
      }
    },
    toggleRatingColumnVisible(state) {
      return { ...state, ratingColumnVisible: !state.ratingColumnVisible }
    },
    toggleSizeColumnVisible(state) {
      return { ...state, sizeColumnVisible: !state.sizeColumnVisible }
    },
  },
})

export const {
  replaceState,
  setShouldOpenWithPhoty,
  setShouldOpenWithVisty,
  setShouldShowHiddenFiles,
  setTheme,
  toggleDateCreatedColumnVisible,
  toggleDateLastOpenedColumnVisible,
  toggleDateModifiedColumnVisible,
  toggleRatingColumnVisible,
  toggleSizeColumnVisible,
} = settingsSlice.actions

export default settingsSlice.reducer

export const selectSettings = (state: AppState) => state.settings

export const selectDateCreatedColumnVisible = createSelector(
  selectSettings,
  (settings) => settings.dateCreatedColumnVisible,
)

export const selectDateLastOpenedColumnVisible = createSelector(
  selectSettings,
  (settings) => settings.dateLastOpenedColumnVisible,
)

export const selectDateModifiedColumnVisible = createSelector(
  selectSettings,
  (settings) => settings.dateModifiedColumnVisible,
)

export const selectRatingColumnVisible = createSelector(
  selectSettings,
  (settings) => settings.ratingColumnVisible,
)

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

export const selectSizeColumnVisible = createSelector(
  selectSettings,
  (settings) => settings.sizeColumnVisible,
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
