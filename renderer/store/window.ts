import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit'

import { Content } from 'interfaces'
import { AppState, AppThunk } from 'store'
import { selectWindowIndex } from 'store/windowIndex'

type History = {
  directory: string
  scrollTop: number
  title: string
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
  [index: number]: WindowState
}

export const defaultOrders = {
  name: 'asc',
  dateLastOpened: 'desc',
  dateModified: 'desc',
  dateCreated: 'desc',
  size: 'desc',
  rating: 'desc',
} as const

const parseZephyUrl = (input: string) => {
  const match = input.match(/^zephy:\/\/([^/]+)(?:\/([^/]+))?$/)
  if (!match || !match[1]) {
    return undefined
  }
  switch (match[1]) {
    case 'ratings':
      return {
        pathname: 'ratings' as const,
        params: { score: Number(match[2] ?? 0) },
      }
    case 'settings':
      return { pathname: 'settings' as const }
    default:
      return undefined
  }
}

const buildZephyUrl = (
  url:
    | { pathname: 'ratings'; params: { score: number } }
    | { pathname: 'settings' },
) => {
  switch (url.pathname) {
    case 'ratings':
      return `zephy://ratings/${url.params.score}`
    case 'settings':
      return 'zephy://settings'
  }
}

export const getTitle = async (path: string) => {
  const url = parseZephyUrl(path)
  if (url) {
    switch (url.pathname) {
      case 'ratings':
        return 'Ratings'
      case 'settings':
        return 'Settings'
    }
  } else {
    return await window.electronAPI.basename(path)
  }
}

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
        index: number
        variant: 'primary' | 'secondary'
        hidden: boolean
      }>,
    ) {
      const { index, variant, hidden } = action.payload
      const windowState = state[index]
      if (!windowState) {
        return state
      }
      return {
        ...state,
        [index]: {
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
        index: number
        variant: 'primary' | 'secondary'
        width: number
      }>,
    ) {
      const { index, variant, width } = action.payload
      const windowState = state[index]
      if (!windowState) {
        return state
      }
      return {
        ...state,
        [index]: {
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
      action: PayloadAction<{ index: number; path: string; title: string }>,
    ) {
      const { index, path, title } = action.payload
      const windowState = state[index]
      if (!windowState) {
        return state
      }
      const lastHistory =
        windowState.history.histories[windowState.history.index]?.directory
      if (path === lastHistory) {
        return
      }
      const historyIndex = windowState.history.index + 1
      const histories = [
        ...windowState.history.histories.slice(0, historyIndex),
        { directory: path, scrollTop: 0, title },
      ]
      return {
        ...state,
        [index]: {
          ...windowState,
          history: {
            ...windowState.history,
            histories,
            index: historyIndex,
          },
        },
      }
    },
    go(state, action: PayloadAction<{ index: number; offset: number }>) {
      const { index, offset } = action.payload
      const windowState = state[index]
      if (!windowState) {
        return state
      }
      const historyIndex = windowState.history.index + offset
      const history = windowState.history.histories[historyIndex]
      if (!history) {
        return state
      }
      return {
        ...state,
        [index]: {
          ...windowState,
          history: { ...windowState.history, index: historyIndex },
        },
      }
    },
    setCurrentScrollTop(
      state,
      action: PayloadAction<{ index: number; scrollTop: number }>,
    ) {
      const { index, scrollTop } = action.payload
      const windowState = state[index]
      if (!windowState) {
        return state
      }
      const histories = windowState.history.histories.map((history, i) =>
        i === windowState.history.index ? { ...history, scrollTop } : history,
      )
      return {
        ...state,
        [index]: {
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
        index: number
        path: string
        sortOption: {
          order?: SortOption['order']
          orderBy: SortOption['orderBy']
        }
      }>,
    ) {
      const {
        index,
        path,
        sortOption: { order, orderBy },
      } = action.payload
      const windowState = state[index]
      if (!windowState) {
        return state
      }
      const newOrder = order
        ? order
        : defaultOrders[orderBy as keyof typeof defaultOrders]
      return {
        ...state,
        [index]: {
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
        index: number
        path: string
        viewMode: ViewMode
      }>,
    ) {
      const { index, path, viewMode } = action.payload
      const windowState = state[index]
      if (!windowState) {
        return state
      }
      return {
        ...state,
        [index]: {
          ...windowState,
          viewMode: {
            ...windowState.viewMode,
            [path]: viewMode,
          },
        },
      }
    },
    initialize(state, action: PayloadAction<{ index: number }>) {
      const { index } = action.payload
      return {
        ...state,
        [index]: {
          ...defaultState,
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

export const selectBackHistories = createSelector(selectHistory, (history) =>
  history.histories.slice(0, history.index).reverse(),
)

export const selectForwardHistories = createSelector(selectHistory, (history) =>
  history.histories.slice(history.index + 1),
)

export const selectCurrentDirectory = createSelector(
  selectCurrentHistory,
  (currentHistory) => currentHistory.directory,
)

export const selectCurrentScrollTop = createSelector(
  selectCurrentHistory,
  (currentHistory) => currentHistory.scrollTop,
)

export const selectZephyUrl = createSelector(
  selectCurrentDirectory,
  (currentDirectory) => parseZephyUrl(currentDirectory),
)

export const selectZephySchema = createSelector(
  selectZephyUrl,
  (zephyUrl) => !!zephyUrl,
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
    const index = selectWindowIndex(getState())
    dispatch(setSidebarHidden({ index, variant, hidden }))
  }

export const setSidebarWidth =
  (variant: 'primary' | 'secondary', width: number): AppThunk =>
  async (dispatch, getState) => {
    const { setSidebarWidth } = windowSlice.actions
    const index = selectWindowIndex(getState())
    dispatch(setSidebarWidth({ index, variant, width }))
  }

export const go =
  (offset: number): AppThunk =>
  async (dispatch, getState) => {
    const { go } = windowSlice.actions
    const index = selectWindowIndex(getState())
    dispatch(go({ index, offset }))
  }

export const back = (): AppThunk => async (dispatch) => dispatch(go(-1))

export const forward = (): AppThunk => async (dispatch) => dispatch(go(1))

export const upward = (): AppThunk => async (dispatch, getState) => {
  const currentDirectory = selectCurrentDirectory(getState())
  const path = await window.electronAPI.dirname(currentDirectory)
  dispatch(changeDirectory(path))
}

export const changeDirectory =
  (path: string): AppThunk =>
  async (dispatch, getState) => {
    const { changeDirectory } = windowSlice.actions
    const index = selectWindowIndex(getState())
    const title = await getTitle(path)
    dispatch(changeDirectory({ index, path, title }))
  }

export const goToRatings =
  (score: number): AppThunk =>
  async (dispatch) =>
    dispatch(
      changeDirectory(
        buildZephyUrl({ pathname: 'ratings', params: { score } }),
      ),
    )

export const goToSettings = (): AppThunk => async (dispatch) =>
  dispatch(changeDirectory(buildZephyUrl({ pathname: 'settings' })))

export const setCurrentScrollTop =
  (scrollTop: number): AppThunk =>
  async (dispatch, getState) => {
    const { setCurrentScrollTop } = windowSlice.actions
    const index = selectWindowIndex(getState())
    dispatch(setCurrentScrollTop({ index, scrollTop }))
  }

export const setCurrentSortOption =
  (sortOption: SortOption): AppThunk =>
  async (dispatch, getState) => {
    const { setSortOption } = windowSlice.actions
    const index = selectWindowIndex(getState())
    const currentDirectory = selectCurrentDirectory(getState())
    dispatch(setSortOption({ index, path: currentDirectory, sortOption }))
  }

export const setCurrentOrderBy =
  (orderBy: SortOption['orderBy']): AppThunk =>
  async (dispatch, getState) => {
    const { setSortOption } = windowSlice.actions
    const index = selectWindowIndex(getState())
    const currentDirectory = selectCurrentDirectory(getState())
    dispatch(
      setSortOption({
        index,
        path: currentDirectory,
        sortOption: { orderBy },
      }),
    )
  }

export const setCurrentViewMode =
  (viewMode: ViewMode): AppThunk =>
  async (dispatch, getState) => {
    const { setViewMode } = windowSlice.actions
    const index = selectWindowIndex(getState())
    const currentDirectory = selectCurrentDirectory(getState())
    dispatch(setViewMode({ index, path: currentDirectory, viewMode }))
  }
