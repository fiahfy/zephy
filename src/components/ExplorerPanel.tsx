import { Stack, Typography } from '@mui/material'
import {
  RichTreeView,
  type TreeViewBaseItem,
  useTreeViewApiRef,
} from '@mui/x-tree-view'
import { type SyntheticEvent, useCallback, useEffect, useMemo } from 'react'
import ExplorerTreeItem from '~/components/ExplorerTreeItem'
import Icon from '~/components/Icon'
import Panel from '~/components/Panel'
import useWatcher from '~/hooks/useWatcher'
import type { Entry } from '~/interfaces'
import { useAppDispatch, useAppSelector } from '~/store'
import {
  expandItems,
  load,
  selectExpandedItems,
  selectItems,
  selectLoadedDirectoryPaths,
  selectLoading,
  selectRoot,
  selectSelectedItems,
} from '~/store/explorer-tree'
import { selectShouldShowHiddenFiles } from '~/store/settings'
import { selectCurrentDirectoryPath } from '~/store/window'
import { isHiddenFile } from '~/utils/file'

const ExplorerPanel = () => {
  const directoryPath = useAppSelector(selectCurrentDirectoryPath)
  const loadedDirectoryPath = useAppSelector(selectLoadedDirectoryPaths)
  const loading = useAppSelector(selectLoading)
  const expandedItems = useAppSelector(selectExpandedItems)
  const root = useAppSelector(selectRoot)
  const selectedItems = useAppSelector(selectSelectedItems)
  const shouldShowHiddenFiles = useAppSelector(selectShouldShowHiddenFiles)
  const dispatch = useAppDispatch()

  const { unwatch, watch } = useWatcher()

  const apiRef = useTreeViewApiRef()

  const items = useMemo(() => {
    const mapper = (
      e: Entry,
    ): TreeViewBaseItem<{ entry?: Entry; id: string; label: string }> => {
      return {
        id: e.path,
        label: e.name,
        entry: e,
        children:
          e.type === 'directory'
            ? e.children
              ? e.children
                  .filter(
                    (entry) =>
                      shouldShowHiddenFiles || !isHiddenFile(entry.name),
                  )
                  .toSorted((a, b) => a.name.localeCompare(b.name))
                  // NOTE: Limit entry size for performance issue
                  .slice(0, 100)
                  .map(mapper)
              : [
                  {
                    id: `__loading__${e.path}`,
                    label: 'Loading items...',
                  },
                ]
            : [],
      }
    }

    return (root ? [root] : []).map(mapper)
  }, [root, shouldShowHiddenFiles])

  const handleClickRefresh = useCallback(
    () => dispatch(load(directoryPath, true)),
    [directoryPath, dispatch],
  )

  const handleSelectedItemsChange = useCallback(
    (_e: SyntheticEvent | null, itemIds: string | null) =>
      dispatch(selectItems(itemIds ?? undefined)),
    [dispatch],
  )

  const handleExpandedItemsChange = useCallback(
    async (_e: SyntheticEvent | null, itemIds: string[]) =>
      dispatch(expandItems(itemIds)),
    [dispatch],
  )

  useEffect(() => {
    dispatch(load(undefined))
  }, [dispatch])

  // biome-ignore lint/correctness/useExhaustiveDependencies: false positive
  useEffect(() => {
    if (!selectedItems) {
      return
    }
    const timer = window.setTimeout(() => {
      apiRef.current
        ?.getItemDOMElement(selectedItems)
        ?.scrollIntoView({ block: 'nearest' })
    }, 300) // NOTE: transition 300ms + 300ms
    return () => clearTimeout(timer)
  }, [root, selectedItems])

  useEffect(() => {
    const key = 'explorer-tree'
    watch(key, loadedDirectoryPath)
    return () => unwatch(key)
  }, [loadedDirectoryPath, unwatch, watch])

  return (
    <Panel onClickRefresh={handleClickRefresh} title="Explorer">
      {loading ? (
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ alignItems: 'center', px: 1 }}
        >
          <Icon type="progress" />
          <Typography noWrap variant="caption">
            Loading items...
          </Typography>
        </Stack>
      ) : (
        <RichTreeView
          apiRef={apiRef}
          expandedItems={expandedItems}
          expansionTrigger="iconContainer"
          items={items}
          onExpandedItemsChange={handleExpandedItemsChange}
          onSelectedItemsChange={handleSelectedItemsChange}
          selectedItems={selectedItems ?? null}
          slots={{ item: ExplorerTreeItem }}
        />
      )}
    </Panel>
  )
}

export default ExplorerPanel
