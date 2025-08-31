import {
  createSelector,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit'
import type { Content, Entry, FileEventType } from '~/interfaces'
import type { AppState, AppThunk } from '~/store'
import { changeFavoritePath } from '~/store/favorite'
import { showError } from '~/store/notification'
import {
  changeRatingPath,
  selectRating,
  selectScoreByPath,
  selectScoreToPathsMap,
} from '~/store/rating'
import { selectShouldShowHiddenFiles } from '~/store/settings'
import {
  changeUrl,
  openUrl,
  selectCurrentDirectoryPath,
  selectCurrentTabId,
  selectDirectoryPathByTabId,
  selectQueryByTabId,
  selectSortOptionByTabIdAndUrl,
  selectTabs,
  selectUrlByTabId,
} from '~/store/window'
import { isHiddenFile } from '~/utils/file'
import { parseUrl } from '~/utils/url'

type ExplorerState = {
  anchor: string | undefined
  editing: string | undefined
  entries: Entry[]
  error: boolean
  focused: string | undefined
  loading: boolean
  selected: string[]
  timestamp: number
}

type State = {
  [tabId: number]: ExplorerState
}

const initialState: State = {}

const defaultExplorerState = {
  anchor: undefined,
  editing: undefined,
  entries: [],
  error: false,
  focused: undefined,
  loading: false,
  selected: [],
  timestamp: 0,
}

const findExplorer = (state: State, tabId: number) =>
  state[tabId] ?? defaultExplorerState

export const explorerListSlice = createSlice({
  name: 'explorer-list',
  initialState,
  reducers: {
    addTab(state, action: PayloadAction<{ tabId: number }>) {
      const { tabId } = action.payload
      return {
        ...state,
        [tabId]: defaultExplorerState,
      }
    },
    copyTab(
      state,
      action: PayloadAction<{ srcTabId: number; destTabId: number }>,
    ) {
      const { srcTabId, destTabId } = action.payload
      const explorer = findExplorer(state, srcTabId)
      return {
        ...state,
        [destTabId]: {
          ...explorer,
          entries: [...explorer.entries],
          selected: [...explorer.selected],
        },
      }
    },
    removeTab(state, action: PayloadAction<{ tabId: number }>) {
      const { tabId } = action.payload
      return Object.keys(state).reduce((acc, i) => {
        const id = Number(i)
        if (id !== tabId) {
          acc[id] = state[id]
        }
        return acc
      }, {} as State)
    },
    removeOtherTabs(state, action: PayloadAction<{ tabId: number }>) {
      const { tabId } = action.payload
      return { [tabId]: findExplorer(state, tabId) }
    },
    load(
      state,
      action: PayloadAction<{
        tabId: number
        timestamp: number
      }>,
    ) {
      const { tabId, timestamp } = action.payload
      const explorer = findExplorer(state, tabId)
      return {
        ...state,
        [tabId]: {
          ...explorer,
          entries: [],
          loading: true,
          error: false,
          timestamp,
        },
      }
    },
    loaded(
      state,
      action: PayloadAction<{
        tabId: number
        entries: Entry[]
        timestamp: number
      }>,
    ) {
      const { tabId, entries, timestamp } = action.payload
      const explorer = findExplorer(state, tabId)
      if (explorer.timestamp !== timestamp) {
        return state
      }
      const paths = entries.map((entry) => entry.path)
      const focused =
        explorer.focused && paths.includes(explorer.focused)
          ? explorer.focused
          : undefined
      const selected = explorer.selected.filter((path) => paths.includes(path))
      return {
        ...state,
        [tabId]: {
          ...explorer,
          entries,
          error: false,
          focused,
          loading: false,
          selected,
        },
      }
    },
    loadFailed(
      state,
      action: PayloadAction<{
        tabId: number
        timestamp: number
      }>,
    ) {
      const { tabId, timestamp } = action.payload
      const explorer = findExplorer(state, tabId)
      if (explorer.timestamp !== timestamp) {
        return state
      }
      return {
        ...state,
        [tabId]: {
          ...explorer,
          entries: [],
          error: true,
          focused: undefined,
          loading: false,
          selected: [],
        },
      }
    },
    addEntry(
      state,
      action: PayloadAction<{
        tabId: number
        entry: Entry
      }>,
    ) {
      const { tabId, entry } = action.payload
      const explorer = findExplorer(state, tabId)
      const entries = [
        ...explorer.entries.filter((e) => e.path !== entry.path),
        entry,
      ]
      return {
        ...state,
        [tabId]: {
          ...explorer,
          entries,
        },
      }
    },
    removeEntry(
      state,
      action: PayloadAction<{
        tabId: number
        path: string
      }>,
    ) {
      const { tabId, path } = action.payload
      const explorer = findExplorer(state, tabId)
      const entries = explorer.entries.filter((entry) => entry.path !== path)
      const focused =
        explorer.focused && explorer.focused !== path
          ? explorer.focused
          : undefined
      const selected = explorer.selected.filter((p) => p !== path)
      return {
        ...state,
        [tabId]: {
          ...explorer,
          entries,
          focused,
          selected,
        },
      }
    },
    updateEntry(
      state,
      action: PayloadAction<{
        tabId: number
        path: string
        entry: Entry
      }>,
    ) {
      const { tabId, path, entry } = action.payload
      const explorer = findExplorer(state, tabId)
      if (!explorer.entries.find((e) => e.path === path)) {
        return state
      }
      const entries = [
        ...explorer.entries.filter(
          (e) => e.path !== path && e.path !== entry.path,
        ),
        entry,
      ]
      return {
        ...state,
        [tabId]: {
          ...explorer,
          entries,
        },
      }
    },
    startEditing(
      state,
      action: PayloadAction<{
        tabId: number
        path: string
      }>,
    ) {
      const { tabId, path } = action.payload
      const explorer = findExplorer(state, tabId)
      return {
        ...state,
        [tabId]: {
          ...explorer,
          editing: path,
        },
      }
    },
    finishEditing(
      state,
      action: PayloadAction<{
        tabId: number
      }>,
    ) {
      const { tabId } = action.payload
      const explorer = findExplorer(state, tabId)
      return {
        ...state,
        [tabId]: {
          ...explorer,
          editing: undefined,
        },
      }
    },
    focus(state, action: PayloadAction<{ tabId: number; path: string }>) {
      const { tabId, path } = action.payload
      const explorer = findExplorer(state, tabId)
      return {
        ...state,
        [tabId]: {
          ...explorer,
          focused: path,
        },
      }
    },
    unfocus(state, action: PayloadAction<{ tabId: number; paths: string[] }>) {
      const { tabId, paths } = action.payload
      const explorer = findExplorer(state, tabId)
      const focused =
        explorer.focused && paths.includes(explorer.focused)
          ? undefined
          : explorer.focused
      return {
        ...state,
        [tabId]: {
          ...explorer,
          focused,
        },
      }
    },
    blur(
      state,
      action: PayloadAction<{
        tabId: number
      }>,
    ) {
      const { tabId } = action.payload
      const explorer = findExplorer(state, tabId)
      return {
        ...state,
        [tabId]: {
          ...explorer,
          focused: undefined,
        },
      }
    },
    select(state, action: PayloadAction<{ tabId: number; path: string }>) {
      const { tabId, path } = action.payload
      const explorer = findExplorer(state, tabId)
      const selected = [path]
      return {
        ...state,
        [tabId]: {
          ...explorer,
          selected,
        },
      }
    },
    toggleSelection(
      state,
      action: PayloadAction<{ tabId: number; path: string }>,
    ) {
      const { tabId, path } = action.payload
      const explorer = findExplorer(state, tabId)
      const selected = explorer.selected.includes(path)
        ? explorer.selected.filter((p) => p !== path)
        : [...explorer.selected, path]
      return {
        ...state,
        [tabId]: {
          ...explorer,
          selected,
        },
      }
    },
    addSelection(
      state,
      action: PayloadAction<{ tabId: number; paths: string[] }>,
    ) {
      const { tabId, paths } = action.payload
      const explorer = findExplorer(state, tabId)
      const selected = [
        ...explorer.selected.filter((p) => !paths.includes(p)),
        ...paths,
      ]
      return {
        ...state,
        [tabId]: {
          ...explorer,
          selected,
        },
      }
    },
    removeSelection(
      state,
      action: PayloadAction<{ tabId: number; paths: string[] }>,
    ) {
      const { tabId, paths } = action.payload
      const explorer = findExplorer(state, tabId)
      const selected = explorer.selected.filter((p) => !paths.includes(p))
      return {
        ...state,
        [tabId]: {
          ...explorer,
          selected,
        },
      }
    },
    selectAll(
      state,
      action: PayloadAction<{ tabId: number; paths: string[] }>,
    ) {
      const { tabId, paths } = action.payload
      const explorer = findExplorer(state, tabId)
      const selected = paths
      return {
        ...state,
        [tabId]: {
          ...explorer,
          selected,
        },
      }
    },
    unselectAll(state, action: PayloadAction<{ tabId: number }>) {
      const { tabId } = action.payload
      const explorer = findExplorer(state, tabId)
      return {
        ...state,
        [tabId]: {
          ...explorer,
          selected: [],
        },
      }
    },
    setAnchor(state, action: PayloadAction<{ tabId: number; anchor: string }>) {
      const { tabId, anchor } = action.payload
      const explorer = findExplorer(state, tabId)
      return {
        ...state,
        [tabId]: {
          ...explorer,
          anchor,
        },
      }
    },
  },
})

export const {
  addTab,
  blur,
  copyTab,
  finishEditing,
  focus,
  removeOtherTabs,
  removeSelection,
  removeTab,
  select,
  setAnchor,
  startEditing,
  toggleSelection,
  unfocus,
  unselectAll,
} = explorerListSlice.actions

export default explorerListSlice.reducer

export const selectExplorerList = (state: AppState) => state.explorerList

// Selectors by tabId

const selectTabId = (_state: AppState, tabId: number) => tabId

export const selectExplorerByTabId = createSelector(
  selectExplorerList,
  selectTabId,
  (explorer, tabId) => explorer[tabId] ?? defaultExplorerState,
)

export const selectEntriesByTabId = createSelector(
  selectExplorerByTabId,
  (explorer) => explorer.entries,
)

export const selectErrorByTabId = createSelector(
  selectExplorerByTabId,
  (explorer) => explorer.error,
)

export const selectLoadingByTabId = createSelector(
  selectExplorerByTabId,
  (explorer) => explorer.loading,
)

export const selectEditingByTabId = createSelector(
  selectExplorerByTabId,
  (explorer) => explorer.editing,
)

export const selectFocusedByTabId = createSelector(
  selectExplorerByTabId,
  (explorer) => explorer.focused,
)

export const selectSelectedByTabId = createSelector(
  selectExplorerByTabId,
  (explorer) => explorer.selected,
)

export const selectAnchorByTabId = createSelector(
  selectExplorerByTabId,
  (explorer) => explorer.anchor,
)

export const selectContentsByTabId = createSelector(
  selectEntriesByTabId,
  selectQueryByTabId,
  (state: AppState, tabId: number) =>
    selectSortOptionByTabIdAndUrl(state, tabId, selectUrlByTabId(state, tabId)),
  selectRating,
  selectShouldShowHiddenFiles,
  (entries, query, sortOption, rating, shouldShowHiddenFiles) => {
    const comparator = (a: Content, b: Content) => {
      const aValue = a[sortOption.orderBy]
      const bValue = b[sortOption.orderBy]
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
        }
      }
      const orderSign = sortOption.order === 'desc' ? -1 : 1
      return orderSign * result
    }
    return entries
      .filter((entry) => shouldShowHiddenFiles || !isHiddenFile(entry.name))
      .filter(
        (entry) =>
          !query || entry.name.toLowerCase().includes(query.toLowerCase()),
      )
      .map((entry) => ({
        ...entry,
        score: selectScoreByPath(rating, entry.path),
      }))
      .toSorted((a, b) => comparator(a, b))
  },
)

