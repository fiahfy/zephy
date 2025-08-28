import {
  createSelector,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit'
import type { Entry, FileEventType } from '~/interfaces'
import type { AppState, AppThunk } from '~/store'
import { changeFavoritePath } from '~/store/favorite'
import { showError } from '~/store/notification'
import {
  changeRatingPath,
  selectRating,
  selectScoreByPath,
} from '~/store/rating'
import { selectShouldShowHiddenFiles } from '~/store/settings'
import { isHiddenFile } from '~/utils/file'

type State = {
  anchor: string | undefined
  directoryPath: string | undefined
  editing: string | undefined
  entries: Entry[]
  error: boolean
  focused: string | undefined
  loading: boolean
  selected: string[]
  timestamp: number
}

const initialState: State = {
  anchor: undefined,
  directoryPath: undefined,
  editing: undefined,
  entries: [],
  error: false,
  focused: undefined,
  loading: false,
  selected: [],
  timestamp: 0,
}

export const previewSlice = createSlice({
  name: 'preview',
  initialState,
  reducers: {
    load(
      state,
      action: PayloadAction<{ directoryPath: string; timestamp: number }>,
    ) {
      const { directoryPath, timestamp } = action.payload
      return {
        ...state,
        directoryPath,
        entries: [],
        loading: true,
        error: false,
        timestamp,
      }
    },
    loaded(
      state,
      action: PayloadAction<{
        entries: Entry[]
        timestamp: number
      }>,
    ) {
      const { entries, timestamp } = action.payload
      if (state.timestamp !== timestamp) {
        return state
      }
      const paths = entries.map((entry) => entry.path)
      const focused =
        state.focused && paths.includes(state.focused)
          ? state.focused
          : undefined
      const selected = state.selected.filter((path) => paths.includes(path))
      return {
        ...state,
        entries,
        error: false,
        focused,
        loading: false,
        selected,
      }
    },
    loadFailed(state, action: PayloadAction<{ timestamp: number }>) {
      const { timestamp } = action.payload
      if (state.timestamp !== timestamp) {
        return state
      }
      return {
        ...state,
        entries: [],
        error: true,
        focused: undefined,
        loading: false,
        selected: [],
      }
    },
    addEntry(
      state,
      action: PayloadAction<{
        entry: Entry
      }>,
    ) {
      const { entry } = action.payload
      const entries = [
        ...state.entries.filter((e) => e.path !== entry.path),
        entry,
      ]
      return {
        ...state,
        entries,
      }
    },
    removeEntry(
      state,
      action: PayloadAction<{
        path: string
      }>,
    ) {
      const { path } = action.payload
      const entries = state.entries.filter((entry) => entry.path !== path)
      const focused =
        state.focused && state.focused === path ? undefined : state.focused
      const selected = state.selected.filter((p) => p !== path)
      return {
        ...state,
        entries,
        focused,
        selected,
      }
    },
    updateEntry(
      state,
      action: PayloadAction<{
        path: string
        entry: Entry
      }>,
    ) {
      const { path, entry } = action.payload
      if (!state.entries.find((e) => e.path === path)) {
        return state
      }
      const entries = [
        ...state.entries.filter(
          (e) => e.path !== path && e.path !== entry.path,
        ),
        entry,
      ]
      return {
        ...state,
        entries,
      }
    },
    startEditing(
      state,
      action: PayloadAction<{
        path: string
      }>,
    ) {
      const { path } = action.payload
      return { ...state, editing: path }
    },
    finishEditing(state) {
      return { ...state, editing: undefined }
    },
    focus(state, action: PayloadAction<{ path: string }>) {
      const { path } = action.payload
      return { ...state, focused: path }
    },
    unfocus(state, action: PayloadAction<{ paths: string[] }>) {
      const { paths } = action.payload
      const focused =
        state.focused && paths.includes(state.focused)
          ? undefined
          : state.focused
      return { ...state, focused }
    },
    blur(state) {
      return { ...state, focused: undefined }
    },
    select(state, action: PayloadAction<{ path: string }>) {
      const { path } = action.payload
      const selected = [path]
      return { ...state, selected }
    },
    toggleSelection(state, action: PayloadAction<{ path: string }>) {
      const { path } = action.payload
      const selected = state.selected.includes(path)
        ? state.selected.filter((p) => p !== path)
        : [...state.selected, path]
      return { ...state, selected }
    },
    addSelection(state, action: PayloadAction<{ paths: string[] }>) {
      const { paths } = action.payload
      const selected = [
        ...state.selected.filter((p) => !paths.includes(p)),
        ...paths,
      ]
      return { ...state, selected }
    },
    removeSelection(state, action: PayloadAction<{ paths: string[] }>) {
      const { paths } = action.payload
      const selected = state.selected.filter((p) => !paths.includes(p))
      return { ...state, selected }
    },
    selectAll(state, action: PayloadAction<{ paths: string[] }>) {
      const { paths } = action.payload
      const selected = paths
      return { ...state, selected }
    },
    unselectAll(state) {
      return { ...state, selected: [] }
    },
    setAnchor(state, action: PayloadAction<{ anchor: string }>) {
      const { anchor } = action.payload
      return { ...state, anchor }
    },
  },
})

export const {
  blur,
  finishEditing,
  focus,
  removeSelection,
  select,
  setAnchor,
  startEditing,
  toggleSelection,
  unfocus,
  unselectAll,
} = previewSlice.actions

export default previewSlice.reducer

export const selectPreview = (state: AppState) => state.preview

export const selectDirectoryPath = createSelector(
  selectPreview,
  (preview) => preview.directoryPath,
)

export const selectEntries = createSelector(
  selectPreview,
  (preview) => preview.entries,
)

export const selectError = createSelector(
  selectPreview,
  (preview) => preview.error,
)

export const selectLoading = createSelector(
  selectPreview,
  (preview) => preview.loading,
)

export const selectEditing = createSelector(
  selectPreview,
  (preview) => preview.editing,
)

export const selectFocused = createSelector(
  selectPreview,
  (preview) => preview.focused,
)

export const selectSelected = createSelector(
  selectPreview,
  (preview) => preview.selected,
)

export const selectAnchor = createSelector(
  selectPreview,
  (preview) => preview.anchor,
)

export const selectContents = createSelector(
  selectEntries,
  selectRating,
  selectShouldShowHiddenFiles,
  (entries, rating, shouldShowHiddenFiles) =>
    entries
      .filter((entry) => shouldShowHiddenFiles || !isHiddenFile(entry.name))
      .map((entry) => ({
        ...entry,
        score: selectScoreByPath(rating, entry.path),
      }))
      .toSorted((a, b) => a.name.localeCompare(b.name)),
)

// Selectors by path

const selectPath = (_state: AppState, path: string) => path

export const selectEditingByPath = createSelector(
  selectEditing,
  selectPath,
  (editing, path) => editing === path,
)

export const selectFocusedByPath = createSelector(
  selectFocused,
  selectPath,
  (focused, path) => focused === path,
)

export const selectSelectedByPath = createSelector(
  selectSelected,
  selectPath,
  (selected, path) => selected.includes(path),
)

// Operations

export const load =
  (directoryPath: string): AppThunk =>
  async (dispatch, getState) => {
    const { load, loaded, loadFailed } = previewSlice.actions

    const loading = selectLoading(getState())
    if (loading) {
      return
    }

    const timestamp = Date.now()

    dispatch(load({ directoryPath, timestamp }))
    try {
      const entries = await window.entryAPI.getEntries(directoryPath)
      dispatch(loaded({ entries, timestamp }))
    } catch {
      dispatch(loadFailed({ timestamp }))
    }
  }

export const addSelection =
  (path: string, useAnchor: boolean): AppThunk =>
  async (dispatch, getState) => {
    const { addSelection } = previewSlice.actions

    let anchor: string | undefined
    if (useAnchor) {
      anchor = selectAnchor(getState())
    } else {
      const selected = selectSelected(getState())
      anchor = selected[selected.length - 1]
    }

    const contents = selectContents(getState())
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

    dispatch(addSelection({ paths: newPaths }))
  }

export const focusFirst = (): AppThunk => async (dispatch, getState) => {
  const { focus, select } = previewSlice.actions

  const contents = selectContents(getState())
  const content = contents[0]
  if (!content) {
    return
  }

  dispatch(select({ path: content.path }))
  dispatch(focus({ path: content.path }))
}

export const focusByHorizontal =
  (offset: number, columns: number, multiSelect: boolean): AppThunk =>
  async (dispatch, getState) => {
    const { focus, select, unselectAll } = previewSlice.actions

    const focused = selectFocused(getState())
    const contents = selectContents(getState())
    const index = contents.findIndex((c) => c.path === focused)
    if (index < 0) {
      return dispatch(focusFirst())
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
      dispatch(unselectAll())
      dispatch(addSelection(content.path, true))
    } else {
      dispatch(select({ path: content.path }))
    }
    dispatch(focus({ path: content.path }))
  }

export const focusByVertical =
  (offset: number, columns: number, multiSelect: boolean): AppThunk =>
  async (dispatch, getState) => {
    const { focus, select, unselectAll } = previewSlice.actions

    const focused = selectFocused(getState())
    const contents = selectContents(getState())
    const index = contents.findIndex((c) => c.path === focused)
    if (index < 0) {
      return dispatch(focusFirst())
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
      dispatch(unselectAll())
      dispatch(addSelection(content.path, true))
    } else {
      dispatch(select({ path: content.path }))
    }
    dispatch(focus({ path: content.path }))
  }

export const focusTo =
  (
    position: 'first' | 'last',
    columns: number,
    multiSelect: boolean,
  ): AppThunk =>
  async (dispatch, getState) => {
    const { focus, select, unselectAll } = previewSlice.actions

    const focused = selectFocused(getState())
    const contents = selectContents(getState())
    const index = contents.findIndex((c) => c.path === focused)
    if (index < 0) {
      return dispatch(focusFirst())
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
      dispatch(unselectAll())
      dispatch(addSelection(content.path, true))
    } else {
      dispatch(select({ path: content.path }))
    }
    dispatch(focus({ path: content.path }))
  }

export const rename =
  (path: string, newName: string): AppThunk =>
  async (dispatch) => {
    const { focus, select, updateEntry } = previewSlice.actions

    try {
      const entry = await window.entryAPI.renameEntry(path, newName)
      dispatch(changeFavoritePath({ oldPath: path, newPath: entry.path }))
      dispatch(changeRatingPath({ oldPath: path, newPath: entry.path }))
      dispatch(updateEntry({ path, entry }))
      dispatch(select({ path: entry.path }))
      dispatch(focus({ path: entry.path }))
    } catch (e) {
      dispatch(showError(e))
    }
  }

export const selectAll = (): AppThunk => async (dispatch, getState) => {
  const { selectAll } = previewSlice.actions

  const contents = selectContents(getState())
  const paths = contents.map((content) => content.path)
  dispatch(selectAll({ paths }))
}

export const startRenaming =
  (path?: string): AppThunk =>
  async (dispatch, getState) => {
    const { focus, select, startEditing } = previewSlice.actions

    const focused = selectFocused(getState())

    const targetPath = path ?? focused
    if (!targetPath) {
      return
    }

    dispatch(select({ path: targetPath }))
    dispatch(focus({ path: targetPath }))
    dispatch(startEditing({ path: targetPath }))
  }

export const newFolder =
  (directoryPath: string): AppThunk =>
  async (dispatch) => {
    const { addEntry, focus, select, startEditing } = previewSlice.actions

    const entry = await window.entryAPI.createDirectory(directoryPath)
    dispatch(addEntry({ entry }))
    dispatch(select({ path: entry.path }))
    dispatch(focus({ path: entry.path }))
    dispatch(startEditing({ path: entry.path }))
  }

export const copy = (): AppThunk => async (_, getState) => {
  const selected = selectSelected(getState())
  window.entryAPI.copyEntries(selected)
}

export const paste = (): AppThunk => async (_, getState) => {
  const directoryPath = selectDirectoryPath(getState())
  if (!directoryPath) {
    return
  }

  window.entryAPI.pasteEntries(directoryPath)
}

export const moveToTrash =
  (paths?: string[]): AppThunk =>
  async (dispatch, getState) => {
    const { blur, focus, removeEntry, select, unselectAll } =
      previewSlice.actions

    const selected = selectSelected(getState())

    const targetPaths = paths ?? selected
    if (targetPaths.length === 0) {
      return
    }

    for (const targetPath of targetPaths) {
      try {
        await window.entryAPI.moveEntryToTrash(targetPath)

        if (selected.includes(targetPath)) {
          const contents = selectContents(getState())
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
            dispatch(select({ path }))
            dispatch(focus({ path }))
          } else {
            dispatch(unselectAll())
            dispatch(blur())
          }
        }

        dispatch(removeEntry({ path: targetPath }))
      } catch (e) {
        showError(e)
      }
    }
  }

export const handleFileChange =
  (eventType: FileEventType, directoryPath: string, path: string): AppThunk =>
  async (dispatch, getState) => {
    const { addEntry, removeEntry, removeSelection, unfocus, updateEntry } =
      previewSlice.actions

    const targetDirectoryPath = selectDirectoryPath(getState())
    if (directoryPath !== targetDirectoryPath) {
      return
    }

    switch (eventType) {
      case 'create': {
        try {
          const entry = await window.entryAPI.getEntry(path)
          dispatch(addEntry({ entry }))
        } catch {
          // noop
        }
        break
      }
      case 'update': {
        try {
          const entry = await window.entryAPI.getEntry(path)
          dispatch(updateEntry({ path, entry }))
        } catch {
          // noop
        }
        break
      }
      case 'delete':
        dispatch(removeEntry({ path }))
        dispatch(removeSelection({ paths: [path] }))
        dispatch(unfocus({ paths: [path] }))
        break
    }
  }
