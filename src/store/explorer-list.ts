import {
  type PayloadAction,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit'
import type { Content, DetailedEntry } from '~/interfaces'
import type { AppState, AppThunk } from '~/store'
import { changeFavoritePath, removeFromFavorites } from '~/store/favorite'
import { showNotification } from '~/store/notification'
import {
  changeRatingPath,
  removeRating,
  selectRating,
  selectScoreByPath,
  selectScoreToPathsMap,
} from '~/store/rating'
import { openEntry, selectShouldShowHiddenFiles } from '~/store/settings'
import {
  changeDirectory,
  selectCurrentDirectoryPath,
  selectCurrentTabId,
  selectDirectoryPathByTabId,
  selectQueryByTabId,
  selectSortOptionByTabIdAndDirectoryPath,
  selectTabs,
} from '~/store/window'
import { isHiddenFile } from '~/utils/file'
import { parseZephyUrl } from '~/utils/url'

type ExplorerState = {
  anchor: string | undefined
  editing: string | undefined
  entries: DetailedEntry[]
  error: boolean
  focused: string | undefined
  loading: boolean
  selected: string[]
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
}

const getErrorMessage = (e: Error): string =>
  e.message.includes('Error: ') ? e.message.split('Error: ')[1] : e.message

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
          error,
          focused,
          loading: false,
          selected,
        },
      }
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
      const focused =
        explorer.focused && paths.includes(explorer.focused)
          ? undefined
          : explorer.focused
      const selected = explorer.selected.filter((path) => !paths.includes(path))
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
  copyTab,
  removeTab,
  removeOtherTabs,
  removeSelection,
  setAnchor,
  unfocus,
} = explorerListSlice.actions

export default explorerListSlice.reducer

export const selectExplorerList = (state: AppState) => state.explorerList

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

