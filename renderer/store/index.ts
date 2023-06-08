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
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import explorerReducer from 'store/explorer'
import favoriteReducer from 'store/favorite'
import queryHistoryReducer from 'store/queryHistory'
import ratingReducer from 'store/rating'
import settingsReducer from 'store/settings'
import windowReducer from 'store/window'
import windowIndexReducer from 'store/windowIndex'

const reducers = combineReducers({
  explorer: explorerReducer,
  favorite: favoriteReducer,
  queryHistory: queryHistoryReducer,
  rating: ratingReducer,
  settings: settingsReducer,
  window: windowReducer,
  windowIndex: windowIndexReducer,
})

const persistConfig = {
  key: 'root',
  storage,
  version: 1,
  whitelist: ['favorite', 'queryHistory', 'rating', 'settings', 'window'],
}

const persistedReducer = persistReducer(persistConfig, reducers)

function makeStore() {
  return configureStore({
    reducer: persistedReducer,
    // @see https://redux-toolkit.js.org/usage/usage-guide#use-with-redux-persist
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
  })
}

const store = makeStore()

export type AppState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action<string>
>

export default store

export const useAppDispatch = () => useDispatch<AppDispatch>()

export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector

export const storageKey = `${KEY_PREFIX}${persistConfig.key}`
