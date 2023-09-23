import { TreeItem, TreeItemContentProps, useTreeItem } from '@mui/x-tree-view'
import { Box, BoxProps, Typography } from '@mui/material'
import clsx from 'clsx'
import { ComponentProps, ReactNode, forwardRef } from 'react'

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

  return (
    <Box
      className={clsx(className, classes.root, {
        [classes.expanded]: expanded,
        [classes.selected]: selected,
        [classes.focused]: focused,
        [classes.disabled]: disabled,
      })}
      onMouseDown={preventSelection}
      ref={ref}
      sx={{ height: 20 }}
    >
      <Box className={classes.iconContainer} onClick={handleExpansion}>
        {icon}
      </Box>
      <Box className={classes.label} onClick={handleSelection}>
        {label}
      </Box>
    </Box>
  )
})

type Props = ComponentProps<typeof TreeItem> & {
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
            gap: 0.5,
          }}
        >
          {icon}
          <Typography noWrap variant="caption">
            {label}
          </Typography>
          {outlined && <Outline />}
        </Box>
      }
      // @see https://github.com/mui/material-ui/issues/29518#issuecomment-1601920296
      onFocusCapture={(e) => e.stopPropagation()}
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
