import {
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material'
import { SimpleTreeView } from '@mui/x-tree-view'
import {
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import ExplorerTreeItem from '~/components/ExplorerTreeItem'
import Panel from '~/components/Panel'
import useWatcher from '~/hooks/useWatcher'
import { Entry } from '~/interfaces'
import { useAppSelector } from '~/store'
import { selectCurrentDirectoryPath } from '~/store/window'
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

  const { watch } = useWatcher()

  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
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
    (_e: SyntheticEvent, itemIds: string[] | string) =>
      setSelectedItems(Array.isArray(itemIds) ? itemIds : [itemIds]),
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

  return (
    <Panel onClickRefresh={handleClickRefresh} title="Explorer">
      <SimpleTreeView
        expandedItems={expandedItems}
        multiSelect
        onExpandedItemsChange={handleExpandedItemsChange}
        onSelectedItemsChange={handleSelectedItemsChange}
        selectedItems={selectedItems}
        slots={{ collapseIcon: ExpandMoreIcon, expandIcon: ChevronRightIcon }}
      >
        {root && <ExplorerTreeItem entry={root} />}
      </SimpleTreeView>
    </Panel>
  )
}

export default ExplorerPanel
