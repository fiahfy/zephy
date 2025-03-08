import { RichTreeView, type TreeViewBaseItem } from '@mui/x-tree-view'
import {
  type SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import ExplorerTreeItem from '~/components/ExplorerTreeItem'
import Panel from '~/components/Panel'
import useWatcher from '~/hooks/useWatcher'
import type { Entry } from '~/interfaces'
import { useAppSelector } from '~/store'
import { selectShouldShowHiddenFiles } from '~/store/settings'
import { selectCurrentDirectoryPath } from '~/store/window'
import { isHiddenFile } from '~/utils/file'
import { isZephySchema } from '~/utils/url'

const getLoadedDirectories = (entry: Entry) => {
  const reducer = (acc: string[], entry: Entry): string[] => {
    if (entry.type === 'directory' && entry.children) {
      return [entry.path, ...entry.children.reduce(reducer, acc)]
    }
    return acc
  }
  return [entry].reduce(reducer, [])
}

const ExplorerPanel = () => {
  const directoryPath = useAppSelector(selectCurrentDirectoryPath)
  const shouldShowHiddenFiles = useAppSelector(selectShouldShowHiddenFiles)

  const { watch } = useWatcher()

  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [selectedItems, setSelectedItems] = useState<string | null>(null)
  const [root, setRoot] = useState<Entry>()

  const loaded = useMemo(() => (root ? getLoadedDirectories(root) : []), [root])
  const zephySchema = useMemo(
    () => isZephySchema(directoryPath),
    [directoryPath],
  )

  useEffect(() => {
    ;(async () => {
      if (root) {
        return
      }
      const entry = await window.electronAPI.getRootEntry(
        zephySchema ? undefined : directoryPath,
      )
      const expandedItems = getLoadedDirectories(entry)
      setExpandedItems(expandedItems)
      setSelectedItems(directoryPath)
      setRoot(entry)
    })()
  }, [directoryPath, root, zephySchema])

  useEffect(
    () =>
      watch('explorer', loaded, async (eventType, directoryPath, filePath) => {
        const entry =
          eventType === 'delete'
            ? undefined
            : await window.electronAPI.getDetailedEntry(filePath)

        const mapper = (e: Entry): Entry => {
          if (e.type === 'directory') {
            if (e.path === directoryPath && e.children) {
              // イベントが複数回発火するため、まず該当 entry を削除し、create/update の場合のみ追加する
              let children = e.children.filter(
                (entry) => entry.path !== filePath,
              )
              if (entry) {
                children = [...children, entry]
              }
              return {
                ...e,
                children,
              }
            }
            if (e.children) {
              return {
                ...e,
                children: e.children.map(mapper),
              }
            }
          }
          return e
        }

        setRoot((root) => (root ? mapper(root) : root))
      }),
    [loaded, watch],
  )

  const entryMap = useMemo(() => {
    if (!root) {
      return {}
    }
    const reducer = (
      acc: { [path: string]: Entry },
      entry: Entry,
    ): { [path: string]: Entry } => {
      return {
        [entry.path]: entry,
        ...(entry.type === 'directory' ? (entry.children ?? []) : []).reduce(
          reducer,
          acc,
        ),
      }
    }
    return [root].reduce(reducer, {})
  }, [root])

  const handleClickRefresh = useCallback(() => setRoot(undefined), [])

  const handleSelectedItemsChange = useCallback(
    (_e: SyntheticEvent, itemIds: string | null) => setSelectedItems(itemIds),
    [],
  )

  const handleExpandedItemsChange = useCallback(
    async (_e: SyntheticEvent, itemIds: string[]) => {
      setExpandedItems(itemIds)

      const expandingItemId = itemIds.find(
        (itemId) => !expandedItems.includes(itemId),
      )
      if (!expandingItemId) {
        return
      }
      const entry = entryMap[expandingItemId]
      if (!entry || entry.type !== 'directory' || entry.children) {
        return
      }

      const children = await window.electronAPI.getEntries(entry.path)

      const mapper = (e: Entry): Entry => {
        if (e.type !== 'directory') {
          return e
        }
        if (e.path === entry.path) {
          return {
            ...e,
            children,
          }
        }
        if (e.children) {
          return {
            ...e,
            children: e.children.map(mapper),
          }
        }
        return e
      }

      setRoot((root) => {
        const [newRoot] = (root ? [root] : []).map(mapper)
        return newRoot
      })
    },
    [entryMap, expandedItems],
  )

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
                  .sort((a, b) => a.name.localeCompare(b.name))
                  // limit entry size for performance issue
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

  return (
    <Panel onClickRefresh={handleClickRefresh} title="Explorer">
      <RichTreeView
        expandedItems={expandedItems}
        expansionTrigger="iconContainer"
        items={items}
        onExpandedItemsChange={handleExpandedItemsChange}
        onSelectedItemsChange={handleSelectedItemsChange}
        selectedItems={selectedItems}
        slots={{ item: ExplorerTreeItem }}
      />
    </Panel>
  )
}

export default ExplorerPanel
