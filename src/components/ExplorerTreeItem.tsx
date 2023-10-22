import { CircularProgress } from '@mui/material'
import { useCallback, useMemo } from 'react'
import EntryIcon from '~/components/EntryIcon'
import EntryTreeItem from '~/components/EntryTreeItem'
import Icon from '~/components/Icon'
import useDnd from '~/hooks/useDnd'
import useEntryItem from '~/hooks/useEntryItem'
import { Entry } from '~/interfaces'
import { useAppDispatch, useAppSelector } from '~/store'
import { selectShouldShowHiddenFiles } from '~/store/settings'
import { changeDirectory } from '~/store/window'
import { isHiddenFile } from '~/utils/file'

const max = 100

type Props = {
  entry: Entry
}

const ExplorerTreeItem = (props: Props) => {
  const { entry } = props

  const shouldShowHiddenFiles = useAppSelector(selectShouldShowHiddenFiles)
  const dispatch = useAppDispatch()

  const { onContextMenu } = useEntryItem(entry)
  const { createDraggableBinder, createDroppableBinder, droppableStyle } =
    useDnd()

  const over = useMemo(
    () =>
      (entry.type === 'directory' && entry.children ? entry.children : [])
        .length - max,
    [entry],
  )

  const handleClick = useCallback(() => {
    if (entry.type === 'directory') {
      dispatch(changeDirectory(entry.path))
    }
  }, [dispatch, entry.path, entry.type])

  const handleDoubleClick = useCallback(async () => {
    if (entry.type === 'file') {
      await window.electronAPI.openEntry(entry.path)
    }
  }, [entry.path, entry.type])

  return (
    <EntryTreeItem
      LabelProps={{
        onClick: handleClick,
        onContextMenu: onContextMenu,
        onDoubleClick: handleDoubleClick,
      }}
      icon={<EntryIcon entry={entry} />}
      label={entry.name}
      nodeId={entry.path}
      sx={droppableStyle}
      {...createDraggableBinder(entry)}
      {...createDroppableBinder(entry)}
    >
      {entry.type === 'directory' && (
        <>
          {entry.children ? (
            <>
              {entry.children
                .filter(
                  (entry) => shouldShowHiddenFiles || !isHiddenFile(entry.name),
                )
                .sort((a, b) => a.name.localeCompare(b.name))
                .slice(0, max)
                .map((entry) => (
                  <ExplorerTreeItem entry={entry} key={entry.path} />
                ))}
              {over > 0 && (
                <EntryTreeItem
                  icon={<Icon iconType="insert-drive-file" />}
                  label={`Other ${over} items`}
                  nodeId={`${entry.path}<others>`}
                />
              )}
            </>
          ) : (
            <EntryTreeItem
              icon={<CircularProgress size={16} sx={{ mx: 0.25 }} />}
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
