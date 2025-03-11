import {
  type PayloadAction,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit'
import type { Entry } from '~/interfaces'
import type { AppState, AppThunk } from '~/store'
import { isZephySchema } from '~/utils/url'

type State = {
  expandedItems: string[]
  path: string | undefined
  root: Entry | undefined
  selectedItems: string | undefined
}

const initialState: State = {
  expandedItems: [],
  path: undefined,
  root: undefined,
  selectedItems: undefined,
}

const getLoadedDirectories = (entry: Entry) => {
  const reducer = (acc: string[], entry: Entry): string[] => {
    if (entry.type === 'directory' && entry.children) {
      return [entry.path, ...entry.children.reduce(reducer, acc)]
    }
    return acc
  }
  return [entry].reduce(reducer, [])
}

export const explorerTreeViewSlice = createSlice({
  name: 'explorer-tree-view',
  initialState,
  reducers: {
    setSelectedItems(
      state,
      action: PayloadAction<{ selectedItems: string | undefined }>,
    ) {
      const { selectedItems } = action.payload
      return { ...state, selectedItems }
    },
    setExpandedItems(
      state,
      action: PayloadAction<{ expandedItems: string[] }>,
    ) {
      const { expandedItems } = action.payload
      return { ...state, expandedItems }
    },
    setPath(state, action: PayloadAction<{ path: string | undefined }>) {
      const { path } = action.payload
      return { ...state, path }
    },
    setRoot(state, action: PayloadAction<{ root: Entry | undefined }>) {
      const { root } = action.payload
      return { ...state, root }
    },
  },
})

export const { setExpandedItems, setPath, setRoot, setSelectedItems } =
  explorerTreeViewSlice.actions

export default explorerTreeViewSlice.reducer

export const selectExplorerTreeView = (state: AppState) =>
  state.explorerTreeView

export const selectPath = createSelector(
  selectExplorerTreeView,
  (explorerTreeView) => explorerTreeView.path,
)

export const selectRoot = createSelector(
  selectExplorerTreeView,
  (explorerTreeView) => explorerTreeView.root,
)

export const selectSelectedItems = createSelector(
  selectExplorerTreeView,
  (explorerTreeView) => explorerTreeView.selectedItems,
)

export const selectExpandedItems = createSelector(
  selectExplorerTreeView,
  (explorerTreeView) => explorerTreeView.expandedItems,
)

export const load =
  (directoryPath: string | undefined): AppThunk =>
  async (dispatch) => {
    const { setExpandedItems, setRoot, setSelectedItems } =
      explorerTreeViewSlice.actions
    console.log('directoryPath', directoryPath)
    const path =
      directoryPath && isZephySchema(directoryPath) ? undefined : directoryPath
    const entry = await window.electronAPI.getRootEntry(path)
    const expandedItems = getLoadedDirectories(entry)
    dispatch(setExpandedItems({ expandedItems }))
    dispatch(setSelectedItems({ selectedItems: directoryPath }))
    dispatch(setRoot({ root: entry }))
  }
