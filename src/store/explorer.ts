import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit'
import { Content, DetailedEntry } from '~/interfaces'
import { AppState, AppThunk } from '~/store'
import { add } from '~/store/query'
import { selectGetScore, selectPathsByScore } from '~/store/rating'
import { selectShouldShowHiddenFiles } from '~/store/settings'
import {
  selectCurrentDirectoryPath,
  selectCurrentSortOption,
  selectZephySchema,
  selectZephyUrl,
} from '~/store/window'
import { isHiddenFile } from '~/utils/file'

type State = {
  editing: string | undefined
  entries: DetailedEntry[]
  error: boolean
  focused: string | undefined
  loading: boolean
  query: string
  selected: string[]
}

const initialState: State = {
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
    setQuery(state, action: PayloadAction<string>) {
      const query = action.payload
      return { ...state, query }
    },
    loaded(
      state,
      action: PayloadAction<{ entries?: DetailedEntry[]; error?: boolean }>,
    ) {
      const { entries = [], error = false } = action.payload
      return {
        ...state,
        entries,
        error,
        loading: false,
        query: '',
      }
    },
    loading(state) {
      return {
        ...state,
        entries: [],
        loading: true,
        error: false,
      }
    },
    add(state, action: PayloadAction<DetailedEntry[]>) {
      const entries = action.payload
      const paths = entries.map((entry) => entry.path)
      const newEntries = [
        ...state.entries.filter((entry) => !paths.includes(entry.path)),
        ...entries,
      ]
      return { ...state, entries: newEntries }
    },
    remove(state, action: PayloadAction<string[]>) {
      const paths = action.payload
      const entries = state.entries.filter(
        (entry) => !paths.includes(entry.path),
      )
      return { ...state, entries }
    },
    startEditing(state, action: PayloadAction<string>) {
      const path = action.payload
      return { ...state, editing: path }
    },
    finishEditing(state) {
      return { ...state, editing: undefined }
    },
    focus(state, action: PayloadAction<string>) {
      const path = action.payload
      return { ...state, focused: path }
    },
    blur(state) {
      return { ...state, focused: undefined }
    },
    select(state, action: PayloadAction<string>) {
      const path = action.payload
      return { ...state, selected: [path] }
    },
    multiSelect(state, action: PayloadAction<string>) {
      const path = action.payload
      const selected = state.selected.includes(path)
        ? state.selected.filter((p) => p !== path)
        : [...state.selected, path]
      return { ...state, selected }
    },
    rangeSelect(state, action: PayloadAction<string[]>) {
      const paths = action.payload
      const selected = [
        ...state.selected.filter((p) => !paths.includes(p)),
        ...paths,
      ]
      return { ...state, selected }
    },
    selectAll(state, action: PayloadAction<string[]>) {
      const paths = action.payload
      const selected = paths
      return { ...state, selected }
    },
    unselect(state) {
      return { ...state, selected: [] }
    },
  },
})

export const {
  startEditing,
  finishEditing,
  focus,
  blur,
  select,
  multiSelect,
  unselect,
} = explorerSlice.actions

export default explorerSlice.reducer

export const selectExplorer = (state: AppState) => state.explorer

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

export const searchQuery =
  (query: string): AppThunk =>
  async (dispatch) => {
    const { setQuery } = explorerSlice.actions
    dispatch(setQuery(query))
    dispatch(add(query))
  }

export const load = (): AppThunk => async (dispatch, getState) => {
  const { loading, loaded } = explorerSlice.actions
  dispatch(loading())
  try {
    let entries: DetailedEntry[] = []
    const url = selectZephyUrl(getState())
    if (url) {
      if (url.pathname === 'ratings') {
        const pathsMap = selectPathsByScore(getState())
        const paths = pathsMap[Number(url.params.score ?? 0)] ?? []
        entries =
          await window.electronAPI.entry.getDetailedEntriesForPaths(paths)
      }
    } else {
      const currentDirectoryPath = selectCurrentDirectoryPath(getState())
      entries =
        await window.electronAPI.entry.getDetailedEntries(currentDirectoryPath)
    }
    dispatch(loaded({ entries }))
  } catch (e) {
    dispatch(loaded({ error: true }))
  }
}

export const rangeSelect =
  (path: string): AppThunk =>
  async (dispatch, getState) => {
    const { rangeSelect } = explorerSlice.actions
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
    dispatch(rangeSelect(newPaths))
  }

export const selectAll = (): AppThunk => async (dispatch, getState) => {
  const { selectAll } = explorerSlice.actions
  const contents = selectContents(getState())
  const paths = contents.map((content) => content.path)
  dispatch(selectAll(paths))
}

export const newFolder =
  (directoryPath: string): AppThunk =>
  async (dispatch) => {
    const { add } = explorerSlice.actions
    const entry = await window.electronAPI.entry.createDirectory(directoryPath)
    dispatch(add([entry]))
    dispatch(select(entry.path))
    dispatch(focus(entry.path))
    dispatch(startEditing(entry.path))
  }

export const moveToTrash =
  (paths?: string[]): AppThunk =>
  async (dispatch, getState) => {
    const { remove } = explorerSlice.actions
    const selected = selectSelected(getState())
    const targetPaths = paths ?? selected
    await window.electronAPI.entry.moveToTrash(targetPaths)
    dispatch(remove(targetPaths))
    dispatch(unselect())
  }

// TODO: update favorites and ratings
export const rename =
  (path: string, newName: string): AppThunk =>
  async (dispatch) => {
    const { add, remove } = explorerSlice.actions
    const entry = await window.electronAPI.entry.rename(path, newName)
    dispatch(remove([path]))
    dispatch(add([entry]))
    dispatch(select(entry.path))
  }

// TODO: update favorites and ratings
export const move =
  (paths: string[], directoryPath: string): AppThunk =>
  async (dispatch) => {
    await window.electronAPI.entry.move(paths, directoryPath)
    dispatch(unselect())
  }

export const copy = (): AppThunk => async (_, getState) => {
  const selected = selectSelected(getState())
  await window.electronAPI.entry.copy(selected)
}

export const paste = (): AppThunk => async (_, getState) => {
  const currentDirectoryPath = selectCurrentDirectoryPath(getState())
  const zephySchema = selectZephySchema(getState())
  if (zephySchema) {
    return
  }
  await window.electronAPI.entry.paste(currentDirectoryPath)
}

export const handle =
  (
    eventType: 'create' | 'update' | 'delete',
    directoryPath: string,
    filePath: string,
  ): AppThunk =>
  async (dispatch, getState) => {
    const currentDirectoryPath = selectCurrentDirectoryPath(getState())
    if (directoryPath !== currentDirectoryPath) {
      return
    }
    const { add, remove } = explorerSlice.actions
    switch (eventType) {
      case 'create':
      case 'update': {
        const entry = await window.electronAPI.entry.getDetailedEntry(filePath)
        return dispatch(add([entry]))
      }
      case 'delete':
        return dispatch(remove([filePath]))
    }
  }
