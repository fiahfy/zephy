import { Box, BoxProps, Typography } from '@mui/material'
import { TreeItem, TreeItemContentProps, TreeItemProps } from '@mui/lab'
import { useTreeItem } from '@mui/lab/TreeItem'
import clsx from 'clsx'
import { ReactNode, Ref, forwardRef } from 'react'

const EntryTreeItemContent = forwardRef(function EntryContent(
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
    <Box
      className={clsx(className, classes.root, {
        [classes.expanded]: expanded,
        [classes.selected]: selected,
        [classes.focused]: focused,
        [classes.disabled]: disabled,
      })}
      onMouseDown={handleMouseDown}
      ref={ref as Ref<HTMLDivElement>}
      sx={{ height: 20 }}
    >
      <Box className={classes.iconContainer} onClick={handleExpansionClick}>
        {icon}
      </Box>
      <Box className={classes.label} onClick={handleSelectionClick}>
        {label}
      </Box>
    </Box>
  )
})

type Props = TreeItemProps & {
  LabelProps?: BoxProps
  icon: ReactNode
}

const EntryTreeItem = (props: Props) => {
  const { LabelProps, children, icon, label, ...others } = props

  return (
    <TreeItem
      {...others}
      ContentComponent={EntryTreeItemContent}
      label={
        <Box
          {...LabelProps}
          sx={{
            alignItems: 'center',
            display: 'flex',
            gap: 1,
            userSelect: 'none',
          }}
        >
          {icon}
          <Typography noWrap variant="caption">
            {label}
          </Typography>
        </Box>
      }
    >
      {children}
    </TreeItem>
  )
}

export default EntryTreeItem
