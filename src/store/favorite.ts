import {
  type PayloadAction,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit'
import type { AppState, AppThunk } from '~/store'

type Favorite = {
  path: string
}

type State = {
  favorites: Favorite[]
}

const initialState: State = { favorites: [] }

export const favoriteSlice = createSlice({
  name: 'favorite',
  initialState,
  reducers: {
    replaceState(_state, action: PayloadAction<{ state: State }>) {
      return action.payload.state
    },
    addToFavorites(state, action: PayloadAction<{ path: string }>) {
      const { path } = action.payload
      const favorites = [
        ...state.favorites.filter((favorite) => favorite.path !== path),
        { path },
      ]
      return { ...state, favorites }
    },
    removeFromFavorites(state, action: PayloadAction<{ path: string }>) {
      const { path } = action.payload
      const favorites = state.favorites.filter(
        (favorite) => favorite.path !== path,
      )
      return { ...state, favorites }
    },
    changeFavoritePath(
      state,
      action: PayloadAction<{ oldPath: string; newPath: string }>,
    ) {
      const { oldPath, newPath } = action.payload
      const favorites = state.favorites.map((favorite) =>
        favorite.path === oldPath ? { ...favorite, path: newPath } : favorite,
      )
      return { ...state, favorites }
    },
  },
})

export const { replaceState, changeFavoritePath } = favoriteSlice.actions

export default favoriteSlice.reducer

export const selectFavorite = (state: AppState) => state.favorite

export const selectFavorites = (favorite: State) => favorite.favorites

export const selectFavoriteMap = createSelector(selectFavorites, (favorites) =>
  favorites.reduce(
    (acc, favorite) => ({ ...acc, [favorite.path]: true }),
    {} as { [path: string]: boolean },
  ),
)

export const selectFavoriteByPath = createSelector(
  selectFavoriteMap,
  (_favorite: State, path: string) => path,
  (favoriteMap, path) => favoriteMap[path] ?? false,
)

export const addToFavorites =
  (path: string): AppThunk =>
  async (dispatch) => {
    const { addToFavorites } = favoriteSlice.actions
    dispatch(addToFavorites({ path }))
  }

export const removeFromFavorites =
  (path: string): AppThunk =>
  async (dispatch) => {
    const { removeFromFavorites } = favoriteSlice.actions
    dispatch(removeFromFavorites({ path }))
  }

export const toggleFavorite =
  (path: string): AppThunk =>
  async (dispatch, getState) => {
    const favorite = selectFavoriteByPath(selectFavorite(getState()), path)
    const action = favorite ? removeFromFavorites(path) : addToFavorites(path)
    dispatch(action)
  }
