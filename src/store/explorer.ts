import {
  type PayloadAction,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit'
import type { Content, DetailedEntry } from '~/interfaces'
import type { AppState, AppThunk } from '~/store'
import { changeFavoritePath, removeFromFavorites } from '~/store/favorite'
import { addQuery } from '~/store/query'
import {
  changeRatingPath,
  removeRating,
  selectPathsByScore,
  selectRating,
  selectScoreByPath,
} from '~/store/rating'
import { openEntry, selectShouldShowHiddenFiles } from '~/store/settings'
import {
  changeDirectory,
  selectCurrentDirectoryPath,
  selectCurrentTabId,
  selectDirectoryPathByTabId,
  selectSortOptionByTabIdAndDirectoryPath,
  selectTabs,
} from '~/store/window'
import { isHiddenFile } from '~/utils/file'
import { parseZephyUrl } from '~/utils/url'

type ExplorerState = {
  editing: string | undefined
  entries: DetailedEntry[]
  error: boolean
  focused: string | undefined
  loading: boolean
  query: string
  selected: string[]
}

type State = {
  [tabId: number]: ExplorerState
}

const initialState: State = {}

const defaultExplorerState = {
  editing: undefined,
  entries: [],
  error: false,
  focused: undefined,
  loading: false,
  query: '',
  selected: [],
}

const findExplorer = (state: State, tabId: number) =>
  state[tabId] ?? defaultExplorerState

export const explorerSlice = createSlice({
  name: 'explorer',
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
    loading(
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
          entries: [],
          loading: true,
          error: false,
        },
      }
    },
    loaded(
      state,
      action: PayloadAction<{
        tabId: number
        entries?: DetailedEntry[]
        error?: boolean
      }>,
    ) {
      const { tabId, entries = [], error = false } = action.payload
      const explorer = findExplorer(state, tabId)
      return {
        ...state,
        [tabId]: {
          ...explorer,
          entries,
          error,
          loading: false,
          query: '',
        },
      }
    },
    setQuery(state, action: PayloadAction<{ tabId: number; query: string }>) {
      const { tabId, query } = action.payload
      const explorer = findExplorer(state, tabId)
      return { ...state, [tabId]: { ...explorer, query } }
    },
    addEntries(
      state,
      action: PayloadAction<{
        tabId: number
        entries: DetailedEntry[]
      }>,
    ) {
      const { tabId, entries } = action.payload
      const explorer = findExplorer(state, tabId)
      const paths = entries.map((entry) => entry.path)
      const newEntries = [
        ...explorer.entries.filter((entry) => !paths.includes(entry.path)),
        ...entries,
      ]
      return {
        ...state,
        [tabId]: {
          ...explorer,
          entries: newEntries,
        },
      }
    },
    removeEntries(
      state,
      action: PayloadAction<{
        tabId: number
        paths: string[]
      }>,
    ) {
      const { tabId, paths } = action.payload
      const explorer = findExplorer(state, tabId)
      const entries = explorer.entries.filter(
        (entry) => !paths.includes(entry.path),
      )
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
      return {
        ...state,
        [tabId]: {
          ...explorer,
          selected: [path],
        },
      }
    },
    multiSelect(state, action: PayloadAction<{ tabId: number; path: string }>) {
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
    rangeSelect(
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
    unselect(state, action: PayloadAction<{ tabId: number; paths: string[] }>) {
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
  },
})

export const { addTab, copyTab, removeTab, removeOtherTabs } =
  explorerSlice.actions

export default explorerSlice.reducer

export const selectExplorer = (state: AppState) => state.explorer

const selectTabId = (_state: AppState, tabId: number) => tabId

export const selectExplorerByTabId = createSelector(
  selectExplorer,
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

export const selectQueryByTabId = createSelector(
  selectExplorerByTabId,
  (explorer) => explorer.query,
)

const selectPath = (_state: AppState, _tabId: number, path: string) => path

const selectEditing = (editing: string | undefined, path: string) =>
  editing === path

export const selectEditingByTabId = createSelector(
  selectExplorerByTabId,
  (explorer) => explorer.editing,
)

export const selectEditingByTabIdAndPath = createSelector(
  selectEditingByTabId,
  selectPath,
  (editing, path) => selectEditing(editing, path),
)

const selectFocused = (focused: string | undefined, path: string) =>
  focused === path

export const selectFocusedByTabId = createSelector(
  selectExplorerByTabId,
  (explorer) => explorer.focused,
)

export const selectFocusedByTabIdAndPath = createSelector(
  selectFocusedByTabId,
  selectPath,
  (focused, path) => selectFocused(focused, path),
)

const selectSelected = (selected: string[], path: string) =>
  selected.includes(path)

export const selectSelectedByTabId = createSelector(
  selectExplorerByTabId,
  (explorer) => explorer.selected,
)

export const selectSelectedByTabIdAndPath = createSelector(
  selectSelectedByTabId,
  selectPath,
  (selected, path) => selectSelected(selected, path),
)

export const selectContentsByTabId = createSelector(
  selectEntriesByTabId,
  selectQueryByTabId,
  (state: AppState, tabId: number) =>
    selectSortOptionByTabIdAndDirectoryPath(
      state,
      tabId,
      selectDirectoryPathByTabId(state, tabId),
    ),
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
      .sort((a, b) => comparator(a, b))
  },
)

export const selectSelectedContentsByTabId = createSelector(
  selectContentsByTabId,
  selectSelectedByTabId,
  (contents, selected) =>
    contents.filter((content: Content) =>
      selectSelected(selected, content.path),
    ),
)

// selectCurrentTabId

export const selectCurrentExplorer = (state: AppState) =>
  selectExplorerByTabId(state, selectCurrentTabId(state))

export const selectCurrentLoading = createSelector(
  selectCurrentExplorer,
  (currentExplorer) => currentExplorer.loading,
)

export const selectCurrentQuery = createSelector(
  selectCurrentExplorer,
  (currentExplorer) => currentExplorer.query,
)

export const selectCurrentSelected = (state: AppState) =>
  selectSelectedByTabId(state, selectCurrentTabId(state))

export const selectCurrentContents = (state: AppState) =>
  selectContentsByTabId(state, selectCurrentTabId(state))

export const selectCurrentSelectedContents = (state: AppState) =>
  selectSelectedContentsByTabId(state, selectCurrentTabId(state))

export const load =
  (tabId: number): AppThunk =>
  async (dispatch, getState) => {
    const { loaded, loading, unselectAll } = explorerSlice.actions
    const directoryPath = selectDirectoryPathByTabId(getState(), tabId)
    const pathsMap = selectPathsByScore(getState())
    if (!directoryPath) {
      return
    }
    const url = parseZephyUrl(directoryPath)
    dispatch(unselectAll({ tabId }))
    dispatch(loading({ tabId }))
    try {
      let entries: DetailedEntry[] = []
      if (url) {
        if (url.pathname === 'ratings') {
          const paths = pathsMap[Number(url.params.score ?? 0)] ?? []
          entries = await window.electronAPI.getDetailedEntriesForPaths(paths)
        }
      } else {
        entries = await window.electronAPI.getDetailedEntries(directoryPath)
      }
      dispatch(loaded({ tabId, entries }))
    } catch (e) {
      dispatch(loaded({ tabId, error: true }))
    }
  }

export const refresh = (): AppThunk => async (dispatch, getState) => {
  const tabId = selectCurrentTabId(getState())
  dispatch(load(tabId))
}

export const search =
  (query: string): AppThunk =>
  async (dispatch, getState) => {
    const { setQuery, unselect } = explorerSlice.actions
    const tabId = selectCurrentTabId(getState())
    dispatch(setQuery({ tabId, query }))
    dispatch(addQuery({ query }))
    const selected = selectSelectedByTabId(getState(), tabId)
    const contents = selectContentsByTabId(getState(), tabId)
    const paths = contents.reduce(
      (acc, content) => acc.filter((path) => path !== content.path),
      selected,
    )
    dispatch(unselect({ tabId, paths }))
  }

export const startEditing =
  (path: string): AppThunk =>
  async (dispatch, getState) => {
    const { startEditing } = explorerSlice.actions
    const tabId = selectCurrentTabId(getState())
    dispatch(startEditing({ tabId, path }))
  }

export const finishEditing = (): AppThunk => async (dispatch, getState) => {
  const { finishEditing } = explorerSlice.actions
  const tabId = selectCurrentTabId(getState())
  dispatch(finishEditing({ tabId }))
}

export const focus =
  (path: string): AppThunk =>
  async (dispatch, getState) => {
    const { focus } = explorerSlice.actions
    const tabId = selectCurrentTabId(getState())
    dispatch(focus({ tabId, path }))
  }

export const blur = (): AppThunk => async (dispatch, getState) => {
  const { blur } = explorerSlice.actions
  const tabId = selectCurrentTabId(getState())
  dispatch(blur({ tabId }))
}

export const rangeSelect =
  (path: string): AppThunk =>
  async (dispatch, getState) => {
    const { rangeSelect } = explorerSlice.actions
    const tabId = selectCurrentTabId(getState())
    const contents = selectContentsByTabId(getState(), tabId)
    const selected = selectSelectedByTabId(getState(), tabId)
    const paths = contents.map((content) => content.path)
    const prevSelected = selected[selected.length - 1]
    let newPaths: string[]
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
    dispatch(rangeSelect({ tabId, paths: newPaths }))
  }

export const select =
  (path: string): AppThunk =>
  async (dispatch, getState) => {
    const { select } = explorerSlice.actions
    const tabId = selectCurrentTabId(getState())
    dispatch(select({ tabId, path }))
  }

export const multiSelect =
  (path: string): AppThunk =>
  async (dispatch, getState) => {
    const { multiSelect } = explorerSlice.actions
    const tabId = selectCurrentTabId(getState())
    dispatch(multiSelect({ tabId, path }))
  }

export const selectAll = (): AppThunk => async (dispatch, getState) => {
  const { selectAll } = explorerSlice.actions
  const tabId = selectCurrentTabId(getState())
  const contents = selectContentsByTabId(getState(), tabId)
  const paths = contents.map((content) => content.path)
  dispatch(selectAll({ tabId, paths }))
}

export const unselectAll = (): AppThunk => async (dispatch, getState) => {
  const { unselectAll } = explorerSlice.actions
  const tabId = selectCurrentTabId(getState())
  dispatch(unselectAll({ tabId }))
}

export const newFolder =
  (directoryPath: string): AppThunk =>
  async (dispatch, getState) => {
    const { addEntries, focus, select, startEditing } = explorerSlice.actions
    const tabId = selectCurrentTabId(getState())
    const entry = await window.electronAPI.createDirectory(directoryPath)
    dispatch(addEntries({ tabId, entries: [entry] }))
    dispatch(select({ tabId, path: entry.path }))
    dispatch(focus({ tabId, path: entry.path }))
    dispatch(startEditing({ tabId, path: entry.path }))
  }

export const open =
  (path?: string): AppThunk =>
  async (dispatch, getState) => {
    const contents = selectCurrentContents(getState())
    const selected = selectCurrentSelected(getState())
    const targetPath = path ?? selected[0]
    const content = contents.find((content) => content.path === targetPath)
    if (!content) {
      return
    }
    const action =
      content.type === 'directory'
        ? changeDirectory(content.path)
        : openEntry(content.path)
    dispatch(action)
  }

export const moveToTrash =
  (paths?: string[]): AppThunk =>
  async (dispatch, getState) => {
    const { unselect } = explorerSlice.actions
    const tabId = selectCurrentTabId(getState())
    const selected = selectSelectedByTabId(getState(), tabId)
    const targetPaths = paths ?? selected
    await window.electronAPI.moveEntriesToTrash(targetPaths)
    for (const path of targetPaths) {
      dispatch(removeFromFavorites(path))
      dispatch(removeRating({ path }))
    }
    dispatch(unselect({ tabId, paths: targetPaths }))
  }

export const startRenaming =
  (path?: string): AppThunk =>
  async (dispatch, getState) => {
    const selected = selectCurrentSelected(getState())
    const targetPath = path ?? selected[0]
    if (!targetPath) {
      return
    }
    dispatch(select(targetPath))
    dispatch(startEditing(targetPath))
  }

export const rename =
  (path: string, newName: string): AppThunk =>
  async (dispatch, getState) => {
    const { addEntries, focus, removeEntries, select } = explorerSlice.actions
    const tabId = selectCurrentTabId(getState())
    const entry = await window.electronAPI.renameEntry(path, newName)
    // get the selected paths after renaming
    const selected = selectSelectedByTabId(getState(), tabId)
    dispatch(changeFavoritePath({ oldPath: path, newPath: entry.path }))
    dispatch(changeRatingPath({ oldPath: path, newPath: entry.path }))
    dispatch(removeEntries({ tabId, paths: [path] }))
    dispatch(addEntries({ tabId, entries: [entry] }))
    // do not focus if the renamed entry is not selected
    if (selected.length === 1 && selected[0] === path) {
      dispatch(select({ tabId, path: entry.path }))
      dispatch(focus({ tabId, path: entry.path }))
    }
  }

export const move =
  (paths: string[], directoryPath: string): AppThunk =>
  async (dispatch, getState) => {
    const { unselect } = explorerSlice.actions
    const tabId = selectCurrentTabId(getState())
    const entries = await window.electronAPI.moveEntries(paths, directoryPath)
    paths.forEach((path, i) => {
      const entry = entries[i]
      dispatch(changeFavoritePath({ oldPath: path, newPath: entry.path }))
      dispatch(changeRatingPath({ oldPath: path, newPath: entry.path }))
    })
    dispatch(unselect({ tabId, paths }))
  }

export const copy = (): AppThunk => async (_, getState) => {
  const selected = selectCurrentSelected(getState())
  await window.electronAPI.copyEntries(selected)
}

export const paste = (): AppThunk => async (_, getState) => {
  const directoryPath = selectCurrentDirectoryPath(getState())
  const zephyUrl = parseZephyUrl(directoryPath)
  if (zephyUrl) {
    return
  }
  await window.electronAPI.pasteEntries(directoryPath)
}

export const handle =
  (
    eventType: 'create' | 'update' | 'delete',
    directoryPath: string,
    filePath: string,
  ): AppThunk =>
  async (dispatch, getState) => {
    const { addEntries, removeEntries } = explorerSlice.actions
    const tabs = selectTabs(getState())
    for (const { id: tabId } of tabs) {
      const currentDirectoryPath = selectDirectoryPathByTabId(getState(), tabId)
      if (directoryPath !== currentDirectoryPath) {
        continue
      }
      switch (eventType) {
        case 'create':
        case 'update': {
          const entry = await window.electronAPI.getDetailedEntry(filePath)
          return dispatch(addEntries({ tabId, entries: [entry] }))
        }
        case 'delete':
          return dispatch(removeEntries({ tabId, paths: [filePath] }))
      }
    }
  }
