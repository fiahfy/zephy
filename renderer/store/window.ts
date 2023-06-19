import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit'

import { Content, DetailedEntry } from 'interfaces'
import { AppState, AppThunk } from 'store'
import { add } from 'store/queryHistory'
import { selectGetRating } from 'store/rating'
import { selectShouldShowHiddenFiles } from 'store/settings'
import { selectWindowId } from 'store/windowId'
import { isHiddenFile } from 'utils/entry'

type History = {
  directory: string
  scrollTop: number
}

type HistoryState = {
  histories: History[]
  index: number
}

type SidebarState = {
  hidden: boolean
  width: number
}

type SortOption = {
  order: 'asc' | 'desc'
  orderBy: keyof Content
}

type SortingState = {
  [path: string]: SortOption
}

type WindowState = {
  entries: DetailedEntry[]
  history: HistoryState
  loading: boolean
  query: string
  selected: string[]
  sidebar: {
    primary: SidebarState
    secondary: SidebarState
  }
  sorting: SortingState
  viewMode: 'list' | 'thumbnail'
}

type State = {
  [windowId: number]: WindowState
}

export const defaultOrders = {
  name: 'asc',
  dateLastOpened: 'desc',
  dateModified: 'desc',
  dateCreated: 'desc',
  size: 'desc',
  rating: 'desc',
} as const

const defaultState: WindowState = {
  entries: [],
  history: {
    histories: [],
    index: -1,
  },
  loading: false,
  query: '',
  selected: [],
  sidebar: {
    primary: {
      hidden: false,
      width: 256,
    },
    secondary: {
      hidden: false,
      width: 256,
    },
  },
  sorting: {},
  viewMode: 'list',
}

const initialState: State = { [0]: defaultState }

