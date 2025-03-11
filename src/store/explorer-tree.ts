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

export const explorerTreeSlice = createSlice({
  name: 'explorer-tree',
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
  explorerTreeSlice.actions

export default explorerTreeSlice.reducer

export const selectExplorerTree = (state: AppState) => state.explorerTree

export const selectPath = createSelector(
  selectExplorerTree,
  (explorerTree) => explorerTree.path,
)

export const selectRoot = createSelector(
  selectExplorerTree,
  (explorerTree) => explorerTree.root,
)

export const selectSelectedItems = createSelector(
  selectExplorerTree,
  (explorerTree) => explorerTree.selectedItems,
)

export const selectExpandedItems = createSelector(
  selectExplorerTree,
  (explorerTree) => explorerTree.expandedItems,
)

export const load =
  (directoryPath: string | undefined): AppThunk =>
  async (dispatch) => {
    const { setExpandedItems, setRoot, setSelectedItems } =
      explorerTreeSlice.actions

    const path =
      directoryPath && isZephySchema(directoryPath) ? undefined : directoryPath
    const entry = await window.electronAPI.getRootEntry(path)
    const expandedItems = getLoadedDirectories(entry)
    dispatch(setExpandedItems({ expandedItems }))
    dispatch(setSelectedItems({ selectedItems: directoryPath }))
    dispatch(setRoot({ root: entry }))
  }
