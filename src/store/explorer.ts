import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit'
import { Content, DetailedEntry } from '~/interfaces'
import { AppState, AppThunk } from '~/store'
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
  selectCurrentTabIndex,
  selectDirectoryPathByTabIndex,
  selectHistoryByTabIndex,
  selectSortOptionByDirectoryPath,
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
  [tabIndex: number]: ExplorerState
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

export const explorerSlice = createSlice({
  name: 'explorer',
  initialState,
  reducers: {
    addTab(state, action: PayloadAction<{ tabIndex: number }>) {
      const { tabIndex } = action.payload
      return {
        ...Object.keys(state).reduce((acc, i) => {
          const index = Number(i)
          const newIndex = index >= tabIndex ? index + 1 : index
          const explorer = state[Number(index)]
          return {
            ...acc,
            [newIndex]: explorer,
          }
        }, {} as State),
        [tabIndex]: defaultExplorerState,
      }
    },
    copyTab(state, action: PayloadAction<{ tabIndex: number }>) {
      const { tabIndex } = action.payload
      const explorer = state[tabIndex]
      return {
        ...Object.keys(state).reduce((acc, i) => {
          const index = Number(i)
          const newIndex = index >= tabIndex ? index + 1 : index
          const explorer = state[Number(index)]
          return {
            ...acc,
            [newIndex]: explorer,
          }
        }, {} as State),
        [tabIndex]: {
          ...explorer,
          entries: [...explorer.entries],
          selected: [...explorer.selected],
        },
      }
    },
    removeTab(state, action: PayloadAction<{ tabIndex: number }>) {
      const { tabIndex } = action.payload
      return Object.keys(state).reduce((acc, i) => {
        const index = Number(i)
        if (index === tabIndex) {
          return { ...acc }
        }
        const newIndex = index > tabIndex ? index - 1 : index
        const explorer = state[Number(index)]
        return {
          ...acc,
          [newIndex]: explorer,
        }
      }, {} as State)
    },
    removeOtherTabs(state, action: PayloadAction<{ tabIndex: number }>) {
      const { tabIndex } = action.payload
      return Object.keys(state).reduce((acc, i) => {
        const index = Number(i)
        if (index !== tabIndex) {
          return { ...acc }
        }
        const newIndex = 0
        const explorer = state[Number(index)]
        return {
          ...acc,
          [newIndex]: explorer,
        }
      }, {} as State)
    },
    loading(
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
          entries: [],
          loading: true,
          error: false,
        },
      }
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
    setQuery(
      state,
      action: PayloadAction<{ tabIndex: number; query: string }>,
    ) {
      const { tabIndex, query } = action.payload
      const explorer = state[tabIndex] ?? defaultExplorerState
      return { ...state, [tabIndex]: { ...explorer, query } }
    },
    addEntries(
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
    removeEntries(
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

export const { addTab, copyTab, removeTab, removeOtherTabs } =
  explorerSlice.actions

export default explorerSlice.reducer

export const selectExplorer = (state: AppState) => state.explorer

const selectTabIndex = (_state: AppState, tabIndex: number) => tabIndex

export const selectExplorerByTabIndex = createSelector(
  selectExplorer,
  selectTabIndex,
  (explorer, tabIndex) => explorer[tabIndex] ?? defaultExplorerState,
)

export const selectEntriesByTabIndex = createSelector(
  selectExplorerByTabIndex,
  (explorer) => explorer.entries,
)

export const selectErrorByTabIndex = createSelector(
  selectExplorerByTabIndex,
  (explorer) => explorer.error,
)

export const selectLoadingByTabIndex = createSelector(
  selectExplorerByTabIndex,
  (explorer) => explorer.loading,
)

export const selectQueryByTabIndex = createSelector(
  selectExplorerByTabIndex,
  (explorer) => explorer.query,
)

const selectPath = (_state: AppState, _tabIndex: number, path: string) => path

const selectEditing = (editing: string | undefined, path: string) =>
  editing === path

export const selectEditingByTabIndex = createSelector(
  selectExplorerByTabIndex,
  (explorer) => explorer.editing,
)

export const selectEditingByPath = createSelector(
  selectEditingByTabIndex,
  selectPath,
  (editing, path) => selectEditing(editing, path),
)

const selectFocused = (focused: string | undefined, path: string) =>
  focused === path

export const selectFocusedByTabIndex = createSelector(
  selectExplorerByTabIndex,
  (explorer) => explorer.focused,
)

export const selectFocusedByPath = createSelector(
  selectFocusedByTabIndex,
  selectPath,
  (focused, path) => selectFocused(focused, path),
)

const selectSelected = (selected: string[], path: string) =>
  selected.includes(path)

export const selectSelectedByTabIndex = createSelector(
  selectExplorerByTabIndex,
  (explorer) => explorer.selected,
)

export const selectSelectedByPath = createSelector(
  selectSelectedByTabIndex,
  selectPath,
  (selected, path) => selectSelected(selected, path),
)

export const selectContentsByTabIndex = createSelector(
  selectEntriesByTabIndex,
  selectQueryByTabIndex,
  (state: AppState, tabIndex: number) =>
    selectSortOptionByDirectoryPath(
      state,
      selectDirectoryPathByTabIndex(state, tabIndex),
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
        } else {
          result = 0
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

export const selectSelectedContentsByTabIndex = createSelector(
  selectContentsByTabIndex,
  selectSelectedByTabIndex,
  (contents, selected) =>
    contents.filter((content: Content) =>
      selectSelected(selected, content.path),
    ),
)

/* for current tab */

export const selectCurrentExplorer = (state: AppState) =>
  selectExplorerByTabIndex(state, selectCurrentTabIndex(state))

export const selectCurrentLoading = createSelector(
  selectCurrentExplorer,
  (currentExplorer) => currentExplorer.loading,
)

export const selectCurrentQuery = createSelector(
  selectCurrentExplorer,
  (currentExplorer) => currentExplorer.query,
)

export const selectCurrentSelected = (state: AppState) =>
  selectSelectedByTabIndex(state, selectCurrentTabIndex(state))

export const selectCurrentContents = (state: AppState) =>
  selectContentsByTabIndex(state, selectCurrentTabIndex(state))

export const selectCurrentSelectedContents = (state: AppState) =>
  selectSelectedContentsByTabIndex(state, selectCurrentTabIndex(state))

export const load =
  (tabIndex: number): AppThunk =>
  async (dispatch, getState) => {
    const { loaded, loading, unselectAll } = explorerSlice.actions
    const directoryPath = selectDirectoryPathByTabIndex(getState(), tabIndex)
    const pathsMap = selectPathsByScore(getState())
    if (!directoryPath) {
      return
    }
    const url = parseZephyUrl(directoryPath)
    dispatch(unselectAll({ tabIndex }))
    dispatch(loading({ tabIndex }))
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
      dispatch(loaded({ tabIndex, entries }))
    } catch (e) {
      dispatch(loaded({ tabIndex, error: true }))
    }
  }

export const refresh = (): AppThunk => async (dispatch, getState) => {
  const tabIndex = selectCurrentTabIndex(getState())
  dispatch(load(tabIndex))
}

export const search =
  (query: string): AppThunk =>
  async (dispatch, getState) => {
    const { setQuery, unselect } = explorerSlice.actions
    const tabIndex = selectCurrentTabIndex(getState())
    dispatch(setQuery({ tabIndex, query }))
    dispatch(addQuery({ query }))
    const selected = selectSelectedByTabIndex(getState(), tabIndex)
    const contents = selectContentsByTabIndex(getState(), tabIndex)
    const paths = contents.reduce(
      (acc, content) => acc.filter((path) => path !== content.path),
      selected,
    )
    dispatch(unselect({ tabIndex, paths }))
  }

export const startEditing =
  (path: string): AppThunk =>
  async (dispatch, getState) => {
    const { startEditing } = explorerSlice.actions
    const tabIndex = selectCurrentTabIndex(getState())
    dispatch(startEditing({ tabIndex, path }))
  }

export const finishEditing = (): AppThunk => async (dispatch, getState) => {
  const { finishEditing } = explorerSlice.actions
  const tabIndex = selectCurrentTabIndex(getState())
  dispatch(finishEditing({ tabIndex }))
}

export const focus =
  (path: string): AppThunk =>
  async (dispatch, getState) => {
    const { focus } = explorerSlice.actions
    const tabIndex = selectCurrentTabIndex(getState())
    dispatch(focus({ tabIndex, path }))
  }

export const blur = (): AppThunk => async (dispatch, getState) => {
  const { blur } = explorerSlice.actions
  const tabIndex = selectCurrentTabIndex(getState())
  dispatch(blur({ tabIndex }))
}

export const rangeSelect =
  (path: string): AppThunk =>
  async (dispatch, getState) => {
    const { rangeSelect } = explorerSlice.actions
    const tabIndex = selectCurrentTabIndex(getState())
    const contents = selectContentsByTabIndex(getState(), tabIndex)
    const selected = selectSelectedByTabIndex(getState(), tabIndex)
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
    const tabIndex = selectCurrentTabIndex(getState())
    dispatch(select({ tabIndex, path }))
  }

export const multiSelect =
  (path: string): AppThunk =>
  async (dispatch, getState) => {
    const { multiSelect } = explorerSlice.actions
    const tabIndex = selectCurrentTabIndex(getState())
    dispatch(multiSelect({ tabIndex, path }))
  }

export const selectAll = (): AppThunk => async (dispatch, getState) => {
  const { selectAll } = explorerSlice.actions
  const tabIndex = selectCurrentTabIndex(getState())
  const contents = selectContentsByTabIndex(getState(), tabIndex)
  const paths = contents.map((content) => content.path)
  dispatch(selectAll({ tabIndex, paths }))
}

export const unselectAll = (): AppThunk => async (dispatch, getState) => {
  const { unselectAll } = explorerSlice.actions
  const tabIndex = selectCurrentTabIndex(getState())
  dispatch(unselectAll({ tabIndex }))
}

export const newFolder =
  (directoryPath: string): AppThunk =>
  async (dispatch, getState) => {
    const { addEntries, focus, select, startEditing } = explorerSlice.actions
    const tabIndex = selectCurrentTabIndex(getState())
    const entry = await window.electronAPI.createDirectory(directoryPath)
    dispatch(addEntries({ tabIndex, entries: [entry] }))
    dispatch(select({ tabIndex, path: entry.path }))
    dispatch(focus({ tabIndex, path: entry.path }))
    dispatch(startEditing({ tabIndex, path: entry.path }))
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
    const tabIndex = selectCurrentTabIndex(getState())
    const selected = selectSelectedByTabIndex(getState(), tabIndex)
    const targetPaths = paths ?? selected
    await window.electronAPI.moveEntriesToTrash(targetPaths)
    targetPaths.forEach((path) => {
      dispatch(removeFromFavorites(path))
      dispatch(removeRating({ path }))
    })
    dispatch(unselect({ tabIndex, paths: targetPaths }))
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
    const tabIndex = selectCurrentTabIndex(getState())
    const entry = await window.electronAPI.renameEntry(path, newName)
    // get the selected paths after renaming
    const selected = selectSelectedByTabIndex(getState(), tabIndex)
    dispatch(changeFavoritePath({ oldPath: path, newPath: entry.path }))
    dispatch(changeRatingPath({ oldPath: path, newPath: entry.path }))
    dispatch(removeEntries({ tabIndex, paths: [path] }))
    dispatch(addEntries({ tabIndex, entries: [entry] }))
    // do not focus if the renamed entry is not selected
    if (selected.length === 1 && selected[0] === path) {
      dispatch(select({ tabIndex, path: entry.path }))
      dispatch(focus({ tabIndex, path: entry.path }))
    }
  }

export const move =
  (paths: string[], directoryPath: string): AppThunk =>
  async (dispatch, getState) => {
    const { unselect } = explorerSlice.actions
    const tabIndex = selectCurrentTabIndex(getState())
    const entries = await window.electronAPI.moveEntries(paths, directoryPath)
    paths.forEach((path, i) => {
      const entry = entries[i]
      dispatch(changeFavoritePath({ oldPath: path, newPath: entry.path }))
      dispatch(changeRatingPath({ oldPath: path, newPath: entry.path }))
    })
    dispatch(unselect({ tabIndex, paths }))
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
    const tabs = selectTabs(getState())
    tabs.forEach(async (_, tabIndex) => {
      const history = selectHistoryByTabIndex(getState(), tabIndex)
      const currentDirectoryPath = history.directoryPath
      if (directoryPath !== currentDirectoryPath) {
        return
      }
      const { addEntries, removeEntries } = explorerSlice.actions
      switch (eventType) {
        case 'create':
        case 'update': {
          const entry = await window.electronAPI.getDetailedEntry(filePath)
          return dispatch(addEntries({ tabIndex, entries: [entry] }))
        }
        case 'delete':
          return dispatch(removeEntries({ tabIndex, paths: [filePath] }))
      }
    })
  }
