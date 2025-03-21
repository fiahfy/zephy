import {
  type PayloadAction,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit'
import type { AppState } from '~/store'

type State = {
  dateCreatedColumnVisible: boolean
  dateLastOpenedColumnVisible: boolean
  dateModifiedColumnVisible: boolean
  defaultLoop: boolean
  defaultVolume: number
  ratingColumnVisible: boolean
  sizeColumnVisible: boolean
}

const initialState: State = {
  dateCreatedColumnVisible: true,
  dateLastOpenedColumnVisible: true,
  dateModifiedColumnVisible: true,
  defaultLoop: false,
  defaultVolume: 1,
  ratingColumnVisible: true,
  sizeColumnVisible: true,
}

export const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    replaceState(_state, action: PayloadAction<{ state: State }>) {
      return action.payload.state
    },
    setDefaultLoop(state, action: PayloadAction<{ defaultLoop: boolean }>) {
      const { defaultLoop } = action.payload
      return { ...state, defaultLoop }
    },
    setDefaultVolume(state, action: PayloadAction<{ defaultVolume: number }>) {
      const { defaultVolume } = action.payload
      return { ...state, defaultVolume }
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
  setDefaultLoop,
  setDefaultVolume,
  toggleDateCreatedColumnVisible,
  toggleDateLastOpenedColumnVisible,
  toggleDateModifiedColumnVisible,
  toggleRatingColumnVisible,
  toggleSizeColumnVisible,
} = preferencesSlice.actions

export default preferencesSlice.reducer

export const selectPreferences = (state: AppState) => state.preferences

export const selectDateCreatedColumnVisible = createSelector(
  selectPreferences,
  (preferences) => preferences.dateCreatedColumnVisible,
)

export const selectDateLastOpenedColumnVisible = createSelector(
  selectPreferences,
  (preferences) => preferences.dateLastOpenedColumnVisible,
)

export const selectDateModifiedColumnVisible = createSelector(
  selectPreferences,
  (preferences) => preferences.dateModifiedColumnVisible,
)
export const selectDefaultLoop = createSelector(
  selectPreferences,
  (preferences) => preferences.defaultLoop,
)

export const selectDefaultVolume = createSelector(
  selectPreferences,
  (preferences) => preferences.defaultVolume,
)

export const selectRatingColumnVisible = createSelector(
  selectPreferences,
  (preferences) => preferences.ratingColumnVisible,
)

export const selectSizeColumnVisible = createSelector(
  selectPreferences,
  (preferences) => preferences.sizeColumnVisible,
)
