import { BoxProps, CircularProgress } from '@mui/material'
import EntryIcon from 'components/EntryIcon'
import EntryTreeItem from 'components/EntryTreeItem'
import Icon from 'components/Icon'
import { Entry } from 'interfaces'
import { useAppSelector } from 'store'
import { selectIsFavorite } from 'store/favorite'
import { selectShouldShowHiddenFiles } from 'store/settings'
import { entryContextMenuProps } from 'utils/contextMenu'
import { isHiddenFile } from 'utils/entry'

const max = 100

type Props = {
  entry: Entry
}

const ExplorerTreeItem = (props: Props) => {
  const { entry } = props

  const favorite = useAppSelector(selectIsFavorite)(entry.path)
  const shouldShowHiddenFiles = useAppSelector(selectShouldShowHiddenFiles)

  const over =
    (entry.type === 'directory' ? entry.children ?? [] : []).length - max

  return (
    <EntryTreeItem
      LabelProps={
        entryContextMenuProps(
          entry.path,
          entry.type === 'directory',
          favorite
        ) as BoxProps
      }
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
            icon={<CircularProgress size={20} />}
            label="Loading items..."
            nodeId={`${entry.path}<loader>`}
          />
        ))}
    </EntryTreeItem>
  )
}

export default ExplorerTreeItem