export const selectFocusedContentsByTabId = createSelector(
  (state: AppState) => state,
  selectTabId,
  selectContentsByTabId,
  (state, tabId, contents) =>
    contents.find((content: Content) =>
      selectFocusedByTabIdAndPath(state, tabId, content.path),
    ),
)

export const selectSelectedContentsByTabId = createSelector(
  (state: AppState) => state,
  selectTabId,
  selectContentsByTabId,
  (state, tabId, contents) =>
    contents.filter((content: Content) =>
      selectSelectedByTabIdAndPath(state, tabId, content.path),
    ),
)

// Selectors by tabId and path

const selectPath = (_state: AppState, _tabId: number, path: string) => path

export const selectEditingByTabIdAndPath = createSelector(
  selectEditingByTabId,
  selectPath,
  (editing, path) => editing === path,
)

export const selectFocusedByTabIdAndPath = createSelector(
  selectFocusedByTabId,
  selectPath,
  (focused, path) => focused === path,
)

export const selectSelectedByTabIdAndPath = createSelector(
  selectSelectedByTabId,
  selectPath,
  (selected, path) => selected.includes(path),
)

// Selectors for current tab

export const selectCurrentExplorer = createSelector(
  (state: AppState) => state,
  selectCurrentTabId,
  (state, tabId) => selectExplorerByTabId(state, tabId),
)

