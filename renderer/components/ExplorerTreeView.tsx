import {
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material'
import { TreeView } from '@mui/lab'
import {
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import ExplorerTreeItem from 'components/ExplorerTreeItem'
import { useWatcher } from 'contexts/WatcherContext'
import { Entry } from 'interfaces'
import { useAppSelector } from 'store'
import { selectCurrentDirectory, selectZephySchema } from 'store/window'

const getLoadedDirectories = (entry: Entry) => {
  const reducer = (acc: string[], entry: Entry): string[] => {
    if (entry.type === 'directory' && entry.children) {
      return [entry.path, ...entry.children.reduce(reducer, acc)]
    }
    return acc
  }
  return [entry].reduce(reducer, [])
}

const ExplorerTreeView = () => {
  const currentDirectory = useAppSelector(selectCurrentDirectory)
  const zephySchema = useAppSelector(selectZephySchema)

  const { watch } = useWatcher()

  const [expanded, setExpanded] = useState<string[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [root, setRoot] = useState<Entry>()

  const loaded = useMemo(() => (root ? getLoadedDirectories(root) : []), [root])

  useEffect(() => {
    ;(async () => {
      const entry = await window.electronAPI.getEntryHierarchy(
        zephySchema ? undefined : currentDirectory,
      )
      const expanded = getLoadedDirectories(entry)
      setExpanded(expanded)
      setRoot(entry)
    })()
  }, [currentDirectory, zephySchema])

  useEffect(
    () =>
      watch(loaded, async (eventType, directoryPath, filePath) => {
        const entry =
          eventType === 'create'
            ? await window.electronAPI.getDetailedEntry(filePath)
            : undefined
        const mapper = (e: Entry): Entry => {
          if (e.type === 'directory') {
            if (e.path === directoryPath && e.children) {
              // イベントが複数回発火するため、まず該当 entry を削除し、create の場合のみ追加する
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
        ...(entry.type === 'directory' ? entry.children ?? [] : []).reduce(
          reducer,
          acc,
        ),
      }
    }
    return [root].reduce(reducer, {})
  }, [root])

  const handleSelect = useCallback(
    (_event: SyntheticEvent, nodeIds: string[] | string) =>
      setSelected(Array.isArray(nodeIds) ? nodeIds : [nodeIds]),
    [],
  )

  const handleToggle = useCallback(
    async (_event: SyntheticEvent, nodeIds: string[]) => {
      const expandedNodeId = nodeIds.filter(
        (nodeId) => !expanded.includes(nodeId),
      )[0]
      setExpanded(nodeIds)
      if (!expandedNodeId) {
        return
      }
      const entry = entryMap[expandedNodeId]
      if (!entry || entry.type !== 'directory' || entry.children) {
        return
      }
      const children = await window.electronAPI.getEntries(entry.path)
      const mapper = (e: Entry): Entry => {
        if (e.type === 'directory') {
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
        }
        return e
      }
      setRoot((root) => (root ? mapper(root) : root))
    },
    [entryMap, expanded],
  )

  return (
    <TreeView
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
      expanded={expanded}
      onNodeSelect={handleSelect}
      onNodeToggle={handleToggle}
      selected={selected}
      sx={{
        '&:focus-visible .Mui-focused': {
          outline: '-webkit-focus-ring-color auto 1px',
        },
      }}
    >
      {root && <ExplorerTreeItem entry={root} key={root.path} />}
    </TreeView>
  )
}

export default ExplorerTreeView
