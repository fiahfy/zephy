import { CircularProgress } from '@mui/material'
import { useCallback } from 'react'
import EntryIcon from '~/components/EntryIcon'
import EntryTreeItem from '~/components/EntryTreeItem'
import useDragEntry from '~/hooks/useDragEntry'
import useDropEntry from '~/hooks/useDropEntry'
import useEntryItem from '~/hooks/useEntryItem'
import { Entry } from '~/interfaces'
import { useAppDispatch, useAppSelector } from '~/store'
import { openEntry, selectShouldShowHiddenFiles } from '~/store/settings'
import { changeDirectory } from '~/store/window'
import { isHiddenFile } from '~/utils/file'

type Props = {
  entry: Entry
}

const ExplorerTreeItem = (props: Props) => {
  const { entry } = props

  const shouldShowHiddenFiles = useAppSelector(selectShouldShowHiddenFiles)
  const dispatch = useAppDispatch()

  const { onContextMenu } = useEntryItem(entry)
  const { draggable, ...dragHandlers } = useDragEntry(entry)
  const { droppableStyle, ...dropHandlers } = useDropEntry(entry)

  const handleClick = useCallback(() => {
    if (entry.type === 'directory') {
      dispatch(changeDirectory(entry.path))
    }
  }, [dispatch, entry.path, entry.type])

  const handleDoubleClick = useCallback(async () => {
    if (entry.type !== 'directory') {
      dispatch(openEntry(entry.path))
    }
  }, [dispatch, entry.path, entry.type])

  return (
    <EntryTreeItem
      LabelProps={{
        onClick: handleClick,
        onContextMenu: onContextMenu,
        onDoubleClick: handleDoubleClick,
      }}
      draggable={draggable}
      icon={<EntryIcon entry={entry} />}
      label={entry.name}
      nodeId={entry.path}
      sx={droppableStyle}
      {...dragHandlers}
      {...dropHandlers}
    >
      {entry.type === 'directory' && (
        <>
          {entry.children ? (
            entry.children
              .filter(
                (entry) => shouldShowHiddenFiles || !isHiddenFile(entry.name),
              )
              .sort((a, b) => a.name.localeCompare(b.name))
              // limit entry size for performance issue
              .slice(0, 100)
              .map((entry) => (
                <ExplorerTreeItem entry={entry} key={entry.path} />
              ))
          ) : (
            <EntryTreeItem
              icon={
                <CircularProgress size={16} sx={{ flexShrink: 0, p: 0.25 }} />
              }
              label="Loading items..."
              nodeId={`${entry.path}<loader>`}
            />
          )}
        </>
      )}
    </EntryTreeItem>
  )
}

export default ExplorerTreeItem