export const selectCurrentLoading = createSelector(
  (state: AppState) => state,
  selectCurrentTabId,
  (state, tabId) => selectLoadingByTabId(state, tabId),
)

export const selectCurrentFocused = createSelector(
  (state: AppState) => state,
  selectCurrentTabId,
  (state, tabId) => selectFocusedByTabId(state, tabId),
)

export const selectCurrentSelected = createSelector(
  (state: AppState) => state,
  selectCurrentTabId,
  (state, tabId) => selectSelectedByTabId(state, tabId),
)

export const selectCurrentContents = createSelector(
  (state: AppState) => state,
  selectCurrentTabId,
  (state, tabId) => selectContentsByTabId(state, tabId),
)

export const selectCurrentSelectedContents = createSelector(
  (state: AppState) => state,
  selectCurrentTabId,
  (state, tabId) => selectSelectedContentsByTabId(state, tabId),
)

// Operations by tabId

export const load =
  (tabId: number): AppThunk =>
  async (dispatch, getState) => {
    const { load, loaded, loadFailed } = explorerListSlice.actions

    const url = selectUrlByTabId(getState(), tabId)
    if (!url) {
      return
    }

    const loading = selectLoadingByTabId(getState(), tabId)
    if (loading) {
      return
    }

    const timestamp = Date.now()

    dispatch(load({ tabId, timestamp }))
    try {
      const entries: Entry[] = await (async () => {
        const params = parseUrl(url)
        switch (params?.type) {
          case 'file': {
            if (!params.path) {
              throw new Error()
            }
            return await window.entryAPI.getEntries(params.path)
          }
          case 'ratings': {
            const scoreToPathsMap = selectScoreToPathsMap(getState())
            const paths = scoreToPathsMap[params.score] ?? []
            return await window.entryAPI.getEntriesForPaths(paths)
          }
          case 'settings':
            return []
          default:
            throw new Error()
        }
      })()
      dispatch(loaded({ tabId, entries, timestamp }))
    } catch {
      dispatch(loadFailed({ tabId, timestamp }))
    }
  }

