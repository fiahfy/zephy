import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit'

import { Content, DetailedEntry } from 'interfaces'
import { AppState, AppThunk } from 'store'
import { add } from 'store/queryHistory'
import { selectGetRating } from 'store/rating'
import { selectShouldShowHiddenFiles } from 'store/settings'
import {
  selectCurrentDirectory,
  selectCurrentSortOption,
  selectExplorable,
} from 'store/window'
import { isHiddenFile } from 'utils/file'

type State = {
  editing: string | undefined
  entries: DetailedEntry[]
  focused: string | undefined
  loading: boolean
  query: string
  selected: string[]
}

const initialState: State = {
  editing: undefined,
  entries: [],
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
    loaded(state, action: PayloadAction<DetailedEntry[]>) {
      const entries = action.payload
      return {
        ...state,
        entries,
        loading: false,
        query: '',
      }
    },
    loading(state) {
      return {
        ...state,
        entries: [],
        loading: true,
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
    setSelected(state, action: PayloadAction<string[]>) {
      const selected = action.payload
      return { ...state, selected }
    },
  },
})

export const { focus, blur, startEditing, finishEditing } =
  explorerSlice.actions

export default explorerSlice.reducer

export const selectExplorer = (state: AppState) => state.explorer

export const selectEntries = createSelector(
  selectExplorer,
  (explorer) => explorer.entries,
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
          !query || entry.name.toLowerCase().includes(query.toLowerCase()),
      )
      .map((entry) => ({
        ...entry,
        rating: getRating(entry.path),
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
  const explorable = selectExplorable(getState())
  if (!explorable) {
    return
  }
  dispatch(loading())
  try {
    const currentDirectory = selectCurrentDirectory(getState())
    const entries = await window.electronAPI.getDetailedEntries(
      currentDirectory,
    )
    dispatch(loaded(entries))
  } catch (e) {
    dispatch(loaded([]))
  }
}

export const setSelected =
  (paths: string[]): AppThunk =>
  async (dispatch) => {
    const { setSelected } = explorerSlice.actions
    dispatch(setSelected(paths))
    // update application menu after dispatch, because it is little bit slow
    await window.electronAPI.applicationMenu.setState(paths)
  }

export const select =
  (path: string): AppThunk =>
  async (dispatch) => {
    dispatch(setSelected([path]))
  }

export const multiSelect =
  (path: string): AppThunk =>
  async (dispatch, getState) => {
    const selected = selectSelected(getState())
    const newSelected = selected.includes(path)
      ? selected.filter((p) => p !== path)
      : [...selected, path]
    dispatch(setSelected(newSelected))
  }

export const rangeSelect =
  (path: string): AppThunk =>
  async (dispatch, getState) => {
    const contents = selectContents(getState())
    const selected = selectSelected(getState())
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
    const newSelected = [
      ...selected.filter((p) => !newPaths.includes(p)),
      ...newPaths,
    ]
    dispatch(setSelected(newSelected))
  }

export const unselect = (): AppThunk => async (dispatch) => {
  dispatch(setSelected([]))
}

export const newFolder =
  (directoryPath: string): AppThunk =>
  async (dispatch) => {
    const { add } = explorerSlice.actions
    const entry = await window.electronAPI.createDirectory(directoryPath)
    dispatch(add([entry]))
    dispatch(select(entry.path))
  }

export const moveToTrash =
  (paths: string[]): AppThunk =>
  async (dispatch) => {
    const { remove } = explorerSlice.actions
    await window.electronAPI.trashEntries(paths)
    dispatch(remove(paths))
    dispatch(unselect())
  }

export const rename =
  (path: string, newName: string): AppThunk =>
  async (dispatch) => {
    const { add, remove } = explorerSlice.actions
    const entry = await window.electronAPI.renameEntry(path, newName)
    dispatch(remove([path]))
    dispatch(add([entry]))
    dispatch(select(entry.path))
  }

export const move =
  (paths: string[], directoryPath: string): AppThunk =>
  async (dispatch) => {
    await window.electronAPI.moveEntries(paths, directoryPath)
    dispatch(unselect())
  }

export const handle =
  (
    eventType: 'create' | 'delete',
    directoryPath: string,
    filePath: string,
  ): AppThunk =>
  async (dispatch, getState) => {
    const currentDirectory = selectCurrentDirectory(getState())
    if (directoryPath !== currentDirectory) {
      return
    }
    const { add, remove } = explorerSlice.actions
    switch (eventType) {
      case 'create': {
        const entry = await window.electronAPI.getDetailedEntry(filePath)
        return dispatch(add([entry]))
      }
      case 'delete':
        return dispatch(remove([filePath]))
    }
  }