export const windowSlice = createSlice({
  name: 'window',
  initialState,
  reducers: {
    setQuery(
      state,
      action: PayloadAction<{ windowId: number; query: string }>
    ) {
      const { windowId, query } = action.payload
      const windowState = state[windowId]
      if (!windowState) {
        return state
      }
      return {
        ...state,
        [windowId]: {
          ...defaultState,
          ...windowState,
          query,
        },
      }
    },
    setViewMode(
      state,
      action: PayloadAction<{
        windowId: number
        viewMode: WindowState['viewMode']
      }>
    ) {
      const { windowId, viewMode } = action.payload
      const windowState = state[windowId]
      if (!windowState) {
        return state
      }
      return {
        ...state,
        [windowId]: {
          ...defaultState,
          ...windowState,
          viewMode,
        },
      }
    },
    setSidebarHidden(
      state,
      action: PayloadAction<{
        windowId: number
        variant: 'primary' | 'secondary'
        hidden: boolean
      }>
    ) {
      const { windowId, variant, hidden } = action.payload
      const windowState = state[windowId]
      if (!windowState) {
        return state
      }
      return {
        ...state,
        [windowId]: {
          ...defaultState,
          ...windowState,
          sidebar: {
            ...windowState.sidebar,
            [variant]: {
              ...windowState.sidebar[variant],
              hidden,
            },
          },
        },
      }
    },
    setSidebarWidth(
      state,
      action: PayloadAction<{
        windowId: number
        variant: 'primary' | 'secondary'
        width: number
      }>
    ) {
      const { windowId, variant, width } = action.payload
      const windowState = state[windowId]
      if (!windowState) {
        return state
      }
      return {
        ...state,
        [windowId]: {
          ...defaultState,
          ...windowState,
          sidebar: {
            ...windowState.sidebar,
            [variant]: {
              ...windowState.sidebar[variant],
              width,
            },
          },
        },
      }
    },
    loaded(
      state,
      action: PayloadAction<{ windowId: number; entries: DetailedEntry[] }>
    ) {
      const { windowId, entries } = action.payload
      const windowState = state[windowId]
      if (!windowState) {
        return state
      }
      return {
        ...state,
        [windowId]: {
          ...defaultState,
          ...windowState,
          entries,
          loading: false,
          query: '',
        },
      }
    },
    loading(state, action: PayloadAction<{ windowId: number }>) {
      const { windowId } = action.payload
      const windowState = state[windowId]
      if (!windowState) {
        return state
      }
      return {
        ...state,
        [windowId]: {
          ...defaultState,
          ...windowState,
          entries: [],
          loading: true,
        },
      }
    },
    select(state, action: PayloadAction<{ windowId: number; path: string }>) {
      const { windowId, path } = action.payload
      const windowState = state[windowId]
      if (!windowState) {
        return state
      }
      return {
        ...state,
        [windowId]: {
          ...defaultState,
          ...windowState,
          selected: [path],
        },
      }
    },
    unselectAll(state, action: PayloadAction<{ windowId: number }>) {
      const { windowId } = action.payload
      const windowState = state[windowId]
      if (!windowState) {
        return state
      }
      return {
        ...state,
        [windowId]: {
          ...defaultState,
          ...windowState,
          selected: [],
        },
      }
    },
    go(state, action: PayloadAction<{ windowId: number; offset: number }>) {
      const { windowId, offset } = action.payload
      const windowState = state[windowId]
      if (!windowState) {
        return state
      }
      const index = windowState.history.index + offset
      const history = windowState.history.histories[index]
      if (!history) {
        return state
      }
      return {
        ...state,
        [windowId]: {
          ...defaultState,
          ...windowState,
          history: { ...windowState.history, index },
        },
      }
    },
    move(state, action: PayloadAction<{ windowId: number; path: string }>) {
      const { windowId, path } = action.payload
      const windowState = state[windowId]
      if (!windowState) {
        return state
      }
      const lastHistory =
        windowState.history.histories[windowState.history.index]?.directory
      if (path === lastHistory) {
        return
      }
      const index = windowState.history.index + 1
      const histories = [
        ...windowState.history.histories.slice(0, index),
        { directory: path, scrollTop: 0 },
      ]
      return {
        ...state,
        [windowId]: {
          ...defaultState,
          ...windowState,
          history: {
            ...windowState.history,
            histories,
            index,
          },
        },
      }
    },
    moveToTrash(
      state,
      action: PayloadAction<{ windowId: number; path: string }>
    ) {
      const { windowId, path } = action.payload
      const windowState = state[windowId]
      if (!windowState) {
        return state
      }
      const entries = windowState.entries.filter((entry) => entry.path !== path)
      return {
        ...state,
        [windowId]: {
          ...defaultState,
          ...windowState,
          entries,
        },
      }
    },
    scroll(
      state,
      action: PayloadAction<{ windowId: number; scrollTop: number }>
    ) {
      const { windowId, scrollTop } = action.payload
      const windowState = state[windowId]
      if (!windowState) {
        return state
      }
      const histories = windowState.history.histories.map((history, i) =>
        i === windowState.history.index ? { ...history, scrollTop } : history
      )
      return {
        ...state,
        [windowId]: {
          ...defaultState,
          ...windowState,
          history: {
            ...windowState.history,
            histories,
          },
        },
      }
    },
    sort(
      state,
      action: PayloadAction<{
        windowId: number
        path: string
        orderBy: SortOption['orderBy']
        order?: SortOption['order']
      }>
    ) {
      const { windowId, path, orderBy, order } = action.payload
      const windowState = state[windowId]
      if (!windowState) {
        return state
      }
      const newOrder = order
        ? order
        : defaultOrders[orderBy as keyof typeof defaultOrders]
      return {
        ...state,
        [windowId]: {
          ...defaultState,
          ...windowState,
          sorting: {
            ...windowState.sorting,
            [path]: {
              order: newOrder,
              orderBy,
            },
          },
        },
      }
    },
    initialize(state, action: PayloadAction<number>) {
      const windowId = action.payload
      return {
        ...state,
        [windowId]: {
          ...defaultState,
          ...(state[windowId] ?? {}),
        },
      }
    },
    replace(_state, action: PayloadAction<State>) {
      return action.payload
    },
  },
})

