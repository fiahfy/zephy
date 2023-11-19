import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit'
import { Content, DetailedEntry } from '~/interfaces'
import { AppState, AppThunk } from '~/store'
import { add } from '~/store/query'
import { selectGetScore, selectPathsByScore } from '~/store/rating'
import { selectShouldShowHiddenFiles } from '~/store/settings'
import {
  selectCurrentDirectoryPath,
  selectCurrentSortOption,
  selectGetCurrentHistory,
  selectTabIndex,
  selectTabs,
  selectZephySchema,
  selectZephyUrl,
} from '~/store/window'
import { isHiddenFile } from '~/utils/file'

type ExplorerState = {
  directoryPath: string
  editing: string | undefined
  entries: DetailedEntry[]
  error: boolean
  focused: string | undefined
  loading: boolean
  query: string
  selected: string[]
}

type State = {
  [tabIndex: number]: ExplorerState
}

const initialState: State = {}

const defaultExplorerState = {
  directoryPath: '',
  editing: undefined,
  entries: [],
  error: false,
  focused: undefined,
  loading: false,
  query: '',
  selected: [],
}

export const explorerSlice = createSlice({
  name: 'explorer',
  initialState,
  reducers: {
    setQuery(
      state,
      action: PayloadAction<{ tabIndex: number; query: string }>,
    ) {
      const { tabIndex, query } = action.payload
      const explorer = state[tabIndex] ?? defaultExplorerState
      return { ...state, [tabIndex]: { ...explorer, query } }
    },
    loaded(
      state,
      action: PayloadAction<{
        tabIndex: number
        entries?: DetailedEntry[]
        error?: boolean
      }>,
    ) {
      const { tabIndex, entries = [], error = false } = action.payload
      const explorer = state[tabIndex] ?? defaultExplorerState
      return {
        ...state,
        [tabIndex]: {
          ...explorer,
          entries,
          error,
          loading: false,
          query: '',
        },
      }
    },
    loading(
      state,
      action: PayloadAction<{
        tabIndex: number
        directoryPath: string
      }>,
    ) {
      const { tabIndex, directoryPath } = action.payload
      const explorer = state[tabIndex] ?? defaultExplorerState
      return {
        ...state,
        [tabIndex]: {
          ...explorer,
          directoryPath,
          entries: [],
          loading: true,
          error: false,
        },
      }
    },
    add(
      state,
      action: PayloadAction<{
        tabIndex: number
        entries: DetailedEntry[]
      }>,
    ) {
      const { tabIndex, entries } = action.payload
      const explorer = state[tabIndex] ?? defaultExplorerState
      const paths = entries.map((entry) => entry.path)
      const newEntries = [
        ...explorer.entries.filter((entry) => !paths.includes(entry.path)),
        ...entries,
      ]
      return {
        ...state,
        [tabIndex]: {
          ...explorer,
          entries: newEntries,
        },
      }
    },
    remove(
      state,
      action: PayloadAction<{
        tabIndex: number
        paths: string[]
      }>,
    ) {
      const { tabIndex, paths } = action.payload
      const explorer = state[tabIndex] ?? defaultExplorerState
      const entries = explorer.entries.filter(
        (entry) => !paths.includes(entry.path),
      )
      return {
        ...state,
        [tabIndex]: {
          ...explorer,
          entries,
        },
      }
    },
    startEditing(
      state,
      action: PayloadAction<{
        tabIndex: number
        path: string
      }>,
    ) {
      const { tabIndex, path } = action.payload
      const explorer = state[tabIndex] ?? defaultExplorerState
      return {
        ...state,
        [tabIndex]: {
          ...explorer,
          editing: path,
        },
      }
    },
    finishEditing(
      state,
      action: PayloadAction<{
        tabIndex: number
      }>,
    ) {
      const { tabIndex } = action.payload
      const explorer = state[tabIndex] ?? defaultExplorerState
      return {
        ...state,
        [tabIndex]: {
          ...explorer,
          editing: undefined,
        },
      }
    },
    focus(state, action: PayloadAction<{ tabIndex: number; path: string }>) {
      const { tabIndex, path } = action.payload
      const explorer = state[tabIndex] ?? defaultExplorerState
      return {
        ...state,
        [tabIndex]: {
          ...explorer,
          focused: path,
        },
      }
    },
    blur(
      state,
      action: PayloadAction<{
        tabIndex: number
      }>,
    ) {
      const { tabIndex } = action.payload
      const explorer = state[tabIndex] ?? defaultExplorerState
      return {
        ...state,
        [tabIndex]: {
          ...explorer,
          focused: undefined,
        },
      }
    },
    select(state, action: PayloadAction<{ tabIndex: number; path: string }>) {
      const { tabIndex, path } = action.payload
      const explorer = state[tabIndex] ?? defaultExplorerState
      return {
        ...state,
        [tabIndex]: {
          ...explorer,
          selected: [path],
        },
      }
    },
    multiSelect(
      state,
      action: PayloadAction<{ tabIndex: number; path: string }>,
    ) {
      const { tabIndex, path } = action.payload
      const explorer = state[tabIndex] ?? defaultExplorerState
      const selected = explorer.selected.includes(path)
        ? explorer.selected.filter((p) => p !== path)
        : [...explorer.selected, path]
      return {
        ...state,
        [tabIndex]: {
          ...explorer,
          selected,
        },
      }
    },
    rangeSelect(
      state,
      action: PayloadAction<{ tabIndex: number; paths: string[] }>,
    ) {
      const { tabIndex, paths } = action.payload
      const explorer = state[tabIndex] ?? defaultExplorerState
      const selected = [
        ...explorer.selected.filter((p) => !paths.includes(p)),
        ...paths,
      ]
      return {
        ...state,
        [tabIndex]: {
          ...explorer,
          selected,
        },
      }
    },
    selectAll(
      state,
      action: PayloadAction<{ tabIndex: number; paths: string[] }>,
    ) {
      const { tabIndex, paths } = action.payload
      const explorer = state[tabIndex] ?? defaultExplorerState
      const selected = paths
      return {
        ...state,
        [tabIndex]: {
          ...explorer,
          selected,
        },
      }
    },
    unselect(
      state,
      action: PayloadAction<{ tabIndex: number; paths: string[] }>,
    ) {
      const { tabIndex, paths } = action.payload
      const explorer = state[tabIndex] ?? defaultExplorerState
      const selected = explorer.selected.filter((p) => !paths.includes(p))
      return {
        ...state,
        [tabIndex]: {
          ...explorer,
          selected,
        },
      }
    },
    unselectAll(state, action: PayloadAction<{ tabIndex: number }>) {
      const { tabIndex } = action.payload
      const explorer = state[tabIndex] ?? defaultExplorerState
      return {
        ...state,
        [tabIndex]: {
          ...explorer,
          selected: [],
        },
      }
    },
  },
})