export const addSelection =
  (tabId: number, path: string, useAnchor: boolean): AppThunk =>
  async (dispatch, getState) => {
    const { addSelection } = explorerListSlice.actions

    let anchor: string | undefined
    if (useAnchor) {
      anchor = selectAnchorByTabId(getState(), tabId)
    } else {
      const selected = selectSelectedByTabId(getState(), tabId)
      anchor = selected[selected.length - 1]
    }

    const contents = selectContentsByTabId(getState(), tabId)
    const paths = contents.map((content) => content.path)

    let newPaths: string[]
    if (anchor) {
      const index = paths.indexOf(path)
      const prevIndex = paths.indexOf(anchor)
      newPaths =
        prevIndex < index
          ? paths.slice(prevIndex, index + 1)
          : paths.slice(index, prevIndex + 1)
    } else {
      newPaths = [path]
    }

    dispatch(addSelection({ tabId, paths: newPaths }))
  }

export const focusFirst =
  (tabId: number): AppThunk =>
  async (dispatch, getState) => {
    const { focus, select } = explorerListSlice.actions

    const contents = selectContentsByTabId(getState(), tabId)
    const content = contents[0]
    if (!content) {
      return
    }

    dispatch(select({ tabId, path: content.path }))
    dispatch(focus({ tabId, path: content.path }))
  }

