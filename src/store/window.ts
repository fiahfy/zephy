import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit'
import { Content } from '~/interfaces'
import { AppState, AppThunk } from '~/store'
import {
  addTab,
  copyTab,
  removeOtherTabs,
  removeTab,
  selectLoadingByTabId,
} from '~/store/explorer'
import { selectWindowIndex } from '~/store/windowIndex'
import { buildZephyUrl, getTitle } from '~/utils/url'

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
  // TODO: move to tab state
  sorting: SortingState
  tabId: number
  tabs: TabState[]
  // TODO: move to tab state
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
  tabId: 0,
  tabs: [],
  viewMode: {},
}

const initialState: State = {}

export const windowSlice = createSlice({
  name: 'window',
  initialState,
  reducers: {
    replaceState(_state, action: PayloadAction<{ state: State }>) {
      return action.payload.state
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
    newTab(state, action: PayloadAction<{ index: number; tabId: number }>) {
      const { index, tabId } = action.payload
      const window = state[index]
      if (!window) {
        return state
      }
      const tabs = [
        ...window.tabs.slice(0, tabId),
        {
          history: {
            histories: [],
            index: -1,
          },
        },
        ...window.tabs.slice(tabId),
      ]
      return {
        ...state,
        [index]: {
          ...window,
          tabId,
          tabs,
        },
      }
    },
    duplicateTab(
      state,
      action: PayloadAction<{ index: number; tabId: number }>,
    ) {
      const { index, tabId } = action.payload
      const window = state[index]
      if (!window) {
        return state
      }
      const tab = window.tabs[tabId]
      const tabs = [
        ...window.tabs.slice(0, tabId),
        {
          ...tab,
          history: {
            ...tab.history,
            histories: [
              ...tab.history.histories.map((history) => ({ ...history })),
            ],
          },
        },
        ...window.tabs.slice(tabId),
      ]
      const newTabId = tabId + 1
      return {
        ...state,
        [index]: {
          ...window,
          tabId: newTabId,
          tabs,
        },
      }
    },
    closeTab(state, action: PayloadAction<{ index: number; tabId: number }>) {
      const { index, tabId } = action.payload
      const window = state[index]
      if (!window) {
        return state
      }
      const tabs = window.tabs.filter((_, i) => i !== tabId)
      const newTabId = Math.min(
        tabId >= window.tabId ? window.tabId : window.tabId - 1,
        tabs.length - 1,
      )
      return {
        ...state,
        [index]: {
          ...window,
          tabId: newTabId,
          tabs,
        },
      }
    },
    closeOtherTabs(
      state,
      action: PayloadAction<{ index: number; tabId: number }>,
    ) {
      const { index, tabId } = action.payload
      const window = state[index]
      if (!window) {
        return state
      }
      const tabs = window.tabs.filter((_, i) => i === tabId)
      const newTabId = 0
      return {
        ...state,
        [index]: {
          ...window,
          tabId: newTabId,
          tabs,
        },
      }
    },
    changeTab(state, action: PayloadAction<{ index: number; tabId: number }>) {
      const { index, tabId } = action.payload
      const window = state[index]
      if (!window) {
        return state
      }
      return {
        ...state,
        [index]: {
          ...window,
          tabId,
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
      const tab = window.tabs[window.tabId]
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
        i === window.tabId
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
      const tab = window.tabs[window.tabId]
      if (!tab) {
        return state
      }
      const historyIndex = tab.history.index + offset
      const history = tab.history.histories[historyIndex]
      if (!history) {
        return state
      }
      const tabs = window.tabs.map((tab, i) =>
        i === window.tabId
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
    setScrollTop(
      state,
      action: PayloadAction<{ index: number; scrollTop: number }>,
    ) {
      const { index, scrollTop } = action.payload
      const window = state[index]
      if (!window) {
        return state
      }
      const tab = window.tabs[window.tabId]
      if (!tab) {
        return state
      }
      const histories = tab.history.histories.map((history, i) =>
        i === tab.history.index ? { ...history, scrollTop } : history,
      )
      const tabs = window.tabs.map((tab, i) =>
        i === window.tabId
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

export const { replaceState } = windowSlice.actions

export default windowSlice.reducer

export const selectWindow = (state: AppState) => state.window

export const selectCurrentWindow = createSelector(
  selectWindow,
  selectWindowIndex,
  (window, windowIndex) => window[windowIndex] ?? defaultWindowState,
)

export const selectCurrentTabId = createSelector(
  selectCurrentWindow,
  (currentWindow) => currentWindow.tabId,
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

const selectTabId = (_state: AppState, tabId: number) => tabId

export const selectTabByTabId = createSelector(
  selectTabs,
  selectTabId,
  (tabs, tabId) => tabs[tabId] ?? { history: { histories: [], index: -1 } },
)

export const selectCanCloseTab = createSelector(
  selectTabs,
  (tabs) => tabs.length > 1,
)

export const selectDirectoryPaths = createSelector(selectTabs, (tabs) =>
  tabs.reduce((acc, tab) => {
    const directoryPath =
      tab.history.histories[tab.history.index]?.directoryPath
    if (!directoryPath) {
      return acc
    }
    return [...acc, directoryPath]
  }, [] as string[]),
)

export const selectHistoryByTabId = createSelector(selectTabByTabId, (tab) => {
  const history = tab.history
  return (
    history.histories[history.index] ?? {
      directoryPath: '',
      scrollTop: 0,
      title: '',
    }
  )
})

export const selectDirectoryPathByTabId = createSelector(
  selectHistoryByTabId,
  (history) => history.directoryPath,
)

export const selectScrollTopByTabId = createSelector(
  selectHistoryByTabId,
  (history) => history.scrollTop,
)

const selectDirectoryPath = (_state: AppState, directoryPath: string) =>
  directoryPath

export const selectSortOptionByDirectoryPath = createSelector(
  selectSorting,
  selectDirectoryPath,
  (sorting, directoryPath) =>
    sorting[directoryPath] ?? ({ order: 'asc', orderBy: 'name' } as const),
)

export const selectViewModeByDirectoryPath = createSelector(
  selectViewMode,
  selectDirectoryPath,
  (viewMode, directoryPath) => viewMode[directoryPath] ?? 'list',
)

const selectSidebarVariant = (
  _state: AppState,
  variant: 'primary' | 'secondary',
) => variant

export const selectSidebarHiddenByVariant = createSelector(
  selectSidebar,
  selectSidebarVariant,
  (sidebar, variant) => sidebar[variant].hidden,
)

export const selectSidebarWidthByVariant = createSelector(
  selectSidebar,
  selectSidebarVariant,
  (sidebar, variant) => sidebar[variant].width,
)

/* for current tab */

export const selectCurrentTab = (state: AppState) =>
  selectTabByTabId(state, selectCurrentTabId(state))

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

const selectCurrentHistory = (state: AppState) =>
  selectHistoryByTabId(state, selectCurrentTabId(state))

export const selectCurrentDirectoryPath = createSelector(
  selectCurrentHistory,
  (currentHistory) => currentHistory.directoryPath,
)

export const selectCurrentTitle = createSelector(
  selectCurrentHistory,
  (currentHistory) => currentHistory.title,
)

export const selectCurrentSortOption = (state: AppState) =>
  selectSortOptionByDirectoryPath(state, selectCurrentDirectoryPath(state))

export const selectCurrentViewMode = (state: AppState) =>
  selectViewModeByDirectoryPath(state, selectCurrentDirectoryPath(state))

export const newWindow =
  (directoryPath: string): AppThunk =>
  async (dispatch, getState) => {
    const { newWindow } = windowSlice.actions
    const index = selectWindowIndex(getState())
    dispatch(newWindow({ index }))
    dispatch(newTab(directoryPath))
  }

export const newTab =
  (directoryPath: string, targetTabId?: number): AppThunk =>
  async (dispatch, getState) => {
    const { newTab } = windowSlice.actions
    const index = selectWindowIndex(getState())
    const tabs = selectTabs(getState())
    const tabId = (targetTabId ?? tabs.length - 1) + 1
    dispatch(newTab({ index, tabId }))
    dispatch(addTab({ tabId }))
    dispatch(changeDirectory(directoryPath))
  }

export const duplicateTab =
  (tabId: number): AppThunk =>
  async (dispatch, getState) => {
    const { duplicateTab } = windowSlice.actions
    const index = selectWindowIndex(getState())
    dispatch(duplicateTab({ index, tabId }))
    dispatch(copyTab({ tabId }))
    dispatch(updateApplicationMenu())
  }

export const closeTab =
  (targetTabId?: number): AppThunk =>
  async (dispatch, getState) => {
    const { closeTab } = windowSlice.actions
    const index = selectWindowIndex(getState())
    const tabId = targetTabId ?? selectCurrentTabId(getState())
    const canCloseTab = selectCanCloseTab(getState())
    if (!canCloseTab) {
      return
    }
    dispatch(closeTab({ index, tabId }))
    dispatch(removeTab({ tabId }))
    dispatch(updateApplicationMenu())
  }

export const closeOtherTabs =
  (tabId: number): AppThunk =>
  async (dispatch, getState) => {
    const { closeOtherTabs } = windowSlice.actions
    const index = selectWindowIndex(getState())
    dispatch(closeOtherTabs({ index, tabId }))
    dispatch(removeOtherTabs({ tabId }))
    dispatch(updateApplicationMenu())
  }

export const changeTab =
  (tabId: number): AppThunk =>
  async (dispatch, getState) => {
    const { changeTab } = windowSlice.actions
    const index = selectWindowIndex(getState())
    dispatch(changeTab({ index, tabId }))
    dispatch(updateApplicationMenu())
  }

export const changeDirectory =
  (directoryPath: string): AppThunk =>
  async (dispatch, getState) => {
    const index = selectWindowIndex(getState())
    const tabId = selectCurrentTabId(getState())
    const currentDirectoryPath = selectDirectoryPathByTabId(getState(), tabId)
    const currentViewMode = selectViewModeByDirectoryPath(
      getState(),
      currentDirectoryPath,
    )
    const loading = selectLoadingByTabId(getState(), tabId)
    const viewMode = selectViewModeByDirectoryPath(getState(), directoryPath)
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
    const tabId = selectCurrentTabId(getState())
    const loading = selectLoadingByTabId(getState(), tabId)
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

export const setScrollTop =
  (scrollTop: number): AppThunk =>
  async (dispatch, getState) => {
    const { setScrollTop } = windowSlice.actions
    const index = selectWindowIndex(getState())
    dispatch(setScrollTop({ index, scrollTop }))
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
