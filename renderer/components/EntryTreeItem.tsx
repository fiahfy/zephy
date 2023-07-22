import { Box, BoxProps, Typography } from '@mui/material'
import { TreeItem, TreeItemContentProps, TreeItemProps } from '@mui/lab'
import { useTreeItem } from '@mui/lab/TreeItem'
import clsx from 'clsx'
import { MouseEvent, ReactNode, forwardRef } from 'react'

import Outline from 'components/Outline'

const EntryTreeItemContent = forwardRef(function EntryContent(
  props: TreeItemContentProps,
  ref,
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

  const handleMouseDown = (event: MouseEvent) => preventSelection(event)

  const handleExpansionClick = (event: MouseEvent) => handleExpansion(event)

  const handleSelectionClick = (event: MouseEvent) => handleSelection(event)

  return (
    <Box
      className={clsx(className, classes.root, {
        [classes.expanded]: expanded,
        [classes.selected]: selected,
        [classes.focused]: focused,
        [classes.disabled]: disabled,
      })}
      onMouseDown={handleMouseDown}
      ref={ref}
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
  outlined?: boolean
}

const EntryTreeItem = (props: Props) => {
  const { LabelProps, children, icon, label, outlined, ...others } = props

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
          {outlined && <Outline />}
        </Box>
      }
      sx={{
        position: 'relative',
        '.MuiTreeItem-label': { position: 'static!important' },
      }}
    >
      {children}
    </TreeItem>
  )
}

export default EntryTreeItem
