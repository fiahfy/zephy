import {
  createSelector,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit'
import type { AppState, AppThunk } from '~/store'
import {
  addTab,
  copyTab,
  removeOtherTabs,
  removeSelection,
  removeTab,
  selectCurrentContents,
  selectCurrentLoading,
  selectCurrentSelected,
  unfocus,
} from '~/store/explorer-list'
import { showError } from '~/store/notification'
import { addQuery } from '~/store/query'
import { selectWindowId } from '~/store/window-id'
import { buildZephyUrl, getTitle } from '~/utils/url'
import { changeFavoritePath } from './favorite'
import { changeRatingPath } from './rating'

type History = {
  query: string
  scrollPosition: number
  title: string
  url: string
}

type HistoryState = {
  histories: History[]
  index: number
}

type TabState = {
  history: HistoryState
  id: number
  sorting: SortingState
  viewMode: ViewModeState
}

type SidebarState = {
  hidden: boolean
  width: number
}

type SortOption = {
  order: 'asc' | 'desc'
  orderBy:
    | 'dateCreated'
    | 'dateLastOpened'
    | 'dateModified'
    | 'name'
    | 'score'
    | 'size'
}

type SortingState = {
  [url: string]: SortOption
}

type ViewMode = 'gallery' | 'list' | 'thumbnail'

type ViewModeState = {
  [url: string]: ViewMode
}

type WindowState = {
  sidebar: {
    primary: SidebarState
    secondary: SidebarState
  }
  tabId: number
  tabs: TabState[]
}

type State = {
  [id: number]: WindowState
}

const initialState: State = {}

const defaultOrders = {
  dateCreated: 'desc',
  dateLastOpened: 'desc',
  dateModified: 'desc',
  name: 'asc',
  score: 'desc',
  size: 'desc',
} as const

const defaultSortOption = { order: 'asc', orderBy: 'name' }

const defaultViewMode = 'list'

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
  tabId: 0,
  tabs: [],
}

const findMissingTabId = (tabs: TabState[]) =>
  tabs
    .map((tab) => tab.id)
    .toSorted((a, b) => a - b)
    .reduce((acc, i) => (i === acc ? acc + 1 : acc), 1)

