import { createStorage } from '@fiahfy/electron-storage/renderer'
import {
  type Action,
  combineReducers,
  configureStore,
  type ThunkAction,
} from '@reduxjs/toolkit'
import {
  type TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from 'react-redux'
import {
  FLUSH,
  KEY_PREFIX,
  PAUSE,
  PERSIST,
  PURGE,
  persistReducer,
  persistStore,
  REGISTER,
  REHYDRATE,
} from 'redux-persist'
import explorerListReducer from '~/store/explorer-list'
import explorerTreeReducer from '~/store/explorer-tree'
import favoriteReducer from '~/store/favorite'
import notificationReducer from '~/store/notification'
import preferencesReducer from '~/store/preferences'
import previewReducer from '~/store/preview'
import queryReducer from '~/store/query'
import ratingReducer from '~/store/rating'
import settingsReducer from '~/store/settings'
import windowReducer from '~/store/window'
import windowIdReducer from '~/store/window-id'

const storage = createStorage(window.storageAPI)

const reducers = combineReducers({
  explorerList: explorerListReducer,
  explorerTree: explorerTreeReducer,
  favorite: favoriteReducer,
  notification: notificationReducer,
  preferences: preferencesReducer,
  preview: previewReducer,
  query: queryReducer,
  rating: ratingReducer,
  settings: settingsReducer,
  window: windowReducer,
  windowId: windowIdReducer,
})

const persistConfig = {
  key: 'root',
  storage,
  version: 1,
  whitelist: [
    'favorite',
    'preferences',
    'query',
    'rating',
    'settings',
    'window',
  ],
}

const persistedReducer = persistReducer(persistConfig, reducers)

export const store = configureStore({
  reducer: persistedReducer,
  // @see https://redux-toolkit.js.org/usage/usage-guide#use-with-redux-persist
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export type AppState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action<string>
>

export const persistor = persistStore(store)

export const useAppDispatch = () => useDispatch<AppDispatch>()

export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector

export const storageKey = `${KEY_PREFIX}${persistConfig.key}`
