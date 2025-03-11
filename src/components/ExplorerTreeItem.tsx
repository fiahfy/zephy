import { Collapse, Typography } from '@mui/material'
import { alpha, styled } from '@mui/material/styles'
import {
  TreeItem2Checkbox,
  TreeItem2Content,
  TreeItem2DragAndDropOverlay,
  TreeItem2Icon,
  TreeItem2IconContainer,
  TreeItem2Label,
  TreeItem2Provider,
  TreeItem2Root,
  type UseTreeItem2Parameters,
  useTreeItem2,
} from '@mui/x-tree-view'
import clsx from 'clsx'
import {
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
  type Ref,
  forwardRef,
  useCallback,
} from 'react'
import EntryIcon from '~/components/EntryIcon'
import Icon from '~/components/Icon'
import useDragEntry from '~/hooks/useDragEntry'
import useDropEntry from '~/hooks/useDropEntry'
import useEntryItem from '~/hooks/useEntryItem'
import type { Entry } from '~/interfaces'
import { useAppDispatch } from '~/store'
import { openEntry } from '~/store/settings'
import { changeDirectory } from '~/store/window'

const StyledTreeItemRoot = styled(TreeItem2Root)(() => ({
  position: 'relative',
})) as unknown as typeof TreeItem2Root

const StyledTreeItemContent = styled(TreeItem2Content)(({ theme }) => ({
  flexDirection: 'row-reverse',
  borderRadius: theme.spacing(0.5),
  marginBottom: theme.spacing(0),
  marginTop: theme.spacing(0),
  padding: theme.spacing(0),
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
  '&.Mui-focused': {
    outline: `${theme.palette.primary.main} solid 1px`,
    outlineOffset: '-1px',
    backgroundColor: alpha(
      theme.palette.primary.main,
      theme.palette.action.selectedOpacity,
    ),
    '&:hover': {
      backgroundColor: alpha(
        theme.palette.primary.main,
        theme.palette.action.selectedOpacity +
          theme.palette.action.hoverOpacity,
      ),
    },
  },
}))

type CustomLabelProps = {
  children: ReactNode
  icon: ReactNode
}

const CustomLabel = ({ children, icon, ...other }: CustomLabelProps) => {
  return (
    <TreeItem2Label
      {...other}
      sx={{
        alignItems: 'center',
        display: 'flex',
        gap: 0.5,
      }}
    >
      {icon}
      <Typography
        noWrap
        title={typeof children === 'string' ? children : undefined}
        variant="caption"
      >
        {children}
      </Typography>
    </TreeItem2Label>
  )
}

const ExplorerTreeItemRoot = forwardRef(
  (props: ExplorerTreeItemProps, ref: Ref<HTMLLIElement>) => {
    const { id, itemId, label, disabled, children, ...other } = props

    const {
      getRootProps,
      getContentProps,
      getIconContainerProps,
      getCheckboxProps,
      getLabelProps,
      getGroupTransitionProps,
      getDragAndDropOverlayProps,
      status,
      publicAPI,
    } = useTreeItem2({ id, itemId, children, label, disabled, rootRef: ref })

    const iconContainerProps = getIconContainerProps()

    const item = publicAPI.getItem(itemId)
    const entry: Entry = item.entry

    const dispatch = useAppDispatch()

    const { onContextMenu } = useEntryItem(entry)
    const { draggable, ...dragHandlers } = useDragEntry(entry)
    const { droppableStyle, ...dropHandlers } = useDropEntry(entry)

    const handleClick = useCallback(
      (e: MouseEvent) => {
        e.stopPropagation()
        if (entry.type === 'directory') {
          dispatch(changeDirectory(entry.path))
        }
      },
      [dispatch, entry.path, entry.type],
    )

    const handleDoubleClick = useCallback(
      (e: MouseEvent) => {
        e.stopPropagation()
        if (entry.type !== 'directory') {
          dispatch(openEntry(entry.path))
        }
      },
      [dispatch, entry.path, entry.type],
    )

    const handleClickIconContainer = useCallback(
      (e: MouseEvent) => {
        e.stopPropagation()
        iconContainerProps.onClick(e)
      },
      [iconContainerProps.onClick],
    )

    return (
      <StyledTreeItemRoot
        {...getRootProps(other)}
        draggable={draggable}
        onClick={handleClick}
        onContextMenu={onContextMenu}
        onDoubleClick={handleDoubleClick}
        {...dragHandlers}
        {...dropHandlers}
        sx={droppableStyle}
      >
        <StyledTreeItemContent
          {...getContentProps({
            className: clsx('content', {
              'Mui-expanded': status.expanded,
              'Mui-selected': status.selected,
              'Mui-focused': status.focused,
              'Mui-disabled': status.disabled,
            }),
          })}
        >
          <TreeItem2IconContainer
            {...iconContainerProps}
            onClick={handleClickIconContainer}
          >
            <TreeItem2Icon status={status} />
          </TreeItem2IconContainer>
          <TreeItem2Checkbox {...getCheckboxProps()} />
          <CustomLabel
            {...getLabelProps({ icon: <EntryIcon entry={entry} /> })}
          />
          <TreeItem2DragAndDropOverlay {...getDragAndDropOverlayProps()} />
        </StyledTreeItemContent>
        <Collapse {...getGroupTransitionProps()} sx={{ pl: 1.25 }}>
          {children}
        </Collapse>
      </StyledTreeItemRoot>
    )
  },
)

const LoadingTreeItemRoot = forwardRef(
  (props: ExplorerTreeItemProps, ref: Ref<HTMLLIElement>) => {
    const { id, itemId, label, disabled, children, ...other } = props

    const {
      getRootProps,
      getContentProps,
      getIconContainerProps,
      getCheckboxProps,
      getLabelProps,
      getGroupTransitionProps,
      getDragAndDropOverlayProps,
      status,
    } = useTreeItem2({ id, itemId, children, label, disabled, rootRef: ref })

    return (
      <StyledTreeItemRoot {...getRootProps(other)}>
        <StyledTreeItemContent
          {...getContentProps({
            className: clsx('content', {
              'Mui-expanded': status.expanded,
              'Mui-selected': status.selected,
              'Mui-focused': status.focused,
              'Mui-disabled': status.disabled,
            }),
          })}
        >
          <TreeItem2IconContainer {...getIconContainerProps()}>
            <TreeItem2Icon status={status} />
          </TreeItem2IconContainer>
          <TreeItem2Checkbox {...getCheckboxProps()} />
          <CustomLabel {...getLabelProps({ icon: <Icon type="progress" /> })} />
          <TreeItem2DragAndDropOverlay {...getDragAndDropOverlayProps()} />
        </StyledTreeItemContent>
        <Collapse {...getGroupTransitionProps()} sx={{ pl: 1.25 }}>
          {children}
        </Collapse>
      </StyledTreeItemRoot>
    )
  },
)

interface ExplorerTreeItemProps
  extends Omit<UseTreeItem2Parameters, 'rootRef'>,
    Omit<HTMLAttributes<HTMLLIElement>, 'onFocus'> {}

const ExplorerTreeItem = forwardRef(
  (props: ExplorerTreeItemProps, ref: Ref<HTMLLIElement>) => {
    const { itemId } = props

    const isLoadingItem = itemId.startsWith('__loading__')

    return (
      <TreeItem2Provider itemId={itemId}>
        {isLoadingItem ? (
          <LoadingTreeItemRoot {...props} ref={ref} />
        ) : (
          <ExplorerTreeItemRoot {...props} ref={ref} />
        )}
      </TreeItem2Provider>
    )
  },
)

export default ExplorerTreeItem
