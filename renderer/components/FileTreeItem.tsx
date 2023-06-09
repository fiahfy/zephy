import clsx from 'clsx'
import { ReactNode, Ref, forwardRef } from 'react'
import { Box, BoxProps, Typography } from '@mui/material'
import { TreeItem, TreeItemContentProps, TreeItemProps } from '@mui/lab'
import { useTreeItem } from '@mui/lab/TreeItem'

const FileTreeItemContent = forwardRef(function FileContent(
  props: TreeItemContentProps,
  ref
) {
  const {
    classes,
    className,
    label,
    nodeId,
    icon: iconProp,
    expansionIcon,
    displayIcon,
  } = props

  const {
    disabled,
    expanded,
    selected,
    focused,
    handleExpansion,
    handleSelection,
    preventSelection,
  } = useTreeItem(nodeId)

  const icon = iconProp || expansionIcon || displayIcon

  const handleMouseDown = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    preventSelection(event)
  }

  const handleExpansionClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    handleExpansion(event)
  }

  const handleSelectionClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    handleSelection(event)
  }

  return (
    <div
      className={clsx(className, classes.root, {
        [classes.expanded]: expanded,
        [classes.selected]: selected,
        [classes.focused]: focused,
        [classes.disabled]: disabled,
      })}
      onMouseDown={handleMouseDown}
      ref={ref as Ref<HTMLDivElement>}
    >
      <div className={classes.iconContainer} onClick={handleExpansionClick}>
        {icon}
      </div>
      <div className={classes.label} onClick={handleSelectionClick}>
        {label}
      </div>
    </div>
  )
})

type Props = TreeItemProps & {
  LabelProps?: BoxProps
  fileIcon: ReactNode
}

const FileTreeItem = (props: Props) => {
  const { LabelProps, children, fileIcon, label, ...others } = props

  return (
    <TreeItem
      {...others}
      ContentComponent={FileTreeItemContent}
      label={
        <Box
          {...LabelProps}
          sx={{
            alignItems: 'center',
            display: 'flex',
            py: 0.75,
            userSelect: 'none',
          }}
        >
          <Box sx={{ alignItems: 'center', display: 'flex', mr: 1 }}>
            {fileIcon}
          </Box>
          <Typography
            noWrap
            sx={{ fontWeight: 'inherit', flexGrow: 1 }}
            variant="caption"
          >
            {label}
          </Typography>
        </Box>
      }
    >
      {children}
    </TreeItem>
  )
}

export default FileTreeItem
