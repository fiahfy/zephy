import { ReactNode } from 'react'
import EntryTreeItem from 'components/EntryTreeItem'
import Icon from 'components/Icon'
import { openEntryContextMenu } from 'utils/contextMenu'

type Props = {
  children?: ReactNode
  label: string
  nodeId: string
}

const FavoriteTreeItem = (props: Props) => {
  const { children, label, nodeId } = props

  const root = nodeId === 'root'

  return (
    <EntryTreeItem
      LabelProps={
        root ? {} : { onContextMenu: openEntryContextMenu(nodeId, true, true) }
      }
      icon={
        root ? (
          <Icon iconType="star" size="small" />
        ) : (
          <Icon iconType="folder" size="small" />
        )
      }
      label={label}
      nodeId={nodeId}
      title={root ? undefined : label}
    >
      {children}
    </EntryTreeItem>
  )
}

export default FavoriteTreeItem
