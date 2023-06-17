import { ReactNode } from 'react'
import EntryTreeItem from 'components/EntryTreeItem'
import Icon from 'components/Icon'
import { useContextMenu } from 'hooks/useContextMenu'

type Props = {
  children?: ReactNode
  label: string
  nodeId: string
}

const FavoriteTreeItem = (props: Props) => {
  const { children, label, nodeId } = props

  const { openEntry } = useContextMenu()

  const root = nodeId === 'root'

  return (
    <EntryTreeItem
      LabelProps={root ? {} : { onContextMenu: openEntry(nodeId, true) }}
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
