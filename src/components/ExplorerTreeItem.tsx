import { useCallback } from 'react'
import EntryIcon from '~/components/EntryIcon'
import EntryTreeItem from '~/components/EntryTreeItem'
import useDragEntry from '~/hooks/useDragEntry'
import useDropEntry from '~/hooks/useDropEntry'
import useEntryItem from '~/hooks/useEntryItem'
import type { Entry } from '~/interfaces'
import { useAppDispatch, useAppSelector } from '~/store'
import { openEntry, selectShouldShowHiddenFiles } from '~/store/settings'
import { changeDirectory } from '~/store/window'
import { isHiddenFile } from '~/utils/file'
import Icon from './Icon'

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
      draggable={draggable}
      icon={<EntryIcon entry={entry} />}
      itemId={entry.path}
      label={entry.name}
      slotProps={{
        label: {
          onClick: handleClick,
          onContextMenu: onContextMenu,
          onDoubleClick: handleDoubleClick,
        },
      }}
      sx={droppableStyle}
      {...dragHandlers}
      {...dropHandlers}
    >
      {entry.type === 'directory' &&
        (entry.children ? (
          entry.children
            .filter(
              (entry) => shouldShowHiddenFiles || !isHiddenFile(entry.name),
            )
            .sort((a, b) => a.name.localeCompare(b.name))
            // limit entry size for performance issue
            .slice(0, 100)
            .map((entry) => <ExplorerTreeItem entry={entry} key={entry.path} />)
        ) : (
          <EntryTreeItem
            icon={<Icon type="progress" />}
            itemId={`${entry.path}<loader>`}
            label="Loading items..."
          />
        ))}
    </EntryTreeItem>
  )
}

export default ExplorerTreeItem