export const selectAnchorByTabId = createSelector(
  selectExplorerByTabId,
  (explorer) => explorer.anchor,
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

export const selectCurrentSelected = (state: AppState) =>
  selectSelectedByTabId(state, selectCurrentTabId(state))

export const selectCurrentContents = (state: AppState) =>
  selectContentsByTabId(state, selectCurrentTabId(state))

export const selectCurrentSelectedContents = (state: AppState) =>
  selectSelectedContentsByTabId(state, selectCurrentTabId(state))

export const load =
  (tabId: number): AppThunk =>
  async (dispatch, getState) => {
    const { loaded, loading } = explorerListSlice.actions

    const directoryPath = selectDirectoryPathByTabId(getState(), tabId)
    const scoreToPathsMap = selectScoreToPathsMap(getState())
    if (!directoryPath) {
      return
    }
    const url = parseZephyUrl(directoryPath)
    dispatch(loading({ tabId }))
    try {
      let entries: DetailedEntry[] = []
      if (url) {
        if (url.pathname === 'ratings') {
          const paths = scoreToPathsMap[Number(url.params.score ?? 0)] ?? []
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

export const startEditing =
  (tabId: number, path: string): AppThunk =>
  async (dispatch) => {
    const { startEditing } = explorerListSlice.actions

    dispatch(startEditing({ tabId, path }))
  }

export const finishEditing =
  (tabId: number): AppThunk =>
  async (dispatch) => {
    const { finishEditing } = explorerListSlice.actions

    dispatch(finishEditing({ tabId }))
  }

export const focus =
  (tabId: number, path: string): AppThunk =>
  async (dispatch) => {
    const { focus } = explorerListSlice.actions

    dispatch(focus({ tabId, path }))
  }

export const blur =
  (tabId: number): AppThunk =>
  async (dispatch) => {
    const { blur } = explorerListSlice.actions

    dispatch(blur({ tabId }))
  }

export const select =
  (tabId: number, path: string): AppThunk =>
  async (dispatch) => {
    const { select } = explorerListSlice.actions

    dispatch(select({ tabId, path }))
  }

export const toggleSelection =
  (tabId: number, path: string): AppThunk =>
  async (dispatch) => {
    const { toggleSelection } = explorerListSlice.actions

    dispatch(toggleSelection({ tabId, path }))
  }

export const addSelection =
  (tabId: number, path: string, anchorPath?: string): AppThunk =>
  async (dispatch, getState) => {
    const { addSelection } = explorerListSlice.actions

    const contents = selectContentsByTabId(getState(), tabId)
    const paths = contents.map((content) => content.path)

    let newPaths: string[]
    if (anchorPath) {
      const index = paths.indexOf(path)
      const prevIndex = paths.indexOf(anchorPath)
      newPaths =
        prevIndex < index
          ? paths.slice(prevIndex, index + 1)
          : paths.slice(index, prevIndex + 1)
    } else {
      newPaths = [path]
    }

    dispatch(addSelection({ tabId, paths: newPaths }))
  }

export const unselectAll =
  (tabId: number): AppThunk =>
  async (dispatch) => {
    const { unselectAll } = explorerListSlice.actions
    dispatch(unselectAll({ tabId }))
  }

export const rename =
  (tabId: number, path: string, newName: string): AppThunk =>
  async (dispatch, getState) => {
    const { addEntries, focus, removeEntries, select } =
      explorerListSlice.actions

    try {
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
    } catch (e) {
      if (e instanceof Error) {
        dispatch(
          showNotification({ message: getErrorMessage(e), type: 'error' }),
        )
      }
    }
  }

export const refreshInCurrentTab =
  (): AppThunk => async (dispatch, getState) => {
    const tabId = selectCurrentTabId(getState())
    dispatch(load(tabId))
  }

export const selectAllInCurrentTab =
  (): AppThunk => async (dispatch, getState) => {
    const { selectAll } = explorerListSlice.actions

    const tabId = selectCurrentTabId(getState())
    const contents = selectContentsByTabId(getState(), tabId)

    const paths = contents.map((content) => content.path)
    dispatch(selectAll({ tabId, paths }))
  }

export const newFolderInCurrentTab =
  (directoryPath: string): AppThunk =>
  async (dispatch, getState) => {
    const { addEntries, focus, select, startEditing } =
      explorerListSlice.actions

    const tabId = selectCurrentTabId(getState())
    const entry = await window.electronAPI.createDirectory(directoryPath)
    dispatch(addEntries({ tabId, entries: [entry] }))
    dispatch(select({ tabId, path: entry.path }))
    dispatch(focus({ tabId, path: entry.path }))
    dispatch(startEditing({ tabId, path: entry.path }))
  }

export const startRenamingInCurrentTab =
  (path?: string): AppThunk =>
  async (dispatch, getState) => {
    const { focus, select, startEditing } = explorerListSlice.actions

    const tabId = selectCurrentTabId(getState())
    const selected = selectCurrentSelected(getState())
    const targetPath = path ?? selected[0]
    if (!targetPath) {
      return
    }
    dispatch(select({ tabId, path: targetPath }))
    dispatch(focus({ tabId, path: targetPath }))
    dispatch(startEditing({ tabId, path: targetPath }))
  }

export const moveFromCurrentTab =
  (paths: string[], directoryPath: string): AppThunk =>
  async (dispatch) => {
    try {
      const entries = await window.electronAPI.moveEntries(paths, directoryPath)
      for (let i = 0; i < paths.length; i++) {
        const path = paths[i]
        const entry = entries[i]
        dispatch(changeFavoritePath({ oldPath: path, newPath: entry.path }))
        dispatch(changeRatingPath({ oldPath: path, newPath: entry.path }))
      }
    } catch (e) {
      if (e instanceof Error) {
        dispatch(
          showNotification({ message: getErrorMessage(e), type: 'error' }),
        )
      }
    }
  }

export const copyFromCurrentTab = (): AppThunk => async (_, getState) => {
  const selected = selectCurrentSelected(getState())
  await window.electronAPI.copyEntries(selected)
}

export const pasteToCurrentTab = (): AppThunk => async (_, getState) => {
  const directoryPath = selectCurrentDirectoryPath(getState())
  const zephyUrl = parseZephyUrl(directoryPath)
  if (zephyUrl) {
    return
  }
  await window.electronAPI.pasteEntries(directoryPath)
}

// TODO: sidebar/tab or application menu から呼び出される、 application menu から呼び出された場合は current tab の選択状態から対象を決定する
export const moveToTrashFromCurrentTab =
  (paths?: string[]): AppThunk =>
  async (dispatch, getState) => {
    const tabId = selectCurrentTabId(getState())
    const selected = selectSelectedByTabId(getState(), tabId)
    const targetPaths = paths ?? selected
    await window.electronAPI.moveEntriesToTrash(targetPaths)
    for (const path of targetPaths) {
      dispatch(removeFromFavorites(path))
      dispatch(removeRating({ path }))
    }
  }

// TODO: sidebar/tab or application menu から呼び出される、 application menu から呼び出された場合は current tab の選択状態から対象を決定する
export const openFromCurrentTab =
  (path?: string): AppThunk =>
  async (dispatch, getState) => {
    const selected = selectCurrentSelected(getState())
    const targetPath = path ?? selected[0]
    if (!targetPath) {
      return
    }
    const entry = await window.electronAPI.getDetailedEntry(targetPath)
    const action =
      entry.type === 'directory'
        ? changeDirectory(entry.path)
        : openEntry(entry.path)
    dispatch(action)
  }

export const handle =
  (
    eventType: 'create' | 'update' | 'delete',
    directoryPath: string,
    filePath: string,
  ): AppThunk =>
  async (dispatch, getState) => {
    const { addEntries, removeEntries } = explorerListSlice.actions

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
