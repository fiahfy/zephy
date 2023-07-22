import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit'

import { Content } from 'interfaces'
import { AppState, AppThunk } from 'store'
import { selectWindowIndex } from 'store/windowIndex'

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

type ViewMode = 'list' | 'thumbnail'

type ViewModeState = {
  [path: string]: ViewMode
}

type WindowState = {
  history: HistoryState
  sidebar: {
    primary: SidebarState
    secondary: SidebarState
  }
  sorting: SortingState
  viewMode: ViewModeState
}

type State = {
  [windowIndex: number]: WindowState
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
  history: {
    histories: [],
    index: -1,
  },
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
  viewMode: {},
}

const initialState: State = {}

export const windowSlice = createSlice({
  name: 'window',
  initialState,
  reducers: {
    setSidebarHidden(
      state,
      action: PayloadAction<{
        windowIndex: number
        variant: 'primary' | 'secondary'
        hidden: boolean
      }>,
    ) {
      const { windowIndex, variant, hidden } = action.payload
      const windowState = state[windowIndex]
      if (!windowState) {
        return state
      }
      return {
        ...state,
        [windowIndex]: {
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
        windowIndex: number
        variant: 'primary' | 'secondary'
        width: number
      }>,
    ) {
      const { windowIndex, variant, width } = action.payload
      const windowState = state[windowIndex]
      if (!windowState) {
        return state
      }
      return {
        ...state,
        [windowIndex]: {
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
    changeDirectory(
      state,
      action: PayloadAction<{ windowIndex: number; path: string }>,
    ) {
      const { windowIndex, path } = action.payload
      const windowState = state[windowIndex]
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
        [windowIndex]: {
          ...windowState,
          history: {
            ...windowState.history,
            histories,
            index,
          },
        },
      }
    },
    go(state, action: PayloadAction<{ windowIndex: number; offset: number }>) {
      const { windowIndex, offset } = action.payload
      const windowState = state[windowIndex]
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
        [windowIndex]: {
          ...windowState,
          history: { ...windowState.history, index },
        },
      }
    },
    setCurrentScrollTop(
      state,
      action: PayloadAction<{ windowIndex: number; scrollTop: number }>,
    ) {
      const { windowIndex, scrollTop } = action.payload
      const windowState = state[windowIndex]
      if (!windowState) {
        return state
      }
      const histories = windowState.history.histories.map((history, i) =>
        i === windowState.history.index ? { ...history, scrollTop } : history,
      )
      return {
        ...state,
        [windowIndex]: {
          ...windowState,
          history: {
            ...windowState.history,
            histories,
          },
        },
      }
    },
    setSortOption(
      state,
      action: PayloadAction<{
        windowIndex: number
        path: string
        sortOption: {
          order?: SortOption['order']
          orderBy: SortOption['orderBy']
        }
      }>,
    ) {
      const {
        windowIndex,
        path,
        sortOption: { order, orderBy },
      } = action.payload
      const windowState = state[windowIndex]
      if (!windowState) {
        return state
      }
      const newOrder = order
        ? order
        : defaultOrders[orderBy as keyof typeof defaultOrders]
      return {
        ...state,
        [windowIndex]: {
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
    setViewMode(
      state,
      action: PayloadAction<{
        windowIndex: number
        path: string
        viewMode: ViewMode
      }>,
    ) {
      const { windowIndex, path, viewMode } = action.payload
      const windowState = state[windowIndex]
      if (!windowState) {
        return state
      }
      return {
        ...state,
        [windowIndex]: {
          ...windowState,
          viewMode: {
            ...windowState.viewMode,
            [path]: viewMode,
          },
        },
      }
    },
    initialize(state, action: PayloadAction<{ windowIndex: number }>) {
      const { windowIndex } = action.payload
      return {
        ...state,
        [windowIndex]: {
          ...defaultState,
        },
      }
    },
    replace(_state, action: PayloadAction<State>) {
      return action.payload
    },
  },
})

export const { replace } = windowSlice.actions

export default windowSlice.reducer

export const selectWindow = (state: AppState) => {
  const windowState = state.window[state.windowIndex]
  return windowState ?? defaultState
}

export const selectHistory = createSelector(
  selectWindow,
  (window) => window.history,
)

export const selectSidebar = createSelector(
  selectWindow,
  (window) => window.sidebar,
)

export const selectSorting = createSelector(
  selectWindow,
  (window) => window.sorting,
)

export const selectViewMode = createSelector(
  selectWindow,
  (window) => window.viewMode,
)

export const selectCurrentHistory = createSelector(
  selectHistory,
  (history) =>
    history.histories[history.index] ?? { directory: '', scrollTop: 0 },
)

export const selectCanBack = createSelector(
  selectHistory,
  (history) => history.index > 0,
)

export const selectCanForward = createSelector(
  selectHistory,
  (history) => history.index < history.histories.length - 1,
)

export const selectCurrentDirectory = createSelector(
  selectCurrentHistory,
  (currentHistory) => currentHistory.directory,
)

export const selectCurrentScrollTop = createSelector(
  selectCurrentHistory,
  (currentHistory) => currentHistory.scrollTop,
)

export const selectExplorable = createSelector(
  selectCurrentDirectory,
  (currentDirectory) =>
    currentDirectory && !currentDirectory.startsWith('zephy://'),
)

export const selectCurrentSortOption = createSelector(
  selectSorting,
  selectCurrentDirectory,
  (sorting, currentDirectory) =>
    sorting[currentDirectory] ?? ({ order: 'asc', orderBy: 'name' } as const),
)

export const selectCurrentViewMode = createSelector(
  selectViewMode,
  selectCurrentDirectory,
  (viewMode, currentDirectory) => viewMode[currentDirectory] ?? 'list',
)

export const selectIsSidebarHidden = createSelector(
  selectSidebar,
  (sidebar) => (variant: 'primary' | 'secondary') => sidebar[variant].hidden,
)

export const selectGetSidebarWidth = createSelector(
  selectSidebar,
  (sidebar) => (variant: 'primary' | 'secondary') => sidebar[variant].width,
)

export const setSidebarHidden =
  (variant: 'primary' | 'secondary', hidden: boolean): AppThunk =>
  async (dispatch, getState) => {
    const { setSidebarHidden } = windowSlice.actions
    const windowIndex = selectWindowIndex(getState())
    dispatch(setSidebarHidden({ windowIndex, variant, hidden }))
  }

export const setSidebarWidth =
  (variant: 'primary' | 'secondary', width: number): AppThunk =>
  async (dispatch, getState) => {
    const { setSidebarWidth } = windowSlice.actions
    const windowIndex = selectWindowIndex(getState())
    dispatch(setSidebarWidth({ windowIndex, variant, width }))
  }

export const go =
  (offset: number): AppThunk =>
  async (dispatch, getState) => {
    const { go } = windowSlice.actions
    const windowIndex = selectWindowIndex(getState())
    dispatch(go({ windowIndex, offset }))
  }

export const back = (): AppThunk => async (dispatch) => dispatch(go(-1))

export const forward = (): AppThunk => async (dispatch) => dispatch(go(1))

export const upward = (): AppThunk => async (dispatch, getState) => {
  const currentDirectory = selectCurrentDirectory(getState())
  const path = await window.electronAPI.getDirectoryPath(currentDirectory)
  dispatch(changeDirectory(path))
}

export const changeDirectory =
  (path: string): AppThunk =>
  async (dispatch, getState) => {
    const { changeDirectory } = windowSlice.actions
    const windowIndex = selectWindowIndex(getState())
    dispatch(changeDirectory({ windowIndex, path }))
  }

export const goToSettings = (): AppThunk => async (dispatch) => {
  dispatch(changeDirectory('zephy://settings'))
}

export const setCurrentScrollTop =
  (scrollTop: number): AppThunk =>
  async (dispatch, getState) => {
    const { setCurrentScrollTop } = windowSlice.actions
    const windowIndex = selectWindowIndex(getState())
    dispatch(setCurrentScrollTop({ windowIndex, scrollTop }))
  }

export const setCurrentSortOption =
  (sortOption: SortOption): AppThunk =>
  async (dispatch, getState) => {
    const { setSortOption } = windowSlice.actions
    const windowIndex = selectWindowIndex(getState())
    const currentDirectory = selectCurrentDirectory(getState())
    dispatch(setSortOption({ windowIndex, path: currentDirectory, sortOption }))
  }

export const setCurrentOrderBy =
  (orderBy: SortOption['orderBy']): AppThunk =>
  async (dispatch, getState) => {
    const { setSortOption } = windowSlice.actions
    const windowIndex = selectWindowIndex(getState())
    const currentDirectory = selectCurrentDirectory(getState())
    dispatch(
      setSortOption({
        windowIndex,
        path: currentDirectory,
        sortOption: { orderBy },
      }),
    )
  }

export const setCurrentViewMode =
  (viewMode: ViewMode): AppThunk =>
  async (dispatch, getState) => {
    const { setViewMode } = windowSlice.actions
    const windowIndex = selectWindowIndex(getState())
    const currentDirectory = selectCurrentDirectory(getState())
    dispatch(setViewMode({ windowIndex, path: currentDirectory, viewMode }))
  }

export const initialize =
  (path: string): AppThunk =>
  async (dispatch, getState) => {
    const { initialize } = windowSlice.actions
    const windowIndex = selectWindowIndex(getState())
    dispatch(initialize({ windowIndex }))
    dispatch(changeDirectory(path))
  }