export const focusByHorizontal =
  (
    tabId: number,
    offset: number,
    columns: number,
    multiSelect: boolean,
  ): AppThunk =>
  async (dispatch, getState) => {
    const { focus, select, unselectAll } = explorerListSlice.actions

    const focused = selectFocusedByTabId(getState(), tabId)
    const contents = selectContentsByTabId(getState(), tabId)
    const index = contents.findIndex((c) => c.path === focused)
    if (index < 0) {
      return dispatch(focusFirst(tabId))
    }

    const rowIndex = Math.floor(index / columns)
    const columnIndex = index % columns
    const newColumnIndex = columnIndex + offset

    if (newColumnIndex < 0 || newColumnIndex >= columns) {
      return
    }

    const newIndex = columns * rowIndex + newColumnIndex
    const content = contents[newIndex]
    if (!content) {
      return
    }

    if (multiSelect) {
      dispatch(unselectAll({ tabId }))
      dispatch(addSelection(tabId, content.path, true))
    } else {
      dispatch(select({ tabId, path: content.path }))
    }
    dispatch(focus({ tabId, path: content.path }))
  }

export const focusByVertical =
  (
    tabId: number,
    offset: number,
    columns: number,
    multiSelect: boolean,
  ): AppThunk =>
  async (dispatch, getState) => {
    const { focus, select, unselectAll } = explorerListSlice.actions

    const focused = selectFocusedByTabId(getState(), tabId)
    const contents = selectContentsByTabId(getState(), tabId)
    const index = contents.findIndex((c) => c.path === focused)
    if (index < 0) {
      return dispatch(focusFirst(tabId))
    }

    const rowIndex = Math.floor(index / columns)
    const columnIndex = index % columns
    const newRowIndex = rowIndex + offset

    const newIndex = columns * newRowIndex + columnIndex
    const content = contents[newIndex]
    if (!content) {
      return
    }

    if (multiSelect) {
      dispatch(unselectAll({ tabId }))
      dispatch(addSelection(tabId, content.path, true))
    } else {
      dispatch(select({ tabId, path: content.path }))
    }
    dispatch(focus({ tabId, path: content.path }))
  }

export const focusTo =
  (
    tabId: number,
    position: 'first' | 'last',
    columns: number,
    multiSelect: boolean,
  ): AppThunk =>
  async (dispatch, getState) => {
    const { focus, select, unselectAll } = explorerListSlice.actions

    const focused = selectFocusedByTabId(getState(), tabId)
    const contents = selectContentsByTabId(getState(), tabId)
    const index = contents.findIndex((c) => c.path === focused)
    if (index < 0) {
      return dispatch(focusFirst(tabId))
    }

    const columnIndex = index % columns
    const maxRowIndex = Math.floor(contents.length / columns)

    let newIndex: number
    if (position === 'first') {
      newIndex = columnIndex
    } else {
      newIndex = maxRowIndex * columns + columnIndex
      if (newIndex >= contents.length) {
        newIndex -= columns
      }
    }

    const content = contents[newIndex]
    if (!content) {
      return
    }

    if (multiSelect) {
      dispatch(unselectAll({ tabId }))
      dispatch(addSelection(tabId, content.path, true))
    } else {
      dispatch(select({ tabId, path: content.path }))
    }
    dispatch(focus({ tabId, path: content.path }))
  }

export const rename =
  (tabId: number, path: string, newName: string): AppThunk =>
  async (dispatch) => {
    const { focus, select, updateEntry } = explorerListSlice.actions

    try {
      const entry = await window.entryAPI.renameEntry(path, newName)
      dispatch(changeFavoritePath({ oldPath: path, newPath: entry.path }))
      dispatch(changeRatingPath({ oldPath: path, newPath: entry.path }))
      dispatch(updateEntry({ tabId, path, entry }))
      dispatch(select({ tabId, path: entry.path }))
      dispatch(focus({ tabId, path: entry.path }))
    } catch (e) {
      dispatch(showError(e))
    }
  }

// Operations for current tab

export const refresh = (): AppThunk => async (dispatch, getState) => {
  const tabId = selectCurrentTabId(getState())

  dispatch(load(tabId))
}

export const open =
  (url?: string): AppThunk =>
  async (dispatch, getState) => {
    let path: string | undefined

    if (url) {
      const params = parseUrl(url)
      if (params?.type !== 'file') {
        return dispatch(changeUrl(url))
      }

      path = params?.path
    } else {
      path = selectCurrentFocused(getState())
    }

    if (!path) {
      return
    }

    try {
      const entry = await window.entryAPI.getEntry(path)
      if (entry.type === 'directory') {
        dispatch(changeUrl(entry.url))
      } else {
        dispatch(openUrl(entry.url))
      }
    } catch (e) {
      showError(e)
    }
  }

