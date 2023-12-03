import {
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material'
import { TreeView } from '@mui/x-tree-view'
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
  const currentDirectoryPath = useAppSelector(selectCurrentDirectoryPath)

  const { watch } = useWatcher()

  const [expanded, setExpanded] = useState<string[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [root, setRoot] = useState<Entry>()

  const loaded = useMemo(() => (root ? getLoadedDirectories(root) : []), [root])
  const zephySchema = useMemo(
    () => isZephySchema(currentDirectoryPath),
    [currentDirectoryPath],
  )

  useEffect(() => {
    ;(async () => {
      if (root) {
        return
      }
      const entry = await window.electronAPI.getEntryHierarchy(
        zephySchema ? undefined : currentDirectoryPath,
      )
      const expanded = getLoadedDirectories(entry)
      setExpanded(expanded)
      setRoot(entry)
    })()
  }, [currentDirectoryPath, root, zephySchema])

  useEffect(
    () =>
      watch(loaded, async (eventType, directoryPath, filePath) => {
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
        ...(entry.type === 'directory' ? entry.children ?? [] : []).reduce(
          reducer,
          acc,
        ),
      }
    }
    return [root].reduce(reducer, {})
  }, [root])

  const handleClickRefresh = useCallback(() => setRoot(undefined), [])

  const handleSelect = useCallback(
    (_e: SyntheticEvent, nodeIds: string[] | string) =>
      setSelected(Array.isArray(nodeIds) ? nodeIds : [nodeIds]),
    [],
  )

  const handleToggle = useCallback(
    async (_e: SyntheticEvent, nodeIds: string[]) => {
      setExpanded(nodeIds)

      const expandedNodeId = nodeIds.find(
        (nodeId) => !expanded.includes(nodeId),
      )
      if (!expandedNodeId) {
        return
      }
      const entry = entryMap[expandedNodeId]
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
    [entryMap, expanded],
  )

  return (
    <Panel onClickRefresh={handleClickRefresh} title="Explorer">
      <TreeView
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        expanded={expanded}
        multiSelect
        onNodeSelect={handleSelect}
        onNodeToggle={handleToggle}
        selected={selected}
        sx={{
          '&:focus-visible .Mui-focused': {
            outline: '-webkit-focus-ring-color auto 1px',
          },
        }}
      >
        {root && <ExplorerTreeItem entry={root} />}
      </TreeView>
    </Panel>
  )
}

export default ExplorerPanel
