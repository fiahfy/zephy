import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit'
import { Content } from 'interfaces'
import { AppState, AppThunk } from 'store'
import { add } from 'store/queryHistory'
import { selectWindowId } from 'store/windowId'

type ExplorerState = {
  contents: Content[]
  layout: 'list' | 'thumbnail'
  loading: boolean
  query: string
  selected: string[]
}

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
  orderBy: 'name' | 'rating' | 'dateModified'
}

type SortingState = {
  [path: string]: SortOption
}

type WindowState = {
  explorer: ExplorerState
  history: HistoryState
  sidebar: SidebarState
  sorting: SortingState
}

type State = {
  [windowId: number]: WindowState
}

const defaultState: WindowState = {
  explorer: {
    contents: [],
    layout: 'list',
    loading: false,
    query: '',
    selected: [],
  },
  history: {
    histories: [],
    index: -1,
  },
  sidebar: {
    hidden: false,
    width: 256,
  },
  sorting: {},
}

const initialState: State = { [0]: defaultState }

export const windowSlice = createSlice({
  name: 'window',
  initialState,
  reducers: {
    loaded(
      state,
      action: PayloadAction<{ windowId: number; contents: Content[] }>
    ) {
      const { windowId, contents } = action.payload
      const windowState = state[windowId]
      if (!windowState) {
        return state
      }
      return {
        ...state,
        [windowId]: {
          ...defaultState,
          ...windowState,
          explorer: {
            ...windowState.explorer,
            contents,
            loading: false,
            query: '',
          },
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
          explorer: {
            ...windowState.explorer,
            contents: [],
            loading: true,
          },
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
          explorer: {
            ...windowState.explorer,
            selected: [path],
          },
        },
      }
    },
    setLayout(
      state,
      action: PayloadAction<{
        windowId: number
        layout: ExplorerState['layout']
      }>
    ) {
      const { windowId, layout } = action.payload
      const windowState = state[windowId]
      if (!windowState) {
        return state
      }
      return {
        ...state,
        [windowId]: {
          ...defaultState,
          ...windowState,
          explorer: {
            ...windowState.explorer,
            layout,
          },
        },
      }
    },
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
          explorer: {
            ...windowState.explorer,
            query,
          },
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
          explorer: {
            ...windowState.explorer,
            selected: [],
          },
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
    setSidebarHidden(
      state,
      action: PayloadAction<{ windowId: number; hidden: boolean }>
    ) {
      const { windowId, hidden } = action.payload
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
            hidden,
          },
        },
      }
    },
    setSidebarWidth(
      state,
      action: PayloadAction<{ windowId: number; width: number }>
    ) {
      const { windowId, width } = action.payload
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
            width,
          },
        },
      }
    },
    sort(
      state,
      action: PayloadAction<{
        windowId: number
        path: string
        option: SortOption
      }>
    ) {
      const { windowId, path, option } = action.payload
      const windowState = state[windowId]
      if (!windowState) {
        return state
      }
      return {
        ...state,
        [windowId]: {
          ...defaultState,
          ...windowState,
          sorting: {
            ...windowState.sorting,
            [path]: option,
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

export const selectExplorer = createSelector(
  selectWindow,
  (window) => window.explorer
)

export const selectHistory = createSelector(
  selectWindow,
  (window) => window.history
)

export const selectSidebar = createSelector(
  selectWindow,
  (window) => window.sidebar
)

export const selectSorting = createSelector(
  selectWindow,
  (window) => window.sorting
)

export const selectContents = createSelector(
  selectExplorer,
  (explorer) => explorer.contents
)

export const selectLayout = createSelector(
  selectExplorer,
  (explorer) => explorer.layout
)

export const selectLoading = createSelector(
  selectExplorer,
  (explorer) => explorer.loading
)

export const selectQuery = createSelector(
  selectExplorer,
  (explorer) => explorer.query
)

export const selectIsSelected = createSelector(
  selectExplorer,
  (explorer) => (path: string) => explorer.selected.includes(path)
)

export const selectSelectedContents = createSelector(
  selectExplorer,
  selectIsSelected,
  (explorer, isSelected) =>
    explorer.contents.filter((content) => isSelected(content.path))
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

export const selectCurrentPage = createSelector(
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
  selectCurrentPage,
  (currentPage) => currentPage === '/'
)

export const selectCurrentScrollTop = createSelector(
  selectCurrentHistory,
  (currentHistory) => currentHistory.scrollTop
)

export const selectCanBack = createSelector(
  selectHistory,
  (history) => history.index > 0
)

export const selectCanForward = createSelector(
  selectHistory,
  (history) => history.index < history.histories.length - 1
)

export const selectSidebarHidden = createSelector(
  selectSidebar,
  (settings) => settings.hidden
)

export const selectSidebarWidth = createSelector(
  selectSidebar,
  (settings) => settings.width
)

export const selectCurrentSortOption = createSelector(
  selectSorting,
  selectCurrentDirectory,
  (sorting, currentDirectory) =>
    sorting[currentDirectory] ?? ({ order: 'asc', orderBy: 'name' } as const)
)

export const load =
  (path: string): AppThunk =>
  async (dispatch, getState) => {
    const { loading, loaded } = windowSlice.actions
    const windowId = selectWindowId(getState())
    dispatch(loading({ windowId }))
    try {
      const contents = await window.electronAPI.listContents(path)
      dispatch(loaded({ windowId, contents }))
    } catch (e) {
      dispatch(loaded({ windowId, contents: [] }))
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

export const setLayout =
  (layout: ExplorerState['layout']): AppThunk =>
  async (dispatch, getState) => {
    const { setLayout } = windowSlice.actions
    const windowId = selectWindowId(getState())
    dispatch(setLayout({ windowId, layout }))
  }

export const searchQuery =
  (query: string): AppThunk =>
  async (dispatch, getState) => {
    const { setQuery } = windowSlice.actions
    const windowId = selectWindowId(getState())
    dispatch(setQuery({ windowId, query }))
    dispatch(add(query))
  }

export const go =
  (offset: number): AppThunk =>
  async (dispatch, getState) => {
    const { go } = windowSlice.actions
    const windowId = selectWindowId(getState())
    dispatch(go({ windowId, offset }))
  }

export const move =
  (path: string): AppThunk =>
  async (dispatch, getState) => {
    const { move } = windowSlice.actions
    const windowId = selectWindowId(getState())
    dispatch(move({ windowId, path }))
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

export const setSidebarHidden =
  (hidden: boolean): AppThunk =>
  async (dispatch, getState) => {
    const { setSidebarHidden } = windowSlice.actions
    const windowId = selectWindowId(getState())
    dispatch(setSidebarHidden({ windowId, hidden }))
  }

export const setSidebarWidth =
  (width: number): AppThunk =>
  async (dispatch, getState) => {
    const { setSidebarWidth } = windowSlice.actions
    const windowId = selectWindowId(getState())
    dispatch(setSidebarWidth({ windowId, width }))
  }

export const sort =
  (path: string, option: SortOption): AppThunk =>
  async (dispatch, getState) => {
    const windowId = selectWindowId(getState())
    const { sort } = windowSlice.actions
    dispatch(sort({ windowId, path, option }))
  }

export const back = (): AppThunk => async (dispatch) => dispatch(go(-1))

export const forward = (): AppThunk => async (dispatch) => dispatch(go(1))