export const selectAll = (): AppThunk => async (dispatch, getState) => {
  const { selectAll } = explorerListSlice.actions

  const tabId = selectCurrentTabId(getState())
  const contents = selectContentsByTabId(getState(), tabId)

  const paths = contents.map((content) => content.path)
  dispatch(selectAll({ tabId, paths }))
}

export const startRenaming =
  (path?: string): AppThunk =>
  async (dispatch, getState) => {
    const { focus, select, startEditing } = explorerListSlice.actions

    const tabId = selectCurrentTabId(getState())
    const focused = selectCurrentFocused(getState())

    const targetPath = path ?? focused
    if (!targetPath) {
      return
    }

    dispatch(select({ tabId, path: targetPath }))
    dispatch(focus({ tabId, path: targetPath }))
    dispatch(startEditing({ tabId, path: targetPath }))
  }

export const newFolder =
  (directoryPath: string): AppThunk =>
  async (dispatch, getState) => {
    const { addEntry, focus, select, startEditing } = explorerListSlice.actions

    const tabId = selectCurrentTabId(getState())

    const entry = await window.entryAPI.createDirectory(directoryPath)
    dispatch(addEntry({ tabId, entry }))
    dispatch(select({ tabId, path: entry.path }))
    dispatch(focus({ tabId, path: entry.path }))
    dispatch(startEditing({ tabId, path: entry.path }))
  }

export const copy = (): AppThunk => async (_, getState) => {
  const selected = selectCurrentSelected(getState())
  window.entryAPI.copyEntries(selected)
}

export const paste = (): AppThunk => async (_, getState) => {
  const currentDirectoryPath = selectCurrentDirectoryPath(getState())
  if (!currentDirectoryPath) {
    return
  }

  window.entryAPI.pasteEntries(currentDirectoryPath)
}

export const moveToTrash =
  (paths?: string[]): AppThunk =>
  async (dispatch, getState) => {
    const { blur, focus, removeEntry, select, unselectAll } =
      explorerListSlice.actions

    const tabId = selectCurrentTabId(getState())
    const selected = selectSelectedByTabId(getState(), tabId)

    const targetPaths = paths ?? selected
    if (targetPaths.length === 0) {
      return
    }

    for (const targetPath of targetPaths) {
      try {
        await window.entryAPI.moveEntryToTrash(targetPath)

        if (selected.includes(targetPath)) {
          const contents = selectContentsByTabId(getState(), tabId)
          const path = (() => {
            const lastIndex = Math.max(
              ...contents.flatMap((content, i) =>
                content.path === targetPath ? [i] : [],
              ),
            )
            if (lastIndex !== contents.length - 1) {
              return contents[lastIndex + 1]?.path
            }
            const filtered = contents.filter(
              (content) => content.path !== targetPath,
            )
            return filtered[filtered.length - 1]?.path
          })()
          if (path) {
            dispatch(select({ tabId, path }))
            dispatch(focus({ tabId, path }))
          } else {
            dispatch(unselectAll({ tabId }))
            dispatch(blur({ tabId }))
          }
        }

        dispatch(removeEntry({ tabId, path: targetPath }))
      } catch (e) {
        showError(e)
      }
    }
  }

// Operations for anywhere

export const handleFileChange =
  (eventType: FileEventType, directoryPath: string, path: string): AppThunk =>
  async (dispatch, getState) => {
    const { addEntry, removeEntry, removeSelection, unfocus, updateEntry } =
      explorerListSlice.actions

    const tabs = selectTabs(getState())

    for (const { id: tabId } of tabs) {
      const targetDirectoryPath = selectDirectoryPathByTabId(getState(), tabId)
      if (directoryPath !== targetDirectoryPath) {
        continue
      }

      switch (eventType) {
        case 'create': {
          try {
            const entry = await window.entryAPI.getEntry(path)
            dispatch(addEntry({ tabId, entry }))
          } catch {
            // noop
          }
          break
        }
        case 'update': {
          try {
            const entry = await window.entryAPI.getEntry(path)
            dispatch(updateEntry({ tabId, path, entry }))
          } catch {
            // noop
          }
          break
        }
        case 'delete':
          dispatch(removeEntry({ tabId, path }))
          dispatch(removeSelection({ tabId, paths: [path] }))
          dispatch(unfocus({ tabId, paths: [path] }))
          break
      }
    }
  }
