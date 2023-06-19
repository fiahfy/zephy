import {
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material'
import { TreeView } from '@mui/lab'
import { SyntheticEvent, useEffect, useMemo, useState } from 'react'

import ExplorerTreeItem from 'components/ExplorerTreeItem'
import { Entry } from 'interfaces'
import { useAppDispatch, useAppSelector } from 'store'
import { move, selectCurrentDirectory, selectIndexPage } from 'store/window'

const ExplorerTreeView = () => {
  const currentDirectory = useAppSelector(selectCurrentDirectory)
  const indexPage = useAppSelector(selectIndexPage)
  const dispatch = useAppDispatch()

  const [expanded, setExpanded] = useState<string[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [entries, setEntries] = useState<Entry[]>([])

  useEffect(() => {
    ;(async () => {
      if (!indexPage) {
        return
      }
      const entry = await window.electronAPI.getEntryHierarchy(currentDirectory)
      const reducer = (carry: string[], entry: Entry): string[] => {
        if (entry.type !== 'directory' || !entry.children) {
          return carry
        }
        return [entry.path, ...entry.children.reduce(reducer, carry)]
      }
      const expanded = [entry].reduce(reducer, [])
      setExpanded(expanded)
      setSelected([currentDirectory])
      setEntries([entry])
    })()
  }, [currentDirectory, indexPage])

  const entryMap = useMemo(() => {
    const reducer = (
      carry: { [path: string]: Entry },
      entry: Entry
    ): { [path: string]: Entry } => {
      return {
        [entry.path]: entry,
        ...(entry.type === 'directory' ? entry.children ?? [] : []).reduce(
          reducer,
          carry
        ),
      }
    }
    return entries.reduce(reducer, {})
  }, [entries])

  const handleSelect = (_event: SyntheticEvent, nodeIds: string[] | string) => {
    if (Array.isArray(nodeIds)) {
      return
    }
    const entry = entryMap[nodeIds]
    if (entry && entry.type === 'directory') {
      dispatch(move(nodeIds))
    }
  }

  const handleToggle = async (_event: SyntheticEvent, nodeIds: string[]) => {
    const expandedNodeId = nodeIds.filter(
      (nodeId) => !expanded.includes(nodeId)
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
    setEntries((prevEntries) => prevEntries.map(mapper))
  }

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
      {entries.map((entry) => (
        <ExplorerTreeItem entry={entry} key={entry.path} />
      ))}
    </TreeView>
  )
}

export default ExplorerTreeView
