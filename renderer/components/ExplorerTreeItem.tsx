import { CircularProgress } from '@mui/material'

import EntryIcon from 'components/EntryIcon'
import EntryTreeItem from 'components/EntryTreeItem'
import Icon from 'components/Icon'
import useContextMenu from 'hooks/useContextMenu'
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

  const over =
    (entry.type === 'directory' ? entry.children ?? [] : []).length - max

  return (
    <EntryTreeItem
      LabelProps={{
        onContextMenu: createEntryMenuHandler(
          entry.path,
          entry.type === 'directory'
        ),
      }}
      icon={<EntryIcon entry={entry} size="small" />}
      label={entry.name}
      nodeId={entry.path}
      title={entry.name}
    >
      {entry.type === 'directory' &&
        (entry.children ? (
          <>
            {entry.children
              .filter(
                (entry) => shouldShowHiddenFiles || !isHiddenFile(entry.name)
              )
              .slice(0, max)
              .map((entry) => (
                <ExplorerTreeItem entry={entry} key={entry.path} />
              ))}
            {over > 0 && (
              <EntryTreeItem
                icon={<Icon iconType="insert-drive-file" size="small" />}
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
        ))}
    </EntryTreeItem>
  )
}

export default ExplorerTreeItem
