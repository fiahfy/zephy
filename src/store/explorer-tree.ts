import {
  createSelector,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit'
import type { Entry } from '~/interfaces'
import type { AppState, AppThunk } from '~/store'

type State = {
  expandedItems: string[]
  loading: boolean
  root: Entry | undefined
  selectedItems: string | undefined
}

const initialState: State = {
  expandedItems: [],
  loading: false,
  root: undefined,
  selectedItems: undefined,
}

const getDirectoryPaths = (entry: Entry, includesLeaf: boolean) => {
  const reducer = (acc: string[], entry: Entry): string[] => {
    if (entry.type === 'directory' && (includesLeaf || entry.children)) {
      return [entry.path, ...(entry.children || []).reduce(reducer, acc)]
    }
    return acc
  }
  return [entry].reduce(reducer, [])
}

const getAncestorPaths = (entry: Entry, directoryPath: string) => {
  const mapper = (entry: Entry): string[] => {
    if (entry.path === directoryPath) {
      return [entry.path]
    }

    if (entry.type === 'directory' && entry.children) {
      const items = entry.children.flatMap(mapper)
      return items.length > 0 ? [...items, entry.path] : []
    }

    return []
  }
  return [entry].flatMap(mapper).slice(1)
}

export const explorerTreeSlice = createSlice({
  name: 'explorer-tree',
  initialState,
  reducers: {
    load(state) {
      return {
        ...state,
        loading: true,
        root: undefined,
      }
    },
    loaded(
      state,
      action: PayloadAction<{
        root: Entry
      }>,
    ) {
      const { root } = action.payload
      return {
        ...state,
        loading: false,
        root,
      }
    },
    loadFailed(state) {
      return {
        ...state,
        loading: false,
        root: undefined,
      }
    },
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
    setRoot(state, action: PayloadAction<{ root: Entry | undefined }>) {
      const { root } = action.payload
      return { ...state, root }
    },
  },
})

export const { setExpandedItems, setRoot, setSelectedItems } =
  explorerTreeSlice.actions

export default explorerTreeSlice.reducer

export const selectExplorerTree = (state: AppState) => state.explorerTree

export const selectLoading = createSelector(
  selectExplorerTree,
  (explorerTree) => explorerTree.loading,
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

export const selectLoadedDirectoryPaths = createSelector(selectRoot, (root) => {
  if (!root) {
    return []
  }
  return getDirectoryPaths(root, false)
})

export const load =
  (directoryPath: string | undefined, force = false): AppThunk =>
  async (dispatch, getState) => {
    const { load, loaded, loadFailed, setExpandedItems, setSelectedItems } =
      explorerTreeSlice.actions

    const root = selectRoot(getState())
    const directories = root ? getDirectoryPaths(root, true) : []

    if (
      !force &&
      root &&
      directoryPath &&
      directories.includes(directoryPath)
    ) {
      const expandedItems = selectExpandedItems(getState())
      const newExpandedItems = [
        ...new Set([
          ...expandedItems,
          ...getAncestorPaths(root, directoryPath),
        ]),
      ]
      dispatch(setExpandedItems({ expandedItems: newExpandedItems }))
      dispatch(setSelectedItems({ selectedItems: directoryPath }))
    } else {
      const loading = selectLoading(getState())
      if (loading) {
        return
      }
      dispatch(load())
      try {
        const root = await window.electronAPI.getRootEntry(directoryPath)
        const expandedItems = getDirectoryPaths(root, false)
        dispatch(setExpandedItems({ expandedItems }))
        dispatch(setSelectedItems({ selectedItems: directoryPath }))
        dispatch(loaded({ root }))
      } catch {
        dispatch(loadFailed())
      }
    }
  }
