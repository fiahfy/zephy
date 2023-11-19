import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit'
import { Content } from '~/interfaces'
import { AppState, AppThunk } from '~/store'
import { selectLoading } from '~/store/explorer'
import { selectWindowIndex } from '~/store/windowIndex'

type History = {
  directoryPath: string
  scrollTop: number
  title: string
}

type HistoryState = {
  histories: History[]
  index: number
}

type TabState = {
  history: HistoryState
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
  sidebar: {
    primary: SidebarState
    secondary: SidebarState
  }
  sorting: SortingState
  tabIndex: number
  tabs: TabState[]
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
    try {
      const entry = await window.electronAPI.getDetailedEntry(path)
      return entry.name
    } catch (e) {
      return '<Error>'
    }
  }
}

const defaultWindowState: WindowState = {
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
  tabIndex: 0,
  tabs: [
    {
      history: {
        histories: [],
        index: -1,
      },
    },
  ],
  viewMode: {},
}

const initialState: State = {}

export const windowSlice = createSlice({
  name: 'window',
  initialState,
  reducers: {
    replace(_state, action: PayloadAction<State>) {
      return action.payload
    },
    newWindow(state, action: PayloadAction<{ index: number }>) {
      const { index } = action.payload
      return {
        ...state,
        [index]: {
          ...defaultWindowState,
        },
      }
    },
    newTab(state, action: PayloadAction<{ index: number }>) {
      const { index } = action.payload
      const window = state[index]
      if (!window) {
        return state
      }
      const newTabindex = window.tabIndex + 1
      const tabs = [
        ...window.tabs.slice(0, window.tabIndex + 1),
        {
          history: {
            histories: [],
            index: -1,
          },
        },
        ...window.tabs.slice(window.tabIndex + 1),
      ]
      return {
        ...state,
        [index]: {
          ...window,
          tabIndex: newTabindex,
          tabs,
        },
      }
    },
    closeTab(
      state,
      action: PayloadAction<{ index: number; tabIndex: number }>,
    ) {
      const { index, tabIndex } = action.payload
      const window = state[index]
      if (!window) {
        return state
      }
      const tabs = window.tabs.filter((_, i) => i !== tabIndex)
      const newTabIndex = Math.min(window.tabIndex, tabs.length - 1)
      return {
        ...state,
        [index]: {
          ...window,
          tabIndex: newTabIndex,
          tabs,
        },
      }
    },
    closeCurrentTab(state, action: PayloadAction<{ index: number }>) {
      const { index } = action.payload
      const window = state[index]
      if (!window) {
        return state
      }
      const tabs = window.tabs.filter((_, i) => i !== window.tabIndex)
      const tabIndex = Math.min(window.tabIndex, tabs.length - 1)
      return {
        ...state,
        [index]: {
          ...window,
          tabIndex,
          tabs,
        },
      }
    },
    changeTab(
      state,
      action: PayloadAction<{ index: number; tabIndex: number }>,
    ) {
      const { index, tabIndex } = action.payload
      const window = state[index]
      if (!window) {
        return state
      }
      return {
        ...state,
        [index]: {
          ...window,
          tabIndex,
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
      const window = state[index]
      if (!window) {
        return state
      }
      const tab = window.tabs[window.tabIndex]
      if (!tab) {
        return state
      }
      const currentDirectoryPath =
        tab.history.histories[tab.history.index]?.directoryPath
      if (directoryPath === currentDirectoryPath) {
        return
      }
      const historyIndex = tab.history.index + 1
      const histories = [
        ...tab.history.histories.slice(0, historyIndex),
        { directoryPath, scrollTop: 0, title },
      ]
      const tabs = window.tabs.map((tab, i) =>
        i === window.tabIndex
          ? {
              ...tab,
              history: {
                ...tab.history,
                histories,
                index: historyIndex,
              },
            }
          : tab,
      )
      return {
        ...state,
        [index]: {
          ...window,
          tabs,
        },
      }
    },
    go(state, action: PayloadAction<{ index: number; offset: number }>) {
      const { index, offset } = action.payload
      const window = state[index]
      if (!window) {
        return state
      }
      const tab = window.tabs[window.tabIndex]
      if (!tab) {
        return state
      }
      const historyIndex = tab.history.index + offset
      const history = tab.history.histories[historyIndex]
      if (!history) {
        return state
      }
      const tabs = window.tabs.map((tab, i) =>
        i === window.tabIndex
          ? {
              ...tab,
              history: { ...tab.history, index: historyIndex },
            }
          : tab,
      )
      return {
        ...state,
        [index]: {
          ...window,
          tabs,
        },
      }
    },
    setCurrentScrollTop(
      state,
      action: PayloadAction<{ index: number; scrollTop: number }>,
    ) {
      const { index, scrollTop } = action.payload
      const window = state[index]
      if (!window) {
        return state
      }
      const tab = window.tabs[window.tabIndex]
      if (!tab) {
        return state
      }
      const histories = tab.history.histories.map((history, i) =>
        i === tab.history.index ? { ...history, scrollTop } : history,
      )
      const tabs = window.tabs.map((tab, i) =>
        i === window.tabIndex
          ? {
              ...tab,
              history: { ...tab.history, histories },
            }
          : tab,
      )
      return {
        ...state,
        [index]: {
          ...window,
          tabs,
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
      const window = state[index]
      if (!window) {
        return state
      }
      const option = window.sorting[directoryPath]
      const newOrder =
        option && option.orderBy === orderBy
          ? option.order === 'desc'
            ? 'asc'
            : 'desc'
          : defaultOrders[orderBy as keyof typeof defaultOrders]
      return {
        ...state,
        [index]: {
          ...window,
          sorting: {
            ...window.sorting,
            [directoryPath]: {
              order: newOrder,
              orderBy,
            },
          },
        },
      }
    },
    setSidebarHidden(
      state,
      action: PayloadAction<{
        index: number
        variant: 'primary' | 'secondary'
        hidden: boolean
      }>,
    ) {
      const { index, variant, hidden } = action.payload
      const window = state[index]
      if (!window) {
        return state
      }
      return {
        ...state,
        [index]: {
          ...window,
          sidebar: {
            ...window.sidebar,
            [variant]: {
              ...window.sidebar[variant],
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
      const window = state[index]
      if (!window) {
        return state
      }
      return {
        ...state,
        [index]: {
          ...window,
          sidebar: {
            ...window.sidebar,
            [variant]: {
              ...window.sidebar[variant],
              width,
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
      const window = state[index]
      if (!window) {
        return state
      }
      return {
        ...state,
        [index]: {
          ...window,
          viewMode: {
            ...window.viewMode,
            [directoryPath]: viewMode,
          },
        },
      }
    },
  },
})

export const { replace } = windowSlice.actions

export default windowSlice.reducer

export const selectCurrentWindow = (state: AppState) => {
  const window = state.window[state.windowIndex]
  return window ?? defaultWindowState
}

export const selectTabIndex = createSelector(
  selectCurrentWindow,
  (currentWindow) => currentWindow.tabIndex,
)

export const selectTabs = createSelector(
  selectCurrentWindow,
  (currentWindow) => currentWindow.tabs,
)

export const selectSidebar = createSelector(
  selectCurrentWindow,
  (currentWindow) => currentWindow.sidebar,
)

export const selectSorting = createSelector(
  selectCurrentWindow,
  (currentWindow) => currentWindow.sorting,
)

export const selectViewMode = createSelector(
  selectCurrentWindow,
  (currentWindow) => currentWindow.viewMode,
)

export const selectCurrentTab = createSelector(
  selectTabs,
  selectTabIndex,
  (tabs, tabIndex) =>
    tabs[tabIndex] ?? { history: { histories: [], index: -1 } },
)

export const selectCurrentHistory = createSelector(
  selectCurrentTab,
  (tab) =>
    tab.history.histories[tab.history.index] ?? {
      directoryPath: '',
      scrollTop: 0,
      title: '',
    },
)

export const selectGetCurrentHistory = createSelector(
  selectTabs,
  (tabs) => (tabIndex: number) => {
    const tab = tabs[tabIndex] ?? { history: { histories: [], index: -1 } }
    const history = tab.history
    return (
      history.histories[history.index] ?? {
        directoryPath: '',
        scrollTop: 0,
        title: '',
      }
    )
  },
)

export const selectCanCloseTab = createSelector(
  selectTabs,
  (tabs) => tabs.length > 1,
)

export const selectCanBack = createSelector(
  selectCurrentTab,
  (tab) => tab.history.index > 0,
)

export const selectCanForward = createSelector(
  selectCurrentTab,
  (tab) => tab.history.index < tab.history.histories.length - 1,
)

export const selectBackHistories = createSelector(selectCurrentTab, (tab) =>
  tab.history.histories.slice(0, tab.history.index).reverse(),
)

export const selectForwardHistories = createSelector(selectCurrentTab, (tab) =>
  tab.history.histories.slice(tab.history.index + 1),
)

export const selectCurrentDirectoryPath = createSelector(
  selectCurrentHistory,
  (currentHistory) => currentHistory.directoryPath,
)

export const selectCurrentScrollTop = createSelector(
  selectCurrentHistory,
  (currentHistory) => currentHistory.scrollTop,
)

export const selectCurrentTitle = createSelector(
  selectCurrentHistory,
  (currentHistory) => currentHistory.title,
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

export const newWindow = (): AppThunk => async (dispatch, getState) => {
  const { newWindow } = windowSlice.actions
  const index = selectWindowIndex(getState())
  dispatch(newWindow({ index }))
}

export const newTab = (): AppThunk => async (dispatch, getState) => {
  const { newTab } = windowSlice.actions
  const index = selectWindowIndex(getState())
  const currentDirectoryPath = selectCurrentDirectoryPath(getState())
  dispatch(newTab({ index }))
  dispatch(changeDirectory(currentDirectoryPath))
}

export const closeTab =
  (tabIndex: number): AppThunk =>
  async (dispatch, getState) => {
    const { closeTab } = windowSlice.actions
    const index = selectWindowIndex(getState())
    const canCloseTab = selectCanCloseTab(getState())
    if (!canCloseTab) {
      return
    }
    dispatch(closeTab({ index, tabIndex }))
    dispatch(updateApplicationMenu())
  }

export const closeCurrentTab = (): AppThunk => async (dispatch, getState) => {
  const tabIndex = selectTabIndex(getState())
  dispatch(closeTab(tabIndex))
}

export const changeTab =
  (tabIndex: number): AppThunk =>
  async (dispatch, getState) => {
    const { changeTab } = windowSlice.actions
    const index = selectWindowIndex(getState())
    dispatch(changeTab({ index, tabIndex }))
  }

export const changeDirectory =
  (directoryPath: string): AppThunk =>
  async (dispatch, getState) => {
    const index = selectWindowIndex(getState())
    const currentDirectoryPath = selectCurrentDirectoryPath(getState())
    const currentViewMode = selectCurrentViewMode(getState())
    const loading = selectLoading(getState())
    const viewMode = selectGetViewMode(getState())(directoryPath)
    if (loading) {
      return
    }
    const { changeDirectory, setViewMode } = windowSlice.actions
    // inherit view mode if the path is a child of the current directory
    if (directoryPath.startsWith(currentDirectoryPath)) {
      if (!viewMode) {
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

export const go =
  (offset: number): AppThunk =>
  async (dispatch, getState) => {
    const index = selectWindowIndex(getState())
    const loading = selectLoading(getState())
    if (loading) {
      return
    }
    const { go } = windowSlice.actions
    dispatch(go({ index, offset }))
    dispatch(updateApplicationMenu())
  }

export const back = (): AppThunk => async (dispatch) => dispatch(go(-1))

export const forward = (): AppThunk => async (dispatch) => dispatch(go(1))

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
  const canCloseTab = selectCanCloseTab(getState())
  const canForward = selectCanForward(getState())
  const sidebar = selectSidebar(getState())
  const sortOption = selectCurrentSortOption(getState())
  const viewMode = selectCurrentViewMode(getState())
  await window.electronAPI.updateApplicationMenu({
    canBack,
    canCloseTab,
    canForward,
    inspectorHidden: sidebar.primary.hidden,
    navigatorHidden: sidebar.secondary.hidden,
    orderBy: sortOption.orderBy,
    viewMode,
  })
}
