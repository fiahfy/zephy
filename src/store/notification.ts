import {
  createSelector,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit'
import type { AppState, AppThunk } from '~/store'

type State = {
  notification?: {
    message: string
    type: 'info' | 'success' | 'warning' | 'error'
  }
}

const initialState: State = { notification: undefined }

const getErrorMessage = (e: Error): string => {
  console.error(e)
  const message = e.message.split(':').slice(2).join(':')
  return message ? message : e.message
}

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

export default notificationSlice.reducer

export const selectNotification = createSelector(
  (state: AppState) => state.notification,
  (notification) => notification.notification,
)

export const showError =
  (error: Error | unknown): AppThunk =>
  async (dispatch) => {
    const { showNotification } = notificationSlice.actions

    if (error instanceof Error) {
      dispatch(
        showNotification({ message: getErrorMessage(error), type: 'error' }),
      )
    }
  }
