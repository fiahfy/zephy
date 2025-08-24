import {
  createSelector,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit'
import type { Entry } from '~/interfaces'
import type { AppState, AppThunk } from '~/store'
import { selectCurrentSelectedContents } from '~/store/explorer-list'
import { selectRating, selectScoreByPath } from '~/store/rating'
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
}

const initialState: State = {
  anchor: undefined,
  editing: undefined,
  entries: [],
  error: false,
  focused: undefined,
  loading: false,
  selected: [],
}

export const previewSlice = createSlice({
  name: 'preview',
  initialState,
  reducers: {
    load(state) {
      return {
        ...state,
        entries: [],
        loading: true,
        error: false,
      }
    },
    loaded(
      state,
      action: PayloadAction<{
        entries: Entry[]
      }>,
    ) {
      const { entries } = action.payload
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
    loadFailed(state) {
      return {
        ...state,
        entries: [],
        error: true,
        focused: undefined,
        loading: false,
        selected: [],
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

const selectPath = (_state: AppState, path: string) => path

const isEditing = (editing: string | undefined, path: string) =>
  editing === path

export const selectEditingByPath = createSelector(
  selectEditing,
  selectPath,
  (editing, path) => isEditing(editing, path),
)

const isFocused = (focused: string | undefined, path: string) =>
  focused === path

export const selectFocusedByPath = createSelector(
  selectFocused,
  selectPath,
  (focused, path) => isFocused(focused, path),
)

const isSelected = (selected: string[], path: string) => selected.includes(path)

export const selectSelectedByPath = createSelector(
  selectSelected,
  selectPath,
  (selected, path) => isSelected(selected, path),
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

  dispatch(load())
  try {
    const entries = await window.electronAPI.getEntries(previewContent.path)
    dispatch(loaded({ entries }))
  } catch {
    dispatch(loadFailed())
  }
}

export const addSelection =
  (path: string): AppThunk =>
  async (dispatch, getState) => {
    const { addSelection } = previewSlice.actions

    const selected = selectSelected(getState())
    const anchor = selected[selected.length - 1]

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
