import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit'
import { Content } from '~/interfaces'
import { AppState, AppThunk } from '~/store'
import { selectWindowIndex } from '~/store/windowIndex'
import { selectLoading } from './explorer'

type History = {
  directoryPath: string
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
  [directoryPath: string]: SortOption
}

type ViewMode = 'list' | 'thumbnail'

type ViewModeState = {
  [directoryPath: string]: ViewMode
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

const defaultOrders = {
  name: 'asc',
  dateLastOpened: 'desc',
  dateModified: 'desc',
  dateCreated: 'desc',
  size: 'desc',
  rating: 'desc',
} as const

const buildZephyUrl = (
  inputs:
    | { pathname: 'ratings'; params: { score: number } }
    | { pathname: 'settings' },
) => {
  switch (inputs.pathname) {
    case 'ratings':
      return `zephy://ratings/${inputs.params.score}`
    case 'settings':
      return 'zephy://settings'
  }
}

const parseZephyUrl = (url: string) => {
  if (!url.startsWith('zephy://')) {
    return undefined
  }
  const u = new URL(url)
  const path = u.pathname.split('/')[2]
  switch (path) {
    case 'ratings': {
      const score = Number(u.pathname.split('/')[3] ?? '')
      return {
        pathname: 'ratings' as const,
        params: { score },
      }
    }
    case 'settings':
      return { pathname: 'settings' as const }
    default:
      return undefined
  }
}

const getTitle = async (path: string) => {
  const parsed = parseZephyUrl(path)
  if (parsed) {
    switch (parsed.pathname) {
      case 'ratings':
        return 'Ratings'
      case 'settings':
        return 'Settings'
    }
  } else {
    const entry = await window.electronAPI.getDetailedEntry(path)
    return entry.name
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
      action: PayloadAction<{
        index: number
        directoryPath: string
        title: string
      }>,
    ) {
      const { index, directoryPath, title } = action.payload
      const windowState = state[index]
      if (!windowState) {
        return state
      }
      const currentDirectoryPath =
        windowState.history.histories[windowState.history.index]?.directoryPath
      if (directoryPath === currentDirectoryPath) {
        return
      }
      const historyIndex = windowState.history.index + 1
      const histories = [
        ...windowState.history.histories.slice(0, historyIndex),
        { directoryPath, scrollTop: 0, title },
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
    sort(
      state,
      action: PayloadAction<{
        index: number
        directoryPath: string
        orderBy: SortOption['orderBy']
      }>,
    ) {
      const { index, directoryPath, orderBy } = action.payload
      const windowState = state[index]
      if (!windowState) {
        return state
      }
      const option = windowState.sorting[directoryPath]
      const newOrder =
        option && option.orderBy === orderBy
          ? option.order === 'desc'
            ? 'asc'
            : 'desc'
          : defaultOrders[orderBy as keyof typeof defaultOrders]
      return {
        ...state,
        [index]: {
          ...windowState,
          sorting: {
            ...windowState.sorting,
            [directoryPath]: {
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
        directoryPath: string
        viewMode: ViewMode
      }>,
    ) {
      const { index, directoryPath, viewMode } = action.payload
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
            [directoryPath]: viewMode,
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
    history.histories[history.index] ?? {
      directoryPath: '',
      scrollTop: 0,
      title: '',
    },
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

export const selectCurrentDirectoryPath = createSelector(
  selectCurrentHistory,
  (currentHistory) => currentHistory.directoryPath,
)

export const selectCurrentScrollTop = createSelector(
  selectCurrentHistory,
  (currentHistory) => currentHistory.scrollTop,
)

export const selectZephyUrl = createSelector(
  selectCurrentDirectoryPath,
  (currentDirectoryPath) => parseZephyUrl(currentDirectoryPath),
)

export const selectZephySchema = createSelector(
  selectZephyUrl,
  (zephyUrl) => !!zephyUrl,
)

export const selectCurrentSortOption = createSelector(
  selectSorting,
  selectCurrentDirectoryPath,
  (sorting, currentDirectoryPath) =>
    sorting[currentDirectoryPath] ??
    ({ order: 'asc', orderBy: 'name' } as const),
)

export const selectCurrentViewMode = createSelector(
  selectViewMode,
  selectCurrentDirectoryPath,
  (viewMode, currentDirectoryPath) => viewMode[currentDirectoryPath] ?? 'list',
)

export const selectIsSidebarHidden = createSelector(
  selectSidebar,
  (sidebar) => (variant: 'primary' | 'secondary') => sidebar[variant].hidden,
)

export const selectGetSidebarWidth = createSelector(
  selectSidebar,
  (sidebar) => (variant: 'primary' | 'secondary') => sidebar[variant].width,
)

export const selectGetViewMode = createSelector(
  selectViewMode,
  (viewMode) => (directoryPath: string) => viewMode[directoryPath],
)

export const setSidebarHidden =
  (variant: 'primary' | 'secondary', hidden: boolean): AppThunk =>
  async (dispatch, getState) => {
    const { setSidebarHidden } = windowSlice.actions
    const index = selectWindowIndex(getState())
    dispatch(setSidebarHidden({ index, variant, hidden }))
    dispatch(updateApplicationMenu())
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
    const loading = selectLoading(getState())
    if (loading) {
      return
    }
    const { go } = windowSlice.actions
    const index = selectWindowIndex(getState())
    dispatch(go({ index, offset }))
    dispatch(updateApplicationMenu())
  }

export const back = (): AppThunk => async (dispatch) => dispatch(go(-1))

export const forward = (): AppThunk => async (dispatch) => dispatch(go(1))

export const changeDirectory =
  (directoryPath: string): AppThunk =>
  async (dispatch, getState) => {
    const loading = selectLoading(getState())
    if (loading) {
      return
    }
    const { changeDirectory, setViewMode } = windowSlice.actions
    const index = selectWindowIndex(getState())
    // inherit view mode if the path is a child of the current directory
    const currentDirectoryPath = selectCurrentDirectoryPath(getState())
    if (directoryPath.startsWith(currentDirectoryPath)) {
      const viewMode = selectGetViewMode(getState())(directoryPath)
      if (!viewMode) {
        const currentViewMode = selectCurrentViewMode(getState())
        if (currentViewMode !== 'list') {
          dispatch(
            setViewMode({ index, directoryPath, viewMode: currentViewMode }),
          )
        }
      }
    }
    const title = await getTitle(directoryPath)
    dispatch(changeDirectory({ index, directoryPath, title }))
    dispatch(updateApplicationMenu())
  }

export const upward = (): AppThunk => async (dispatch, getState) => {
  const currentDirectoryPath = selectCurrentDirectoryPath(getState())
  const parent = await window.electronAPI.getParentEntry(currentDirectoryPath)
  dispatch(changeDirectory(parent.path))
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

export const sort =
  (orderBy: SortOption['orderBy']): AppThunk =>
  async (dispatch, getState) => {
    const { sort } = windowSlice.actions
    const index = selectWindowIndex(getState())
    const currentDirectoryPath = selectCurrentDirectoryPath(getState())
    dispatch(
      sort({
        index,
        directoryPath: currentDirectoryPath,
        orderBy,
      }),
    )
    dispatch(updateApplicationMenu())
  }

export const setCurrentViewMode =
  (viewMode: ViewMode): AppThunk =>
  async (dispatch, getState) => {
    const { setViewMode } = windowSlice.actions
    const index = selectWindowIndex(getState())
    const currentDirectoryPath = selectCurrentDirectoryPath(getState())
    dispatch(
      setViewMode({ index, directoryPath: currentDirectoryPath, viewMode }),
    )
    dispatch(updateApplicationMenu())
  }

export const updateApplicationMenu = (): AppThunk => async (_, getState) => {
  const canBack = selectCanBack(getState())
  const canForward = selectCanForward(getState())
  const sidebar = selectSidebar(getState())
  const sortOption = selectCurrentSortOption(getState())
  const viewMode = selectCurrentViewMode(getState())
  await window.electronAPI.applicationMenu.update({
    canBack,
    canForward,
    inspectorHidden: sidebar.primary.hidden,
    navigatorHidden: sidebar.secondary.hidden,
    orderBy: sortOption.orderBy,
    viewMode,
  })
}
