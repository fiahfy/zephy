import { BoxProps } from '@mui/material'
import { ReactNode } from 'react'
import FileTreeItem from 'components/FileTreeItem'
import Icon from 'components/Icon'
import { fileContextMenuProps } from 'utils/contextMenu'

type Props = {
  children?: ReactNode
  label: string
  nodeId: string
}

const FavoriteTreeItem = (props: Props) => {
  const { children, label, nodeId } = props

  const root = nodeId === 'root'

  return (
    <FileTreeItem
      LabelProps={
        root ? {} : (fileContextMenuProps(nodeId, true, true) as BoxProps)
      }
      fileIcon={
        root ? (
          <Icon size="small" type="star" />
        ) : (
          <Icon size="small" type="folder" />
        )
      }
      label={label}
      nodeId={nodeId}
      title={root ? undefined : label}
    >
      {children}
    </FileTreeItem>
  )
}

export default FavoriteTreeItem
