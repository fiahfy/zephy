import { Collapse, Typography, alpha, styled } from '@mui/material'
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

interface CustomLabelProps {
  children: ReactNode
  entry: Entry
}

function CustomLabel({ children, entry, ...other }: CustomLabelProps) {
  const dispatch = useAppDispatch()

  const { onContextMenu } = useEntryItem(entry)
  const { draggable, ...dragHandlers } = useDragEntry(entry)
  const { droppableStyle, ...dropHandlers } = useDropEntry(entry)

  const handleClick = useCallback(() => {
    if (entry.type === 'directory') {
      dispatch(changeDirectory(entry.path))
    }
  }, [dispatch, entry.path, entry.type])

  const handleDoubleClick = useCallback(async () => {
    if (entry.type !== 'directory') {
      dispatch(openEntry(entry.path))
    }
  }, [dispatch, entry.path, entry.type])

  return (
    <TreeItem2Label
      draggable={draggable}
      onClick={handleClick}
      onContextMenu={onContextMenu}
      onDoubleClick={handleDoubleClick}
      {...dragHandlers}
      {...dropHandlers}
      {...other}
      sx={{
        ...droppableStyle,
        alignItems: 'center',
        display: 'flex',
        gap: 0.5,
      }}
    >
      <EntryIcon entry={entry} />
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

interface ExplorerTreeItemProps
  extends Omit<UseTreeItem2Parameters, 'rootRef'>,
    Omit<HTMLAttributes<HTMLLIElement>, 'onFocus'> {}

const ExplorerTreeItem = forwardRef(function ExplorerTreeItem(
  props: ExplorerTreeItemProps,
  ref: Ref<HTMLLIElement>,
) {
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

  const item = publicAPI.getItem(itemId)
  const entry: Entry | undefined = item.entry

  return (
    <TreeItem2Provider itemId={itemId}>
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
          {entry ? (
            <CustomLabel {...getLabelProps({ entry })} />
          ) : (
            <TreeItem2Label
              {...getLabelProps()}
              sx={{
                alignItems: 'center',
                display: 'flex',
                gap: 0.5,
              }}
            >
              <Icon type="progress" />
              <Typography
                noWrap
                title={typeof children === 'string' ? children : undefined}
                variant="caption"
              >
                {children}
              </Typography>
            </TreeItem2Label>
          )}
          <TreeItem2DragAndDropOverlay {...getDragAndDropOverlayProps()} />
        </StyledTreeItemContent>
        <Collapse {...getGroupTransitionProps()} sx={{ pl: 1.25 }}>
          {children}
        </Collapse>
      </StyledTreeItemRoot>
    </TreeItem2Provider>
  )
})

export default ExplorerTreeItem
