import { Box, type BoxProps, Typography } from '@mui/material'
import {
  TreeItem,
  type TreeItemContentProps,
  useTreeItemState,
} from '@mui/x-tree-view'
import clsx from 'clsx'
import { type ComponentProps, type ReactNode, forwardRef } from 'react'

const EntryTreeItemContent = forwardRef(function EntryContent(
  props: TreeItemContentProps,
  ref,
) {
  const {
    classes,
    className,
    label,
    icon: iconProp,
    itemId,
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
  } = useTreeItemState(itemId)

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
  icon: ReactNode
  slotProps?: { label?: BoxProps }
}

const EntryTreeItem = (props: Props) => {
  const { slotProps, children, icon, label, sx, ...others } = props

  return (
    <TreeItem
      {...others}
      ContentComponent={EntryTreeItemContent}
      label={
        <Box
          {...slotProps?.label}
          sx={{
            alignItems: 'center',
            display: 'flex',
            gap: 0.5,
          }}
        >
          {icon}
          <Typography
            noWrap
            title={typeof label === 'string' ? label : undefined}
            variant="caption"
          >
            {label}
          </Typography>
        </Box>
      }
      // @see https://github.com/mui/material-ui/issues/29518#issuecomment-1601920296
      onFocusCapture={(e) => e.stopPropagation()}
      sx={{
        '.MuiTreeItem-label': { position: 'static!important' },
        ...sx,
      }}
    >
      {children}
    </TreeItem>
  )
}

export default EntryTreeItem
