import {
  type PayloadAction,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit'
import type { Content } from '~/interfaces'
import type { AppState, AppThunk } from '~/store'
import {
  addTab,
  copyTab,
  removeOtherTabs,
  removeTab,
  selectCurrentContents,
  selectCurrentLoading,
  selectCurrentSelected,
  unfocus,
  unselect,
} from '~/store/explorer-list'
import { addQuery } from '~/store/query'
import { selectWindowId } from '~/store/windowId'
import { buildZephyUrl, getTitle } from '~/utils/url'

type History = {
  directoryPath: string
  query: string
  scrollTop: number
  title: string
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
  tabId: number
  tabs: TabState[]
}

type State = {
  [id: number]: WindowState
}

const initialState: State = {}

const defaultOrders = {
  name: 'asc',
  dateLastOpened: 'desc',
  dateModified: 'desc',
  dateCreated: 'desc',
  score: 'desc',
  size: 'desc',
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
  tabId: 0,
  tabs: [],
}

const findMissingTabId = (tabs: TabState[]) =>
  tabs
    .map((tab) => tab.id)
    .sort((a, b) => a - b)
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
    changeDirectory(
      state,
      action: PayloadAction<{
        id: number
        directoryPath: string
        title: string
      }>,
    ) {
      const { id, directoryPath, title } = action.payload
      const window = state[id]
      if (!window) {
        return state
      }
      const tab = window.tabs.find((tab) => tab.id === window.tabId)
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
        { directoryPath, query: '', scrollTop: 0, title },
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
    setScrollTop(
      state,
      action: PayloadAction<{ id: number; scrollTop: number }>,
    ) {
      const { id, scrollTop } = action.payload
      const window = state[id]
      if (!window) {
        return state
      }
      const tab = window.tabs.find((tab) => tab.id === window.tabId)
      if (!tab) {
        return state
      }
      const histories = tab.history.histories.map((history, i) =>
        i === tab.history.index ? { ...history, scrollTop } : history,
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
        directoryPath: string
        orderBy: SortOption['orderBy']
      }>,
    ) {
      const { id, directoryPath, orderBy } = action.payload
      const window = state[id]
      if (!window) {
        return state
      }
      const tab = window.tabs.find((tab) => tab.id === window.tabId)
      if (!tab) {
        return state
      }
      const option = tab.sorting[directoryPath]
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
                [directoryPath]: {
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
        directoryPath: string
        viewMode: ViewMode
      }>,
    ) {
      const { id, directoryPath, viewMode } = action.payload
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
                [directoryPath]: viewMode,
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

// selectTabs

export const selectTabs = createSelector(
  selectCurrentWindow,
  (currentWindow) => currentWindow.tabs,
)

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

export const selectCanCloseTab = createSelector(
  selectTabs,
  (tabs) => tabs.length > 1,
)

export const selectDirectoryPaths = createSelector(selectTabs, (tabs) =>
  tabs.reduce((acc, tab) => {
    const directoryPath =
      tab.history.histories[tab.history.index]?.directoryPath
    if (directoryPath) {
      acc.push(directoryPath)
    }
    return acc
  }, [] as string[]),
)

export const selectHistoryByTabId = createSelector(selectTabByTabId, (tab) => {
  const history = tab.history
  return (
    history.histories[history.index] ?? {
      directoryPath: '',
      query: '',
      scrollTop: 0,
      title: '',
    }
  )
})

export const selectDirectoryPathByTabId = createSelector(
  selectHistoryByTabId,
  (history) => history.directoryPath,
)

export const selectQueryByTabId = createSelector(
  selectHistoryByTabId,
  (history) => history.query,
)

export const selectScrollTopByTabId = createSelector(
  selectHistoryByTabId,
  (history) => history.scrollTop,
)

const selectDirectoryPath = (
  _state: AppState,
  _tabId: number,
  directoryPath: string,
) => directoryPath

export const selectSortOptionByTabIdAndDirectoryPath = createSelector(
  selectTabByTabId,
  selectDirectoryPath,
  (tab, directoryPath) =>
    tab.sorting[directoryPath] ?? ({ order: 'asc', orderBy: 'name' } as const),
)

export const selectViewModeByTabIdAndDirectoryPath = createSelector(
  selectTabByTabId,
  selectDirectoryPath,
  (tab, directoryPath) => tab.viewMode[directoryPath] ?? 'list',
)

// selectSidebar

export const selectSidebar = createSelector(
  selectCurrentWindow,
  (currentWindow) => currentWindow.sidebar,
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

// selectCurrentTabId

export const selectCurrentTabId = createSelector(
  selectCurrentWindow,
  (currentWindow) => currentWindow.tabId,
)

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

export const selectCurrentQuery = createSelector(
  selectCurrentHistory,
  (currentHistory) => currentHistory.query,
)

export const selectCurrentTitle = createSelector(
  selectCurrentHistory,
  (currentHistory) => currentHistory.title,
)

export const selectCurrentSortOption = (state: AppState) =>
  selectSortOptionByTabIdAndDirectoryPath(
    state,
    selectCurrentTabId(state),
    selectCurrentDirectoryPath(state),
  )

export const selectCurrentViewMode = (state: AppState) =>
  selectViewModeByTabIdAndDirectoryPath(
    state,
    selectCurrentTabId(state),
    selectCurrentDirectoryPath(state),
  )

export const newWindow =
  (directoryPath: string): AppThunk =>
  async (dispatch, getState) => {
    const { newWindow } = windowSlice.actions
    const id = selectWindowId(getState())
    dispatch(newWindow({ id }))
    dispatch(newTab(directoryPath))
  }

export const newTab =
  (directoryPath: string, srcTabId?: number): AppThunk =>
  async (dispatch, getState) => {
    const { newTab } = windowSlice.actions
    const id = selectWindowId(getState())
    dispatch(newTab({ id, srcTabId }))
    const tabId = selectCurrentTabId(getState())
    dispatch(addTab({ tabId }))
    dispatch(changeDirectory(directoryPath))
  }

export const duplicateTab =
  (srcTabId: number): AppThunk =>
  async (dispatch, getState) => {
    const { duplicateTab } = windowSlice.actions
    const id = selectWindowId(getState())
    dispatch(duplicateTab({ id, srcTabId }))
    const destTabId = selectCurrentTabId(getState())
    dispatch(copyTab({ srcTabId, destTabId }))
    dispatch(updateApplicationMenu())
  }

export const closeTab =
  (targetTabId?: number): AppThunk =>
  async (dispatch, getState) => {
    const { closeTab } = windowSlice.actions
    const id = selectWindowId(getState())
    const tabId = targetTabId ?? selectCurrentTabId(getState())
    const canCloseTab = selectCanCloseTab(getState())
    if (!canCloseTab) {
      return
    }
    dispatch(closeTab({ id, tabId }))
    dispatch(removeTab({ tabId }))
    dispatch(updateApplicationMenu())
  }

export const closeOtherTabs =
  (tabId: number): AppThunk =>
  async (dispatch, getState) => {
    const { closeOtherTabs } = windowSlice.actions
    const id = selectWindowId(getState())
    dispatch(closeOtherTabs({ id, tabId }))
    dispatch(removeOtherTabs({ tabId }))
    dispatch(updateApplicationMenu())
  }

export const changeTab =
  (tabId: number): AppThunk =>
  async (dispatch, getState) => {
    const { changeTab } = windowSlice.actions
    const id = selectWindowId(getState())
    dispatch(changeTab({ id, tabId }))
    dispatch(updateApplicationMenu())
  }

export const changeDirectory =
  (directoryPath: string): AppThunk =>
  async (dispatch, getState) => {
    const { changeDirectory } = windowSlice.actions
    const id = selectWindowId(getState())
    const loading = selectCurrentLoading(getState())
    if (loading) {
      return
    }
    const title = await getTitle(directoryPath)
    dispatch(changeDirectory({ id, directoryPath, title }))
    dispatch(updateApplicationMenu())
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
    const id = selectWindowId(getState())
    dispatch(setScrollTop({ id, scrollTop }))
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
    dispatch(unfocus({ tabId, paths }))
    dispatch(unselect({ tabId, paths }))
  }

export const sort =
  (orderBy: SortOption['orderBy']): AppThunk =>
  async (dispatch, getState) => {
    const { sort } = windowSlice.actions
    const id = selectWindowId(getState())
    const currentDirectoryPath = selectCurrentDirectoryPath(getState())
    dispatch(
      sort({
        id,
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
    const id = selectWindowId(getState())
    const currentDirectoryPath = selectCurrentDirectoryPath(getState())
    dispatch(setViewMode({ id, directoryPath: currentDirectoryPath, viewMode }))
    dispatch(updateApplicationMenu())
  }

export const setSidebarHidden =
  (variant: 'primary' | 'secondary', hidden: boolean): AppThunk =>
  async (dispatch, getState) => {
    const { setSidebarHidden } = windowSlice.actions
    const id = selectWindowId(getState())
    dispatch(setSidebarHidden({ id, variant, hidden }))
    dispatch(updateApplicationMenu())
  }

export const setSidebarWidth =
  (variant: 'primary' | 'secondary', width: number): AppThunk =>
  async (dispatch, getState) => {
    const { setSidebarWidth } = windowSlice.actions
    const id = selectWindowId(getState())
    dispatch(setSidebarWidth({ id, variant, width }))
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