export default explorerSlice.reducer

export const selectExplorer = (state: AppState) => {
  const window = state.window[state.windowIndex]
  const explorer = state.explorer[window.tabIndex]
  return explorer ?? defaultExplorerState
}

export const selectDirectoryPath = createSelector(
  selectExplorer,
  (explorer) => explorer.directoryPath,
)

export const selectEntries = createSelector(
  selectExplorer,
  (explorer) => explorer.entries,
)

export const selectError = createSelector(
  selectExplorer,
  (explorer) => explorer.error,
)

export const selectLoading = createSelector(
  selectExplorer,
  (explorer) => explorer.loading,
)

export const selectQuery = createSelector(
  selectExplorer,
  (explorer) => explorer.query,
)

export const selectEditing = createSelector(
  selectExplorer,
  (explorer) => explorer.editing,
)

export const selectIsEditing = createSelector(
  selectEditing,
  (editing) => (path: string) => editing === path,
)

export const selectFocused = createSelector(
  selectExplorer,
  (explorer) => explorer.focused,
)

export const selectIsFocused = createSelector(
  selectFocused,
  (focused) => (path: string) => focused === path,
)

export const selectSelected = createSelector(
  selectExplorer,
  (explorer) => explorer.selected,
)

export const selectIsSelected = createSelector(
  selectSelected,
  (selected) => (path: string) => selected.includes(path),
)

