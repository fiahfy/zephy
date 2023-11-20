import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit'
import { AppState, AppThunk } from '~/store'

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
    replace(_state, action: PayloadAction<State>) {
      return action.payload
    },
    addToFavorites(state, action: PayloadAction<string>) {
      const favorites = [
        ...state.favorites.filter(
          (favorite) => favorite.path !== action.payload,
        ),
        { path: action.payload },
      ]
      return { ...state, favorites }
    },
    removeFromFavorites(state, action: PayloadAction<string>) {
      const favorites = state.favorites.filter(
        (favorite) => favorite.path !== action.payload,
      )
      return { ...state, favorites }
    },
  },
})

export const { addToFavorites, removeFromFavorites, replace } =
  favoriteSlice.actions

export default favoriteSlice.reducer

export const selectFavorite = (state: AppState) => state.favorite

export const selectFavorites = createSelector(
  selectFavorite,
  (favorite) => favorite.favorites,
)

export const selectIsFavorite = createSelector(selectFavorites, (favorites) => {
  const hash = favorites.reduce(
    (acc, favorite) => ({ ...acc, [favorite.path]: true }),
    {} as { [path: string]: boolean },
  )
  return (path: string) => hash[path] ?? false
})

export const toggleFavorite =
  (path: string): AppThunk =>
  async (dispatch, getState) => {
    const favorite = selectIsFavorite(getState())(path)
    const action = favorite ? removeFromFavorites(path) : addToFavorites(path)
    dispatch(action)
  }
