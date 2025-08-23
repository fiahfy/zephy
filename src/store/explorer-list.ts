import {
  createSelector,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit'
import type { Content, Entry } from '~/interfaces'
import type { AppState, AppThunk } from '~/store'
import { changeFavoritePath, removeFromFavorites } from '~/store/favorite'
import { showError, showNotification } from '~/store/notification'
import {
  changeRatingPath,
  removeRating,
  selectRating,
  selectScoreByPath,
  selectScoreToPathsMap,
} from '~/store/rating'
import { openEntry, selectShouldShowHiddenFiles } from '~/store/settings'
import {
  changeUrl,
  selectCurrentTabId,
  selectCurrentUrl,
  selectQueryByTabId,
  selectSortOptionByTabIdAndUrl,
  selectTabs,
  selectUrlByTabId,
} from '~/store/window'
import { isHiddenFile } from '~/utils/file'
import { getPath, parseZephyUrl } from '~/utils/url'

type ExplorerState = {
  anchor: string | undefined
  editing: string | undefined
  entries: Entry[]
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
        entries: Entry[]
      }>,
    ) {
      const { tabId, entries } = action.payload
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
      }>,
    ) {
      const { tabId } = action.payload
      const explorer = findExplorer(state, tabId)
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
    addEntries(
      state,
      action: PayloadAction<{
        tabId: number
        entries: Entry[]
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

// Selectors for tabs

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

export const selectSelectedContentsByTabId = createSelector(
  selectContentsByTabId,
  selectSelectedByTabId,
  (contents, selected) =>
    contents.filter((content: Content) =>
      selectSelected(selected, content.path),
    ),
)

// Selectors for current tab

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

// Operations for tabs

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

    dispatch(load({ tabId }))
    try {
      const entries: Entry[] = await (async () => {
        const u = new URL(url)
        switch (u.protocol) {
          case 'file:': {
            const directoryPath = getPath(url)
            if (!directoryPath) {
              throw new Error()
            }
            return await window.electronAPI.getEntries(directoryPath)
          }
          case 'zephy:': {
            const parsed = parseZephyUrl(url)
            if (!parsed) {
              throw new Error()
            }
            if (parsed.pathname === 'ratings') {
              const scoreToPathsMap = selectScoreToPathsMap(getState())
              const paths = scoreToPathsMap[parsed.params.score] ?? []
              return await window.electronAPI.getEntriesForPaths(paths)
            } else {
              return []
            }
          }
          default:
            throw new Error()
        }
      })()
      dispatch(loaded({ tabId, entries }))
    } catch {
      dispatch(loadFailed({ tabId }))
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
      // NOTE: Get the selected paths after renaming
      const selected = selectSelectedByTabId(getState(), tabId)
      dispatch(changeFavoritePath({ oldPath: path, newPath: entry.path }))
      dispatch(changeRatingPath({ oldPath: path, newPath: entry.path }))
      dispatch(removeEntries({ tabId, paths: [path] }))
      dispatch(addEntries({ tabId, entries: [entry] }))
      // NOTE: Do not focus if the renamed entry is not selected
      if (selected.length === 1 && selected[0] === path) {
        dispatch(select({ tabId, path: entry.path }))
        dispatch(focus({ tabId, path: entry.path }))
      }
    } catch (e) {
      dispatch(showError(e))
    }
  }

// Operations for current tab

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

export const copyInCurrentTab = (): AppThunk => async (_, getState) => {
  const selected = selectCurrentSelected(getState())

  window.electronAPI.copyEntries(selected)
}

export const pasteInCurrentTab = (): AppThunk => async (_, getState) => {
  const url = selectCurrentUrl(getState())

  const directoryPath = getPath(url)
  if (!directoryPath) {
    return
  }
  window.electronAPI.pasteEntries(directoryPath)
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

export const moveToTrashInCurrentTab =
  (paths?: string[]): AppThunk =>
  async (dispatch, getState) => {
    const { blur, focus, select, unselectAll } = explorerListSlice.actions

    const tabId = selectCurrentTabId(getState())
    const selected = selectSelectedByTabId(getState(), tabId)
    const contents = selectContentsByTabId(getState(), tabId)
    const targetPaths = paths ?? selected
    if (targetPaths.length === 0) {
      return
    }

    if (targetPaths.some((targetPath) => selected.includes(targetPath))) {
      const path = (() => {
        const lastIndex = Math.max(
          ...contents.flatMap((content, i) =>
            targetPaths.includes(content.path) ? [i] : [],
          ),
        )
        if (lastIndex !== contents.length - 1) {
          return contents[lastIndex + 1]?.path
        }
        const filtered = contents.filter(
          (content) => !targetPaths.includes(content.path),
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

    window.electronAPI.moveEntriesToTrash(targetPaths)
  }

export const openInCurrentTab =
  (path?: string): AppThunk =>
  async (dispatch, getState) => {
    const selected = selectCurrentSelected(getState())
    const targetPath = path ?? selected[0]
    if (!targetPath) {
      return
    }

    try {
      const entry = await window.electronAPI.getEntry(targetPath)
      const action =
        entry.type === 'directory'
          ? changeUrl(entry.url)
          : openEntry(entry.path)
      dispatch(action)
    } catch (e) {
      showError(e)
    }
  }

// Operations for anywhere

export const move =
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
      dispatch(showError(e))
    }
  }

export const handle =
  (
    eventType: 'create' | 'update' | 'delete',
    directoryPath: string,
    filePath: string,
  ): AppThunk =>
  async (dispatch, getState) => {
    const { addEntries, removeEntries, removeSelection, unfocus } =
      explorerListSlice.actions

    const tabs = selectTabs(getState())
    for (const { id: tabId } of tabs) {
      const url = selectUrlByTabId(getState(), tabId)
      const currentDirectoryPath = getPath(url)
      if (directoryPath !== currentDirectoryPath) {
        continue
      }

      switch (eventType) {
        case 'create':
        case 'update': {
          try {
            const entry = await window.electronAPI.getEntry(filePath)
            dispatch(addEntries({ tabId, entries: [entry] }))
          } catch {
            // noop
          }
          break
        }
        case 'delete':
          dispatch(removeEntries({ tabId, paths: [filePath] }))
          dispatch(removeFromFavorites(filePath))
          dispatch(removeRating({ path: filePath }))
          dispatch(removeSelection({ tabId, paths: [filePath] }))
          dispatch(unfocus({ tabId, paths: [filePath] }))
          break
      }
    }
  }
