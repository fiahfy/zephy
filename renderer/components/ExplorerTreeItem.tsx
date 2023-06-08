import { CircularProgress } from '@mui/material'

import EntryIcon from 'components/EntryIcon'
import EntryTreeItem from 'components/EntryTreeItem'
import Icon from 'components/Icon'
import useContextMenu from 'hooks/useContextMenu'
import useFileDnd from 'hooks/useFileDnd'
import { Entry } from 'interfaces'
import { useAppSelector } from 'store'
import { selectShouldShowHiddenFiles } from 'store/settings'
import { isHiddenFile } from 'utils/file'

const max = 100

type Props = {
  entry: Entry
}

const ExplorerTreeItem = (props: Props) => {
  const { entry } = props

  const shouldShowHiddenFiles = useAppSelector(selectShouldShowHiddenFiles)

  const { createEntryMenuHandler } = useContextMenu()
  const { createDroppableAttrs, dropping } = useFileDnd()

  const over =
    (entry.type === 'directory' && entry.children ? entry.children : [])
      .length - max

  const handleDoubleClick = async () => {
    if (entry.type === 'file') {
      await window.electronAPI.openPath(entry.path)
    }
  }

  return (
    <EntryTreeItem
      LabelProps={{
        onContextMenu: createEntryMenuHandler(entry),
        onDoubleClick: handleDoubleClick,
      }}
      icon={<EntryIcon entry={entry} />}
      label={entry.name}
      nodeId={entry.path}
      outlined={dropping}
      title={entry.name}
      {...createDroppableAttrs(entry)}
    >
      {entry.type === 'directory' && (
        <>
          {entry.children ? (
            <>
              {entry.children
                .filter(
                  (entry) => shouldShowHiddenFiles || !isHiddenFile(entry.name)
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
