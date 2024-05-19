import {
  Action,
  ThunkAction,
  combineReducers,
  configureStore,
} from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import {
  FLUSH,
  KEY_PREFIX,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import explorerReducer from '~/store/explorer'
import favoriteReducer from '~/store/favorite'
import previewReducer from '~/store/preview'
import queryReducer from '~/store/query'
import ratingReducer from '~/store/rating'
import settingsReducer from '~/store/settings'
import windowReducer from '~/store/window'
import windowIdReducer from '~/store/windowId'

const reducers = combineReducers({
  explorer: explorerReducer,
  favorite: favoriteReducer,
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
  whitelist: ['favorite', 'preview', 'query', 'rating', 'settings', 'window'],
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
