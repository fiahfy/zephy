import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit'

import { Content, DetailedEntry } from 'interfaces'
import { AppState, AppThunk } from 'store'
import { add } from 'store/queryHistory'
import { selectGetRating } from 'store/rating'
import { selectShouldShowHiddenFiles } from 'store/settings'
import { selectWindowIndex } from 'store/windowIndex'
import { isHiddenFile } from 'utils/file'

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

const initialState: State = {}

export const windowSlice = createSlice({
  name: 'window',
  initialState,
  reducers: {
    setQuery(
      state,
      action: PayloadAction<{ windowIndex: number; query: string }>
    ) {
      const { windowIndex, query } = action.payload
      const windowState = state[windowIndex]
      if (!windowState) {
        return state
      }
      return {
        ...state,
        [windowIndex]: {
          ...defaultState,
          ...windowState,
          query,
        },
      }
    },
    setViewMode(
      state,
      action: PayloadAction<{
        windowIndex: number
        viewMode: WindowState['viewMode']
      }>
    ) {
      const { windowIndex, viewMode } = action.payload
      const windowState = state[windowIndex]
      if (!windowState) {
        return state
      }
      return {
        ...state,
        [windowIndex]: {
          ...defaultState,
          ...windowState,
          viewMode,
        },
      }
    },
    setSidebarHidden(
      state,
      action: PayloadAction<{
        windowIndex: number
        variant: 'primary' | 'secondary'
        hidden: boolean
      }>
    ) {
      const { windowIndex, variant, hidden } = action.payload
      const windowState = state[windowIndex]
      if (!windowState) {
        return state
      }
      return {
        ...state,
        [windowIndex]: {
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
        windowIndex: number
        variant: 'primary' | 'secondary'
        width: number
      }>
    ) {
      const { windowIndex, variant, width } = action.payload
      const windowState = state[windowIndex]
      if (!windowState) {
        return state
      }
      return {
        ...state,
        [windowIndex]: {
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
      action: PayloadAction<{ windowIndex: number; entries: DetailedEntry[] }>
    ) {
      const { windowIndex, entries } = action.payload
      const windowState = state[windowIndex]
      if (!windowState) {
        return state
      }
      return {
        ...state,
        [windowIndex]: {
          ...defaultState,
          ...windowState,
          entries,
          loading: false,
          query: '',
        },
      }
    },
    loading(state, action: PayloadAction<{ windowIndex: number }>) {
      const { windowIndex } = action.payload
      const windowState = state[windowIndex]
      if (!windowState) {
        return state
      }
      return {
        ...state,
        [windowIndex]: {
          ...defaultState,
          ...windowState,
          entries: [],
          loading: true,
        },
      }
    },
    add(
      state,
      action: PayloadAction<{ windowIndex: number; entries: DetailedEntry[] }>
    ) {
      const { windowIndex, entries } = action.payload
      const windowState = state[windowIndex]
      if (!windowState) {
        return state
      }
      const paths = entries.map((entry) => entry.path)
      const newEntries = [
        ...windowState.entries.filter((entry) => !paths.includes(entry.path)),
        ...entries,
      ]
      return {
        ...state,
        [windowIndex]: {
          ...defaultState,
          ...windowState,
          entries: newEntries,
        },
      }
    },
    remove(
      state,
      action: PayloadAction<{ windowIndex: number; paths: string[] }>
    ) {
      const { windowIndex, paths } = action.payload
      const windowState = state[windowIndex]
      if (!windowState) {
        return state
      }
      const entries = windowState.entries.filter(
        (entry) => !paths.includes(entry.path)
      )
      return {
        ...state,
        [windowIndex]: {
          ...defaultState,
          ...windowState,
          entries,
        },
      }
    },
    select(
      state,
      action: PayloadAction<{ windowIndex: number; path: string }>
    ) {
      const { windowIndex, path } = action.payload
      const windowState = state[windowIndex]
      if (!windowState) {
        return state
      }
      return {
        ...state,
        [windowIndex]: {
          ...defaultState,
          ...windowState,
          selected: [path],
        },
      }
    },
    multiSelect(
      state,
      action: PayloadAction<{ windowIndex: number; path: string }>
    ) {
      const { windowIndex, path } = action.payload
      const windowState = state[windowIndex]
      if (!windowState) {
        return state
      }
      const selected = windowState.selected.includes(path)
      return {
        ...state,
        [windowIndex]: {
          ...defaultState,
          ...windowState,
          selected: selected
            ? windowState.selected.filter((p) => p !== path)
            : [...windowState.selected, path],
        },
      }
    },
    rangeSelect(
      state,
      action: PayloadAction<{ windowIndex: number; paths: string[] }>
    ) {
      const { windowIndex, paths } = action.payload
      const windowState = state[windowIndex]
      if (!windowState) {
        return state
      }
      const selected = windowState.selected.filter((p) => !paths.includes(p))
      return {
        ...state,
        [windowIndex]: {
          ...defaultState,
          ...windowState,
          selected: [...selected, ...paths],
        },
      }
    },
    unselectAll(state, action: PayloadAction<{ windowIndex: number }>) {
      const { windowIndex } = action.payload
      const windowState = state[windowIndex]
      if (!windowState) {
        return state
      }
      return {
        ...state,
        [windowIndex]: {
          ...defaultState,
          ...windowState,
          selected: [],
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
          ...defaultState,
          ...windowState,
          history: { ...windowState.history, index },
        },
      }
    },
    changeDirectory(
      state,
      action: PayloadAction<{ windowIndex: number; path: string }>
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
      action: PayloadAction<{ windowIndex: number; scrollTop: number }>
    ) {
      const { windowIndex, scrollTop } = action.payload
      const windowState = state[windowIndex]
      if (!windowState) {
        return state
      }
      const histories = windowState.history.histories.map((history, i) =>
        i === windowState.history.index ? { ...history, scrollTop } : history
      )
      return {
        ...state,
        [windowIndex]: {
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
        windowIndex: number
        path: string
        orderBy: SortOption['orderBy']
        order?: SortOption['order']
      }>
    ) {
      const { windowIndex, path, orderBy, order } = action.payload
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

export const selectExplorable = createSelector(
  selectCurrentDirectory,
  (currentDirectory) =>
    currentDirectory && !currentDirectory.startsWith('zephy://')
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
      const aValue = a[currentSortOption.orderBy]
      const bValue = b[currentSortOption.orderBy]
      let result = 0
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        result = aValue.localeCompare(bValue)
      } else {
        if (aValue !== undefined && bValue !== undefined) {
          if (aValue > bValue) {
            result = 1
          } else if (aValue < bValue) {
            result = -1
          }
        } else {
          result = 0
        }
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
    const windowIndex = selectWindowIndex(getState())
    dispatch(setViewMode({ windowIndex, viewMode }))
  }

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

export const searchQuery =
  (query: string): AppThunk =>
  async (dispatch, getState) => {
    const { setQuery } = windowSlice.actions
    const windowIndex = selectWindowIndex(getState())
    dispatch(setQuery({ windowIndex, query }))
    dispatch(add(query))
  }

export const load = (): AppThunk => async (dispatch, getState) => {
  const { loading, loaded } = windowSlice.actions
  const explorable = selectExplorable(getState())
  if (!explorable) {
    return
  }
  const windowIndex = selectWindowIndex(getState())
  dispatch(loading({ windowIndex }))
  try {
    const currentDirectory = selectCurrentDirectory(getState())
    const entries = await window.electronAPI.getDetailedEntries(
      currentDirectory
    )
    dispatch(loaded({ windowIndex, entries }))
  } catch (e) {
    dispatch(loaded({ windowIndex, entries: [] }))
  }
}

export const select =
  (path: string): AppThunk =>
  async (dispatch, getState) => {
    const { select } = windowSlice.actions
    const windowIndex = selectWindowIndex(getState())
    dispatch(select({ windowIndex, path }))
  }

export const multiSelect =
  (path: string): AppThunk =>
  async (dispatch, getState) => {
    const { multiSelect } = windowSlice.actions
    const windowIndex = selectWindowIndex(getState())
    dispatch(multiSelect({ windowIndex, path }))
  }

export const rangeSelect =
  (path: string): AppThunk =>
  async (dispatch, getState) => {
    const { rangeSelect } = windowSlice.actions
    const windowIndex = selectWindowIndex(getState())
    const contents = selectContents(getState())
    const selected = selectSelected(getState())
    const paths = contents.map((content) => content.path)
    const prevSelected = selected[selected.length - 1]
    let newPaths
    if (prevSelected) {
      const index = paths.indexOf(path)
      const prevIndex = paths.indexOf(prevSelected)
      newPaths =
        prevIndex < index
          ? paths.slice(prevIndex, index + 1)
          : paths.slice(index, prevIndex + 1)
    } else {
      const index = paths.indexOf(path)
      newPaths = paths.slice(0, index + 1)
    }
    dispatch(rangeSelect({ windowIndex, paths: newPaths }))
  }

export const unselectAll = (): AppThunk => async (dispatch, getState) => {
  const { unselectAll } = windowSlice.actions
  const windowIndex = selectWindowIndex(getState())
  dispatch(unselectAll({ windowIndex }))
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

export const changeDirectory =
  (path: string): AppThunk =>
  async (dispatch, getState) => {
    const { changeDirectory } = windowSlice.actions
    const windowIndex = selectWindowIndex(getState())
    dispatch(changeDirectory({ windowIndex, path }))
  }

export const goHome = (): AppThunk => async (dispatch) => {
  const homePath = await window.electronAPI.getHomePath()
  return dispatch(changeDirectory(homePath))
}

export const goToSettings = (): AppThunk => async (dispatch) => {
  dispatch(changeDirectory('zephy://settings'))
}

export const newFolder =
  (path: string): AppThunk =>
  async (dispatch, getState) => {
    const { add, select } = windowSlice.actions
    const windowIndex = selectWindowIndex(getState())
    const entry = await window.electronAPI.createDirectory(path)
    dispatch(add({ windowIndex, entries: [entry] }))
    dispatch(select({ windowIndex, path: entry.path }))
  }

export const moveToTrash =
  (paths: string[]): AppThunk =>
  async (dispatch, getState) => {
    const { remove } = windowSlice.actions
    const windowIndex = selectWindowIndex(getState())
    await window.electronAPI.trashItems(paths)
    dispatch(remove({ windowIndex, paths }))
  }

export const rename =
  (path: string, newName: string): AppThunk =>
  async (dispatch, getState) => {
    const { add, remove } = windowSlice.actions
    const windowIndex = selectWindowIndex(getState())
    const entry = await window.electronAPI.renameEntry(path, newName)
    dispatch(remove({ windowIndex, paths: [path] }))
    dispatch(add({ windowIndex, entries: [entry] }))
  }

export const createEntry =
  (path: string): AppThunk =>
  async (dispatch, getState) => {
    const { add } = windowSlice.actions
    const windowIndex = selectWindowIndex(getState())
    const entry = await window.electronAPI.getDetailedEntry(path)
    dispatch(add({ windowIndex, entries: [entry] }))
  }

export const deleteEntry =
  (path: string): AppThunk =>
  async (dispatch, getState) => {
    const { remove } = windowSlice.actions
    const windowIndex = selectWindowIndex(getState())
    dispatch(remove({ windowIndex, paths: [path] }))
  }

export const scroll =
  (scrollTop: number): AppThunk =>
  async (dispatch, getState) => {
    const { scroll } = windowSlice.actions
    const windowIndex = selectWindowIndex(getState())
    dispatch(scroll({ windowIndex, scrollTop }))
  }

export const sort =
  (orderBy: SortOption['orderBy'], order?: SortOption['order']): AppThunk =>
  async (dispatch, getState) => {
    const windowIndex = selectWindowIndex(getState())
    const currentDirectory = selectCurrentDirectory(getState())
    const { sort } = windowSlice.actions
    dispatch(sort({ windowIndex, path: currentDirectory, orderBy, order }))
  }

export const initialize =
  (path: string): AppThunk =>
  async (dispatch, getState) => {
    const { initialize } = windowSlice.actions
    const windowIndex = selectWindowIndex(getState())
    dispatch(initialize({ windowIndex }))
    let newPath = path
    if (!newPath) {
      newPath = await window.electronAPI.getHomePath()
    }
    dispatch(changeDirectory(newPath))
  }