export const { initialize, replace } = windowSlice.actions

export default windowSlice.reducer

export const selectWindow = (state: AppState) => {
  const windowState = state.window[state.windowId]
  if (!windowState) {
    throw new Error('window state is not found')
  }
  return windowState
}

export const selectEntries = createSelector(
  selectWindow,
  (window) => window.entries
)

export const selectHistory = createSelector(
  selectWindow,
  (window) => window.history
)

export const selectLoading = createSelector(
  selectWindow,
  (window) => window.loading
)

export const selectQuery = createSelector(
  selectWindow,
  (window) => window.query
)

export const selectViewMode = createSelector(
  selectWindow,
  (window) => window.viewMode
)

export const selectSelected = createSelector(
  selectWindow,
  (window) => window.selected
)

export const selectIsSelected = createSelector(
  selectSelected,
  (selected) => (path: string) => selected.includes(path)
)

export const selectCurrentHistory = createSelector(
  selectHistory,
  (history) =>
    history.histories[history.index] ?? { directory: '', scrollTop: 0 }
)

export const selectCurrentDirectory = createSelector(
  selectCurrentHistory,
  (currentHistory) => currentHistory.directory
)

export const selectCurrentScrollTop = createSelector(
  selectCurrentHistory,
  (currentHistory) => currentHistory.scrollTop
)

export const selectCurrentPathname = createSelector(
  selectCurrentDirectory,
  (currentDirectory) => {
    switch (currentDirectory) {
      case 'zephy://settings':
        return '/settings'
      default:
        return '/'
    }
  }
)

export const selectIndexPage = createSelector(
  selectCurrentPathname,
  (currentPathname) => currentPathname === '/'
)

export const selectSettingsPage = createSelector(
  selectCurrentPathname,
  (currentPathname) => currentPathname === '/settings'
)

export const selectCanBack = createSelector(
  selectHistory,
  (history) => history.index > 0
)

export const selectCanForward = createSelector(
  selectHistory,
  (history) => history.index < history.histories.length - 1
)

export const selectSorting = createSelector(
  selectWindow,
  (window) => window.sorting
)

export const selectCurrentSortOption = createSelector(
  selectSorting,
  selectCurrentDirectory,
  (sorting, currentDirectory) =>
    sorting[currentDirectory] ?? ({ order: 'asc', orderBy: 'name' } as const)
)

export const selectContents = createSelector(
  selectEntries,
  selectQuery,
  selectCurrentSortOption,
  selectShouldShowHiddenFiles,
  selectGetRating,
  (entries, query, currentSortOption, shouldShowHiddenFiles, getRating) => {
    const comparator = (a: Content, b: Content) => {
      let result = 0
      const aValue = a[currentSortOption.orderBy]
      const bValue = b[currentSortOption.orderBy]
      if (aValue !== undefined && bValue !== undefined) {
        if (aValue > bValue) {
          result = 1
        } else if (aValue < bValue) {
          result = -1
        }
      } else {
        result = 0
      }
      const orderSign = currentSortOption.order === 'desc' ? -1 : 1
      return orderSign * result
    }
    return entries
      .filter((entry) => shouldShowHiddenFiles || !isHiddenFile(entry.name))
      .filter(
        (entry) =>
          !query || entry.name.toLowerCase().includes(query.toLowerCase())
      )
      .map((entry) => ({
        ...entry,
        rating: getRating(entry.path),
      }))
      .sort((a, b) => comparator(a, b))
  }
)

export const selectSelectedContents = createSelector(
  selectContents,
  selectIsSelected,
  (contents, isSelected) =>
    contents.filter((content) => isSelected(content.path))
)

export const selectSidebar = createSelector(
  selectWindow,
  (window) => window.sidebar
)

export const selectIsSidebarHidden = createSelector(
  selectSidebar,
  (sidebar) => (variant: 'primary' | 'secondary') => sidebar[variant].hidden
)

export const selectGetSidebarWidth = createSelector(
  selectSidebar,
  (sidebar) => (variant: 'primary' | 'secondary') => sidebar[variant].width
)

