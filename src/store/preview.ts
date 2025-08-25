import {
  createSelector,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit'
import type { Entry } from '~/interfaces'
import type { AppState, AppThunk } from '~/store'
import { selectCurrentSelectedContents } from '~/store/explorer-list'
import { removeFromFavorites } from '~/store/favorite'
import { removeRating, selectRating, selectScoreByPath } from '~/store/rating'
import { selectShouldShowHiddenFiles } from '~/store/settings'
import { isHiddenFile } from '~/utils/file'

type State = {
  anchor: string | undefined
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
    load(state, action: PayloadAction<{ timestamp: number }>) {
      const { timestamp } = action.payload
      return {
        ...state,
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
    addEntries(
      state,
      action: PayloadAction<{
        entries: Entry[]
      }>,
    ) {
      const { entries } = action.payload
      const paths = entries.map((entry) => entry.path)
      const newEntries = [
        ...state.entries.filter((entry) => !paths.includes(entry.path)),
        ...entries,
      ]
      return {
        ...state,
        entries: newEntries,
      }
    },
    removeEntries(
      state,
      action: PayloadAction<{
        paths: string[]
      }>,
    ) {
      const { paths } = action.payload
      const entries = state.entries.filter(
        (entry) => !paths.includes(entry.path),
      )
      const focused =
        state.focused && paths.includes(state.focused)
          ? undefined
          : state.focused
      const selected = state.selected.filter((path) => !paths.includes(path))
      return {
        ...state,
        entries,
        focused,
        selected,
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
  startEditing,
  finishEditing,
  focus,
  unfocus,
  blur,
  select,
  toggleSelection,
  removeSelection,
  selectAll,
  unselectAll,
  setAnchor,
} = previewSlice.actions

export default previewSlice.reducer

export const selectPreview = (state: AppState) => state.preview

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

export const selectPreviewContent = createSelector(
  selectCurrentSelectedContents,
  (previewContents) =>
    previewContents.length === 1 ? previewContents[0] : undefined,
)

export const selectPreviewContentUrl = createSelector(
  selectPreviewContent,
  (previewContent) => (previewContent ? previewContent.url : undefined),
)

export const selectPreviewContentPath = createSelector(
  selectPreviewContent,
  (previewContent) => (previewContent ? previewContent.path : undefined),
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

export const load = (): AppThunk => async (dispatch, getState) => {
  const { load, loaded, loadFailed } = previewSlice.actions

  const previewContent = selectPreviewContent(getState())
  if (!previewContent) {
    return
  }

  const loading = selectLoading(getState())
  if (loading) {
    return
  }

  const timestamp = Date.now()

  dispatch(load({ timestamp }))
  try {
    const entries = await window.electronAPI.getEntries(previewContent.path)
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

export const handle =
  (
    eventType: 'create' | 'update' | 'delete',
    directoryPath: string,
    filePath: string,
  ): AppThunk =>
  async (dispatch, getState) => {
    const { addEntries, removeEntries, removeSelection, unfocus } =
      previewSlice.actions

    const previewContentPath = selectPreviewContentPath(getState())
    if (directoryPath !== previewContentPath) {
      return
    }

    switch (eventType) {
      case 'create':
      case 'update': {
        try {
          const entry = await window.electronAPI.getEntry(filePath)
          dispatch(addEntries({ entries: [entry] }))
        } catch {
          // noop
        }
        break
      }
      case 'delete':
        dispatch(removeFromFavorites(filePath))
        dispatch(removeRating({ path: filePath }))
        dispatch(removeEntries({ paths: [filePath] }))
        dispatch(removeSelection({ paths: [filePath] }))
        dispatch(unfocus({ paths: [filePath] }))
        break
    }
  }