export const selectContents = createSelector(
  selectEntries,
  selectQuery,
  selectCurrentSortOption,
  selectShouldShowHiddenFiles,
  selectGetScore,
  (entries, query, currentSortOption, shouldShowHiddenFiles, getScore) => {
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
          !query || entry.name.toLowerCase().includes(query.toLowerCase()),
      )
      .map((entry) => ({
        ...entry,
        rating: getScore(entry.path),
      }))
      .sort((a, b) => comparator(a, b))
  },
)

export const selectSelectedContents = createSelector(
  selectContents,
  selectIsSelected,
  (contents, isSelected) =>
    contents.filter((content) => isSelected(content.path)),
)

export const search =
  (query: string): AppThunk =>
  async (dispatch, getState) => {
    const { setQuery } = explorerSlice.actions
    const tabIndex = selectTabIndex(getState())
    dispatch(setQuery({ tabIndex, query }))
    dispatch(add(query))
  }

export const load =
  (force = false): AppThunk =>
  async (dispatch, getState) => {
    const { loaded, loading, unselectAll } = explorerSlice.actions
    const tabIndex = selectTabIndex(getState())
    const directoryPath = selectDirectoryPath(getState())
    const currentDirectoryPath = selectCurrentDirectoryPath(getState())
    const pathsMap = selectPathsByScore(getState())
    const url = selectZephyUrl(getState())
    if (
      !currentDirectoryPath ||
      (currentDirectoryPath == directoryPath && !force)
    ) {
      return
    }
    dispatch(unselectAll({ tabIndex }))
    dispatch(loading({ tabIndex, directoryPath: currentDirectoryPath }))
    console.log('load', directoryPath)
    try {
      let entries: DetailedEntry[] = []
      if (url) {
        if (url.pathname === 'ratings') {
          const paths = pathsMap[Number(url.params.score ?? 0)] ?? []
          entries = await window.electronAPI.getDetailedEntriesForPaths(paths)
        }
      } else {
        entries =
          await window.electronAPI.getDetailedEntries(currentDirectoryPath)
      }
      dispatch(loaded({ tabIndex, entries }))
    } catch (e) {
      console.log('erro', currentDirectoryPath)
      dispatch(loaded({ tabIndex, error: true }))
    }
  }

export const startEditing =
  (path: string): AppThunk =>
  async (dispatch, getState) => {
    const { startEditing } = explorerSlice.actions
    const tabIndex = selectTabIndex(getState())
    dispatch(startEditing({ tabIndex, path }))
  }

export const finishEditing = (): AppThunk => async (dispatch, getState) => {
  const { finishEditing } = explorerSlice.actions
  const tabIndex = selectTabIndex(getState())
  dispatch(finishEditing({ tabIndex }))
}

export const focus =
  (path: string): AppThunk =>
  async (dispatch, getState) => {
    const { focus } = explorerSlice.actions
    const tabIndex = selectTabIndex(getState())
    dispatch(focus({ tabIndex, path }))
  }

export const blur = (): AppThunk => async (dispatch, getState) => {
  const { blur } = explorerSlice.actions
  const tabIndex = selectTabIndex(getState())
  dispatch(blur({ tabIndex }))
}

export const rangeSelect =
  (path: string): AppThunk =>
  async (dispatch, getState) => {
    const { rangeSelect } = explorerSlice.actions
    const tabIndex = selectTabIndex(getState())
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
    dispatch(rangeSelect({ tabIndex, paths: newPaths }))
  }

export const select =
  (path: string): AppThunk =>
  async (dispatch, getState) => {
    const { select } = explorerSlice.actions
    const tabIndex = selectTabIndex(getState())
    dispatch(select({ tabIndex, path }))
  }

