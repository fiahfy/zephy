import {
  type PayloadAction,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit'
import type { AppState } from '~/store'

type State = {
  notification?: {
    message: string
    type: 'info' | 'success' | 'warning' | 'error'
  }
}

const initialState: State = { notification: undefined }

export const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    showNotification(state, action: PayloadAction<State['notification']>) {
      const notification = action.payload
      return { ...state, notification }
    },
  },
})

export const { showNotification } = notificationSlice.actions

export default notificationSlice.reducer

export const selectNotification = createSelector(
  (state: AppState) => state.notification,
  (notification) => notification.notification,
)