export const windowSlice = createSlice({
  name: 'window',
  initialState,
  reducers: {
    replaceState(_state, action: PayloadAction<{ state: State }>) {
      return action.payload.state
    },
    newWindow(state, action: PayloadAction<{ id: number }>) {
      const { id } = action.payload
      return {
        ...state,
        [id]: {
          ...defaultWindowState,
        },
      }
    },
    newTab(state, action: PayloadAction<{ id: number; srcTabId?: number }>) {
      const { id, srcTabId } = action.payload
      const window = state[id]
      if (!window) {
        return state
      }
      const tabIndex = srcTabId
        ? window.tabs.findIndex((tab) => tab.id === srcTabId)
        : window.tabs.length - 1
      const tabId = findMissingTabId(window.tabs)
      const tabs = [
        ...window.tabs.slice(0, tabIndex + 1),
        {
          history: {
            histories: [],
            index: -1,
          },
          id: tabId,
          sorting: {},
          viewMode: {},
        },
        ...window.tabs.slice(tabIndex + 1),
      ]
      return {
        ...state,
        [id]: {
          ...window,
          tabId,
          tabs,
        },
      }
    },
    duplicateTab(
      state,
      action: PayloadAction<{ id: number; srcTabId: number }>,
    ) {
      const { id, srcTabId } = action.payload
      const window = state[id]
      if (!window) {
        return state
      }
      const tabIndex = window.tabs.findIndex((tab) => tab.id === srcTabId)
      if (tabIndex === -1) {
        return state
      }
      const tabId = findMissingTabId(window.tabs)
      const tab = window.tabs[tabIndex]
      const tabs = [
        ...window.tabs.slice(0, tabIndex + 1),
        {
          ...tab,
          history: {
            ...tab.history,
            histories: [
              ...tab.history.histories.map((history) => ({ ...history })),
            ],
          },
          id: tabId,
        },
        ...window.tabs.slice(tabIndex + 1),
      ]
      return {
        ...state,
        [id]: {
          ...window,
          tabId,
          tabs,
        },
      }
    },
    moveTab(
      state,
      action: PayloadAction<{
        id: number
        activeTabId: number
        overTabId: number
      }>,
    ) {
      const { id, activeTabId, overTabId } = action.payload
      const window = state[id]
      if (!window) {
        return state
      }
      const activeTabIndex = window.tabs.findIndex(
        (tab) => tab.id === activeTabId,
      )
      const overTabIndex = window.tabs.findIndex((tab) => tab.id === overTabId)
      if (activeTabIndex === -1 || overTabIndex === -1) {
        return state
      }
      const activeTab = window.tabs[activeTabIndex]
      const updatingTabs = window.tabs.filter((_, i) => i !== activeTabIndex)
      const tabs = [
        ...updatingTabs.slice(0, overTabIndex),
        activeTab,
        ...updatingTabs.slice(overTabIndex),
      ]
      return {
        ...state,
        [id]: {
          ...window,
          tabs,
        },
      }
    },
    closeTab(state, action: PayloadAction<{ id: number; tabId: number }>) {
      const { id, tabId } = action.payload
      const window = state[id]
      if (!window) {
        return state
      }
      const tabIndex = window.tabs.findIndex((tab) => tab.id === tabId)
      const tabs = window.tabs.filter((_, i) => i !== tabIndex)
      const newTabId =
        tabId !== window.tabId
          ? window.tabId
          : tabs[tabIndex]
            ? tabs[tabIndex].id
            : tabs[tabs.length - 1].id
      return {
        ...state,
        [id]: {
          ...window,
          tabId: newTabId,
          tabs,
        },
      }
    },
    closeOtherTabs(
      state,
      action: PayloadAction<{ id: number; tabId: number }>,
    ) {
      const { id, tabId } = action.payload
      const window = state[id]
      if (!window) {
        return state
      }
      const tabs = window.tabs.filter((tab) => tab.id === tabId)
      return {
        ...state,
        [id]: {
          ...window,
          tabId,
          tabs,
        },
      }
    },
    changeTab(state, action: PayloadAction<{ id: number; tabId: number }>) {
      const { id, tabId } = action.payload
      const window = state[id]
      if (!window) {
        return state
      }
      return {
        ...state,
        [id]: {
          ...window,
          tabId,
        },
      }
    },
    changeUrl(
      state,
      action: PayloadAction<{
        id: number
        url: string
        title: string
      }>,
    ) {
      const { id, url, title } = action.payload
      const window = state[id]
      if (!window) {
        return state
      }
      const tab = window.tabs.find((tab) => tab.id === window.tabId)
      if (!tab) {
        return state
      }
      const currentUrl = tab.history.histories[tab.history.index]?.url
      if (url === currentUrl) {
        return
      }
      const historyIndex = tab.history.index + 1
      const histories = [
        ...tab.history.histories.slice(0, historyIndex),
        { query: '', scrollPosition: 0, title, url },
      ]
      const tabs = window.tabs.map((tab) =>
        tab.id === window.tabId
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
        [id]: {
          ...window,
          tabs,
        },
      }
    },
    go(state, action: PayloadAction<{ id: number; offset: number }>) {
      const { id, offset } = action.payload
      const window = state[id]
      if (!window) {
        return state
      }
      const tab = window.tabs.find((tab) => tab.id === window.tabId)
      if (!tab) {
        return state
      }
      const historyIndex = tab.history.index + offset
      const history = tab.history.histories[historyIndex]
      if (!history) {
        return state
      }
      const tabs = window.tabs.map((tab) =>
        tab.id === window.tabId
          ? {
              ...tab,
              history: { ...tab.history, index: historyIndex },
            }
          : tab,
      )
      return {
        ...state,
        [id]: {
          ...window,
          tabs,
        },
      }
    },
    setQuery(state, action: PayloadAction<{ id: number; query: string }>) {
      const { id, query } = action.payload
      const window = state[id]
      if (!window) {
        return state
      }
      const tab = window.tabs.find((tab) => tab.id === window.tabId)
      if (!tab) {
        return state
      }
      const histories = tab.history.histories.map((history, i) =>
        i === tab.history.index ? { ...history, query } : history,
      )
      const tabs = window.tabs.map((tab) =>
        tab.id === window.tabId
          ? {
              ...tab,
              history: { ...tab.history, histories },
            }
          : tab,
      )
      return {
        ...state,
        [id]: {
          ...window,
          tabs,
        },
      }
    },
    setScrollPosition(
      state,
      action: PayloadAction<{ id: number; scrollPosition: number }>,
    ) {
      const { id, scrollPosition } = action.payload
      const window = state[id]
      if (!window) {
        return state
      }
      const tab = window.tabs.find((tab) => tab.id === window.tabId)
      if (!tab) {
        return state
      }
      const histories = tab.history.histories.map((history, i) =>
        i === tab.history.index ? { ...history, scrollPosition } : history,
      )
      const tabs = window.tabs.map((tab) =>
        tab.id === window.tabId
          ? {
              ...tab,
              history: { ...tab.history, histories },
            }
          : tab,
      )
      return {
        ...state,
        [id]: {
          ...window,
          tabs,
        },
      }
    },
    sort(
      state,
      action: PayloadAction<{
        id: number
        url: string
        orderBy: SortOption['orderBy']
      }>,
    ) {
      const { id, url, orderBy } = action.payload
      const window = state[id]
      if (!window) {
        return state
      }
      const tab = window.tabs.find((tab) => tab.id === window.tabId)
      if (!tab) {
        return state
      }
      const option = tab.sorting[url]
      const newOrder =
        option && option.orderBy === orderBy
          ? option.order === 'desc'
            ? 'asc'
            : 'desc'
          : defaultOrders[orderBy as keyof typeof defaultOrders]
      const tabs = window.tabs.map((tab) =>
        tab.id === window.tabId
          ? {
              ...tab,
              sorting: {
                ...tab.sorting,
                [url]: {
                  order: newOrder,
                  orderBy,
                },
              },
            }
          : tab,
      )
      return {
        ...state,
        [id]: {
          ...window,
          tabs,
        },
      }
    },
    setViewMode(
      state,
      action: PayloadAction<{
        id: number
        url: string
        viewMode: ViewMode
      }>,
    ) {
      const { id, url, viewMode } = action.payload
      const window = state[id]
      if (!window) {
        return state
      }
      const tab = window.tabs.find((tab) => tab.id === window.tabId)
      if (!tab) {
        return state
      }
      const tabs = window.tabs.map((tab) =>
        tab.id === window.tabId
          ? {
              ...tab,
              viewMode: {
                ...tab.viewMode,
                [url]: viewMode,
              },
            }
          : tab,
      )
      return {
        ...state,
        [id]: {
          ...window,
          tabs,
        },
      }
    },
    setSidebarHidden(
      state,
      action: PayloadAction<{
        id: number
        variant: 'primary' | 'secondary'
        hidden: boolean
      }>,
    ) {
      const { id, variant, hidden } = action.payload
      const window = state[id]
      if (!window) {
        return state
      }
      return {
        ...state,
        [id]: {
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
        id: number
        variant: 'primary' | 'secondary'
        width: number
      }>,
    ) {
      const { id, variant, width } = action.payload
      const window = state[id]
      if (!window) {
        return state
      }
      return {
        ...state,
        [id]: {
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
  },
})

export const { replaceState } = windowSlice.actions

export default windowSlice.reducer

export const selectWindow = (state: AppState) => state.window

export const selectCurrentWindow = createSelector(
  selectWindow,
  selectWindowId,
  (window, windowId) => window[windowId] ?? defaultWindowState,
)

export const selectCurrentTabId = createSelector(
  selectCurrentWindow,
  (currentWindow) => currentWindow.tabId,
)

export const selectSidebar = createSelector(
  selectCurrentWindow,
  (currentWindow) => currentWindow.sidebar,
)

export const selectTabs = createSelector(
  selectCurrentWindow,
  (currentWindow) => currentWindow.tabs,
)

export const selectDirectoryPaths = createSelector(
  selectTabs,
  (state: AppState) => state,
  (tabs, state) =>
    tabs
      .map((tab) => selectDirectoryPathByTabId(state, tab.id))
      .filter((url): url is string => typeof url === 'string'),
)

export const selectCanCloseTab = createSelector(
  selectTabs,
  (tabs) => tabs.length > 1,
)

// Selectors by variant

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

// Selector by tabId

const selectTabId = (_state: AppState, tabId: number) => tabId

export const selectTabByTabId = createSelector(
  selectTabs,
  selectTabId,
  (tabs, tabId) =>
    tabs.find((tab) => tab.id === tabId) ?? {
      history: { histories: [], index: -1 },
      id: 0,
      sorting: {},
      viewMode: {},
    },
)

export const selectCanBackByTabId = createSelector(
  selectTabByTabId,
  (tab) => tab.history.index > 0,
)

export const selectCanForwardByTabId = createSelector(
  selectTabByTabId,
  (tab) => tab.history.index < tab.history.histories.length - 1,
)

export const selectBackHistoriesByTabId = createSelector(
  selectTabByTabId,
  (tab) => tab.history.histories.slice(0, tab.history.index).toReversed(),
)

export const selectForwardHistoriesByTabId = createSelector(
  selectTabByTabId,
  (tab) => tab.history.histories.slice(tab.history.index + 1),
)

export const selectHistoryByTabId = createSelector(selectTabByTabId, (tab) => {
  const history = tab.history
  return (
    history.histories[history.index] ?? {
      query: '',
      scrollPosition: 0,
      title: '',
      url: '',
    }
  )
})

export const selectUrlByTabId = createSelector(
  selectHistoryByTabId,
  (history) => history.url,
)

export const selectDirectoryPathByTabId = createSelector(
  selectHistoryByTabId,
  (history) => window.electronAPI.fileURLToPath(history.url),
)

export const selectQueryByTabId = createSelector(
  selectHistoryByTabId,
  (history) => history.query,
)

export const selectTitleByTabId = createSelector(
  selectHistoryByTabId,
  (history) => history.title,
)

export const selectScrollPositionByTabId = createSelector(
  selectHistoryByTabId,
  (history) => history.scrollPosition,
)

// Selectors by tabId and url

const selectUrl = (_state: AppState, _tabId: number, url: string) => url

export const selectSortOptionByTabIdAndUrl = createSelector(
  selectTabByTabId,
  selectUrl,
  (tab, url) => tab.sorting[url] ?? defaultSortOption,
)

export const selectViewModeByTabIdAndUrl = createSelector(
  selectTabByTabId,
  selectUrl,
  (tab, url) => tab.viewMode[url] ?? defaultViewMode,
)

// Selector for current tab

export const selectCurrentTab = createSelector(
  (state: AppState) => state,
  selectCurrentTabId,
  (state, tabId) => selectTabByTabId(state, tabId),
)

export const selectCurrentHistory = createSelector(
  (state: AppState) => state,
  selectCurrentTabId,
  (state, tabId) => selectHistoryByTabId(state, tabId),
)

export const selectCurrentCanBack = createSelector(
  (state: AppState) => state,
  selectCurrentTabId,
  (state, tabId) => selectCanBackByTabId(state, tabId),
)

export const selectCurrentCanForward = createSelector(
  (state: AppState) => state,
  selectCurrentTabId,
  (state, tabId) => selectCanForwardByTabId(state, tabId),
)

export const selectCurrentBackHistories = createSelector(
  (state: AppState) => state,
  selectCurrentTabId,
  (state, tabId) => selectBackHistoriesByTabId(state, tabId),
)

export const selectCurrentForwardHistories = createSelector(
  (state: AppState) => state,
  selectCurrentTabId,
  (state, tabId) => selectForwardHistoriesByTabId(state, tabId),
)

export const selectCurrentUrl = createSelector(
  (state: AppState) => state,
  selectCurrentTabId,
  (state, tabId) => selectUrlByTabId(state, tabId),
)

export const selectCurrentDirectoryPath = createSelector(
  (state: AppState) => state,
  selectCurrentTabId,
  (state, tabId) => selectDirectoryPathByTabId(state, tabId),
)

export const selectCurrentQuery = createSelector(
  (state: AppState) => state,
  selectCurrentTabId,
  (state, tabId) => selectQueryByTabId(state, tabId),
)

export const selectCurrentTitle = createSelector(
  (state: AppState) => state,
  selectCurrentTabId,
  (state, tabId) => selectTitleByTabId(state, tabId),
)

export const selectCurrentSortOption = createSelector(
  (state: AppState) => state,
  selectCurrentTabId,
  selectCurrentUrl,
  (state, tabId, url) => selectSortOptionByTabIdAndUrl(state, tabId, url),
)

export const selectCurrentViewMode = createSelector(
  (state: AppState) => state,
  selectCurrentTabId,
  selectCurrentUrl,
  (state, tabId, url) => selectViewModeByTabIdAndUrl(state, tabId, url),
)

// Operations for windows & tabs

export const newWindow =
  (url: string): AppThunk =>
  async (dispatch, getState) => {
    const { newWindow } = windowSlice.actions

    const id = selectWindowId(getState())
    dispatch(newWindow({ id }))
    dispatch(newTab(url))
  }

export const newWindowWithDirectoryPath =
  (directoryPath: string): AppThunk =>
  async (dispatch, getState) => {
    const { newWindow } = windowSlice.actions

    const id = selectWindowId(getState())
    dispatch(newWindow({ id }))
    dispatch(newTabWithDirectoryPath(directoryPath))
  }

export const newTab =
  (url: string, srcTabId?: number): AppThunk =>
  async (dispatch, getState) => {
    const { newTab } = windowSlice.actions

    const id = selectWindowId(getState())
    dispatch(newTab({ id, srcTabId }))
    const tabId = selectCurrentTabId(getState())
    dispatch(addTab({ tabId }))
    dispatch(changeUrl(url))
  }

export const newTabWithDirectoryPath =
  (directoryPath: string, srcTabId?: number): AppThunk =>
  async (dispatch) => {
    try {
      const url = window.electronAPI.pathToFileURL(directoryPath)
      dispatch(newTab(url, srcTabId))
    } catch (e) {
      showError(e)
    }
  }

export const duplicateTab =
  (srcTabId: number): AppThunk =>
  async (dispatch, getState) => {
    const { duplicateTab } = windowSlice.actions

    const id = selectWindowId(getState())
    dispatch(duplicateTab({ id, srcTabId }))
    const destTabId = selectCurrentTabId(getState())
    dispatch(copyTab({ srcTabId, destTabId }))
  }

export const moveTab =
  (activeTabId: number, overTabId: number): AppThunk =>
  async (dispatch, getState) => {
    const { moveTab } = windowSlice.actions

    const id = selectWindowId(getState())
    dispatch(moveTab({ id, activeTabId, overTabId }))
  }

export const closeTab =
  (tabId?: number): AppThunk =>
  async (dispatch, getState) => {
    const { closeTab } = windowSlice.actions

    const id = selectWindowId(getState())
    const targetTabId = tabId ?? selectCurrentTabId(getState())
    const canCloseTab = selectCanCloseTab(getState())
    if (!canCloseTab) {
      return
    }

    dispatch(closeTab({ id, tabId: targetTabId }))
    dispatch(removeTab({ tabId: targetTabId }))
  }

export const closeOtherTabs =
  (tabId: number): AppThunk =>
  async (dispatch, getState) => {
    const { closeOtherTabs } = windowSlice.actions

    const id = selectWindowId(getState())
    dispatch(closeOtherTabs({ id, tabId }))
    dispatch(removeOtherTabs({ tabId }))
  }

export const changeTab =
  (tabId: number): AppThunk =>
  async (dispatch, getState) => {
    const { changeTab } = windowSlice.actions

    const id = selectWindowId(getState())
    dispatch(changeTab({ id, tabId }))
  }

// Operations for sidebar

export const setSidebarHidden =
  (variant: 'primary' | 'secondary', hidden: boolean): AppThunk =>
  async (dispatch, getState) => {
    const { setSidebarHidden } = windowSlice.actions

    const id = selectWindowId(getState())
    dispatch(setSidebarHidden({ id, variant, hidden }))
  }

export const setSidebarWidth =
  (variant: 'primary' | 'secondary', width: number): AppThunk =>
  async (dispatch, getState) => {
    const { setSidebarWidth } = windowSlice.actions

    const id = selectWindowId(getState())
    dispatch(setSidebarWidth({ id, variant, width }))
  }

// Operations for current tab

export const changeUrl =
  (url: string): AppThunk =>
  async (dispatch, getState) => {
    const { changeUrl } = windowSlice.actions

    const id = selectWindowId(getState())
    const loading = selectCurrentLoading(getState())
    if (loading) {
      return
    }

    const title = await getTitle(url)
    dispatch(changeUrl({ id, title, url }))
  }

export const changeDirectoryPath =
  (directoryPath: string): AppThunk =>
  async (dispatch) => {
    try {
      const url = window.electronAPI.pathToFileURL(directoryPath)
      dispatch(changeUrl(url))
    } catch (e) {
      dispatch(showError(e))
    }
  }

export const go =
  (offset: number): AppThunk =>
  async (dispatch, getState) => {
    const { go } = windowSlice.actions

    const id = selectWindowId(getState())
    const loading = selectCurrentLoading(getState())
    if (loading) {
      return
    }

    dispatch(go({ id, offset }))
  }

export const back = (): AppThunk => async (dispatch) => dispatch(go(-1))

export const forward = (): AppThunk => async (dispatch) => dispatch(go(1))

export const upward = (): AppThunk => async (dispatch, getState) => {
  const currentDirectoryPath = selectCurrentDirectoryPath(getState())
  if (!currentDirectoryPath) {
    return
  }

  try {
    const parent = await window.entryAPI.getParentEntry(currentDirectoryPath)
    dispatch(changeUrl(parent.url))
  } catch (e) {
    showError(e)
  }
}

export const goToRatings =
  (score: number): AppThunk =>
  async (dispatch) =>
    dispatch(
      changeUrl(buildZephyUrl({ pathname: 'ratings', params: { score } })),
    )

export const openRatings =
  (score: number): AppThunk =>
  async (dispatch) =>
    dispatch(newTab(buildZephyUrl({ pathname: 'ratings', params: { score } })))

export const goToSettings = (): AppThunk => async (dispatch) =>
  dispatch(changeUrl(buildZephyUrl({ pathname: 'settings' })))

export const setScrollPosition =
  (scrollPosition: number): AppThunk =>
  async (dispatch, getState) => {
    const { setScrollPosition } = windowSlice.actions

    const id = selectWindowId(getState())
    dispatch(setScrollPosition({ id, scrollPosition }))
  }

export const search =
  (query: string): AppThunk =>
  async (dispatch, getState) => {
    const { setQuery } = windowSlice.actions

    const id = selectWindowId(getState())
    const tabId = selectCurrentTabId(getState())
    dispatch(setQuery({ id, query }))
    dispatch(addQuery({ query }))
    const selected = selectCurrentSelected(getState())
    const contents = selectCurrentContents(getState())
    const paths = contents.reduce(
      (acc, content) => acc.filter((path) => path !== content.path),
      selected,
    )
    dispatch(removeSelection({ tabId, paths }))
    dispatch(unfocus({ tabId, paths }))
  }

export const sort =
  (orderBy: SortOption['orderBy']): AppThunk =>
  async (dispatch, getState) => {
    const { sort } = windowSlice.actions

    const id = selectWindowId(getState())
    const currentUrl = selectCurrentUrl(getState())
    dispatch(
      sort({
        id,
        url: currentUrl,
        orderBy,
      }),
    )
  }

export const setCurrentViewMode =
  (viewMode: ViewMode): AppThunk =>
  async (dispatch, getState) => {
    const { setViewMode } = windowSlice.actions

    const id = selectWindowId(getState())
    const currentUrl = selectCurrentUrl(getState())
    dispatch(setViewMode({ id, url: currentUrl, viewMode }))
  }

// Operations for anywhere

export const move =
  (paths: string[], directoryPath: string): AppThunk =>
  async (dispatch) => {
    for (const path of paths) {
      try {
        const entry = await window.entryAPI.moveEntry(path, directoryPath)
        dispatch(changeFavoritePath({ oldPath: path, newPath: entry.path }))
        dispatch(changeRatingPath({ oldPath: path, newPath: entry.path }))
      } catch (e) {
        dispatch(showError(e))
      }
    }
  }

export const updateApplicationMenu = (): AppThunk => async (_, getState) => {
  const canBack = selectCurrentCanBack(getState())
  const canCloseTab = selectCanCloseTab(getState())
  const canForward = selectCurrentCanForward(getState())
  const sidebar = selectSidebar(getState())
  const sortOption = selectCurrentSortOption(getState())
  const viewMode = selectCurrentViewMode(getState())

  window.applicationMenuAPI.update({
    canBack,
    canCloseTab,
    canForward,
    inspectorHidden: sidebar.secondary.hidden,
    navigatorHidden: sidebar.primary.hidden,
    orderBy: sortOption.orderBy,
    viewMode,
  })
}