export const multiSelect =
  (path: string): AppThunk =>
  async (dispatch, getState) => {
    const { multiSelect } = explorerSlice.actions
    const tabIndex = selectTabIndex(getState())
    dispatch(multiSelect({ tabIndex, path }))
  }

export const selectAll = (): AppThunk => async (dispatch, getState) => {
  const { selectAll } = explorerSlice.actions
  const tabIndex = selectTabIndex(getState())
  const contents = selectContents(getState())
  const paths = contents.map((content) => content.path)
  dispatch(selectAll({ tabIndex, paths }))
}

export const unselectAll = (): AppThunk => async (dispatch, getState) => {
  const { unselectAll } = explorerSlice.actions
  const tabIndex = selectTabIndex(getState())
  dispatch(unselectAll({ tabIndex }))
}

export const newFolder =
  (directoryPath: string): AppThunk =>
  async (dispatch, getState) => {
    const { add, focus, select, startEditing } = explorerSlice.actions
    const tabIndex = selectTabIndex(getState())
    const entry = await window.electronAPI.createDirectory(directoryPath)
    dispatch(add({ tabIndex, entries: [entry] }))
    dispatch(select({ tabIndex, path: entry.path }))
    dispatch(focus({ tabIndex, path: entry.path }))
    dispatch(startEditing({ tabIndex, path: entry.path }))
  }

export const moveToTrash =
  (paths?: string[]): AppThunk =>
  async (dispatch, getState) => {
    const { remove, unselect } = explorerSlice.actions
    const tabIndex = selectTabIndex(getState())
    const selected = selectSelected(getState())
    const targetPaths = paths ?? selected
    await window.electronAPI.moveEntriesToTrash(targetPaths)
    dispatch(remove({ tabIndex, paths: targetPaths }))
    dispatch(unselect({ tabIndex, paths: targetPaths }))
  }

// TODO: update favorites and ratings
export const rename =
  (path: string, newName: string): AppThunk =>
  async (dispatch, getState) => {
    const { add, focus, remove, select } = explorerSlice.actions
    const tabIndex = selectTabIndex(getState())
    const entry = await window.electronAPI.renameEntry(path, newName)
    dispatch(remove({ tabIndex, paths: [path] }))
    dispatch(add({ tabIndex, entries: [entry] }))
    dispatch(select({ tabIndex, path: entry.path }))
    dispatch(focus({ tabIndex, path: entry.path }))
  }

// TODO: update favorites and ratings
export const move =
  (paths: string[], directoryPath: string): AppThunk =>
  async (dispatch, getState) => {
    const { unselect } = explorerSlice.actions
    const tabIndex = selectTabIndex(getState())
    await window.electronAPI.moveEntries(paths, directoryPath)
    dispatch(unselect({ tabIndex, paths }))
  }

export const copy = (): AppThunk => async (_, getState) => {
  const selected = selectSelected(getState())
  await window.electronAPI.copyEntries(selected)
}

export const paste = (): AppThunk => async (_, getState) => {
  const currentDirectoryPath = selectCurrentDirectoryPath(getState())
  const zephySchema = selectZephySchema(getState())
  if (zephySchema) {
    return
  }
  await window.electronAPI.pasteEntries(currentDirectoryPath)
}

export const handle =
  (
    eventType: 'create' | 'update' | 'delete',
    directoryPath: string,
    filePath: string,
  ): AppThunk =>
  async (dispatch, getState) => {
    const tabs = selectTabs(getState())
    const getCurrentHistory = selectGetCurrentHistory(getState())
    tabs.forEach(async (_, tabIndex) => {
      const currentDirectoryPath = getCurrentHistory(tabIndex).directoryPath
      if (directoryPath !== currentDirectoryPath) {
        return
      }
      const { add, remove } = explorerSlice.actions
      switch (eventType) {
        case 'create':
        case 'update': {
          const entry = await window.electronAPI.getDetailedEntry(filePath)
          return dispatch(add({ tabIndex, entries: [entry] }))
        }
        case 'delete':
          return dispatch(remove({ tabIndex, paths: [filePath] }))
      }
    })
  }