export const setViewMode =
  (viewMode: WindowState['viewMode']): AppThunk =>
  async (dispatch, getState) => {
    const { setViewMode } = windowSlice.actions
    const windowId = selectWindowId(getState())
    dispatch(setViewMode({ windowId, viewMode }))
  }

export const setSidebarHidden =
  (variant: 'primary' | 'secondary', hidden: boolean): AppThunk =>
  async (dispatch, getState) => {
    const { setSidebarHidden } = windowSlice.actions
    const windowId = selectWindowId(getState())
    dispatch(setSidebarHidden({ windowId, variant, hidden }))
  }

export const setSidebarWidth =
  (variant: 'primary' | 'secondary', width: number): AppThunk =>
  async (dispatch, getState) => {
    const { setSidebarWidth } = windowSlice.actions
    const windowId = selectWindowId(getState())
    dispatch(setSidebarWidth({ windowId, variant, width }))
  }

export const searchQuery =
  (query: string): AppThunk =>
  async (dispatch, getState) => {
    const { setQuery } = windowSlice.actions
    const windowId = selectWindowId(getState())
    dispatch(setQuery({ windowId, query }))
    dispatch(add(query))
  }

export const load = (): AppThunk => async (dispatch, getState) => {
  const { loading, loaded } = windowSlice.actions
  const windowId = selectWindowId(getState())
  const currentDirectory = selectCurrentDirectory(getState())
  if (!currentDirectory) {
    return
  }
  dispatch(loading({ windowId }))
  try {
    const entries = await window.electronAPI.getDetailedEntries(
      currentDirectory
    )
    dispatch(loaded({ windowId, entries }))
  } catch (e) {
    dispatch(loaded({ windowId, entries: [] }))
  }
}

export const select =
  (path: string): AppThunk =>
  async (dispatch, getState) => {
    const { select } = windowSlice.actions
    const windowId = selectWindowId(getState())
    dispatch(select({ windowId, path }))
  }

export const unselectAll = (): AppThunk => async (dispatch, getState) => {
  const { unselectAll } = windowSlice.actions
  const windowId = selectWindowId(getState())
  dispatch(unselectAll({ windowId }))
}

export const go =
  (offset: number): AppThunk =>
  async (dispatch, getState) => {
    const { go } = windowSlice.actions
    const windowId = selectWindowId(getState())
    dispatch(go({ windowId, offset }))
  }

export const back = (): AppThunk => async (dispatch) => dispatch(go(-1))

export const forward = (): AppThunk => async (dispatch) => dispatch(go(1))

export const move =
  (path: string): AppThunk =>
  async (dispatch, getState) => {
    const { move } = windowSlice.actions
    const windowId = selectWindowId(getState())
    dispatch(move({ windowId, path }))
  }

export const moveToTrash =
  (path: string): AppThunk =>
  async (dispatch, getState) => {
    const { moveToTrash } = windowSlice.actions
    const windowId = selectWindowId(getState())
    await window.electronAPI.trashItem(path)
    dispatch(moveToTrash({ windowId, path }))
  }

export const moveToHome = (): AppThunk => async (dispatch) => {
  const homePath = await window.electronAPI.getHomePath()
  return dispatch(move(homePath))
}

export const moveToSettings = (): AppThunk => async (dispatch) => {
  dispatch(move('zephy://settings'))
}

export const scroll =
  (scrollTop: number): AppThunk =>
  async (dispatch, getState) => {
    const { scroll } = windowSlice.actions
    const windowId = selectWindowId(getState())
    dispatch(scroll({ windowId, scrollTop }))
  }

export const sort =
  (orderBy: SortOption['orderBy'], order?: SortOption['order']): AppThunk =>
  async (dispatch, getState) => {
    const windowId = selectWindowId(getState())
    const currentDirectory = selectCurrentDirectory(getState())
    const { sort } = windowSlice.actions
    dispatch(sort({ windowId, path: currentDirectory, orderBy, order }))
  }
