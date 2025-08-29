// @see https://mui.com/x/react-tree-view/rich-tree-view/customization/#file-explorer
import { Collapse, Typography } from '@mui/material'
import { alpha, styled } from '@mui/material/styles'
import {
  TreeItemCheckbox,
  TreeItemContent,
  TreeItemDragAndDropOverlay,
  TreeItemIcon,
  TreeItemIconContainer,
  TreeItemLabel,
  TreeItemProvider,
  TreeItemRoot,
  type UseTreeItemParameters,
  useTreeItem,
  useTreeItemModel,
} from '@mui/x-tree-view'
import clsx from 'clsx'
import {
  forwardRef,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
  type Ref,
  useCallback,
  useMemo,
} from 'react'
import EntryIcon from '~/components/EntryIcon'
import Icon from '~/components/Icon'
import useDraggable from '~/hooks/useDraggable'
import useDroppable from '~/hooks/useDroppable'
import type { Entry } from '~/interfaces'
import { useAppDispatch, useAppSelector } from '~/store'
import { selectFavorite, selectFavoriteByPath } from '~/store/favorite'
import { changeUrl, newTab, openUrl, selectCurrentTabId } from '~/store/window'
import { createContextMenuHandler } from '~/utils/context-menu'

const StyledTreeItemRoot = styled(TreeItemRoot)(() => ({
  position: 'relative',
})) as unknown as typeof TreeItemRoot

const StyledTreeItemContent = styled(TreeItemContent)(({ theme }) => ({
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
    <TreeItemLabel
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
    </TreeItemLabel>
  )
}

const ExplorerTreeItemRoot = forwardRef(
  (props: ExplorerTreeItemProps, ref: Ref<HTMLLIElement>) => {
    const { id, itemId, label, disabled, children, ...other } = props

    const {
      getRootProps,
      getContentProps,
      getContextProviderProps,
      getIconContainerProps,
      getCheckboxProps,
      getLabelProps,
      getGroupTransitionProps,
      getDragAndDropOverlayProps,
      status,
    } = useTreeItem({ id, itemId, children, label, disabled, rootRef: ref })

    const iconContainerProps = getIconContainerProps()

    // biome-ignore lint/style/noNonNullAssertion: false positive
    const item = useTreeItemModel<{ entry: Entry; id: string; label: string }>(
      props.itemId,
    )!

    const entry = item.entry

    const favorite = useAppSelector((state) =>
      selectFavoriteByPath(selectFavorite(state), entry.path),
    )
    const tabId = useAppSelector(selectCurrentTabId)
    const dispatch = useAppDispatch()

    const { draggable, ...dragHandlers } = useDraggable(entry.path)
    const { droppableStyle, ...dropHandlers } = useDroppable(
      entry.type === 'directory' ? entry.path : undefined,
    )

    const handleClick = useCallback(
      (e: MouseEvent) => {
        e.stopPropagation()
        if (entry.type === 'directory') {
          if ((e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)) {
            dispatch(newTab(entry.url))
          } else {
            dispatch(changeUrl(entry.url))
          }
        }
      },
      [dispatch, entry.type, entry.url],
    )

    const handleDoubleClick = useCallback(
      (e: MouseEvent) => {
        e.stopPropagation()
        if (entry.type !== 'directory') {
          dispatch(openUrl(entry.url))
        }
      },
      [dispatch, entry.url, entry.type],
    )

    const handleClickIconContainer = useCallback(
      (e: MouseEvent) => {
        e.stopPropagation()
        iconContainerProps.onClick(e)
      },
      [iconContainerProps.onClick],
    )
    const handleContextMenu = useMemo(() => {
      const directory = entry.type === 'directory'
      const path = entry.path
      const url = entry.url
      return createContextMenuHandler([
        {
          type: 'open',
          data: { url },
        },
        ...(directory
          ? [
              {
                type: 'openInNewWindow',
                data: { url },
              },
              {
                type: 'openInNewTab',
                data: { url, tabId },
              },
            ]
          : []),
        { type: 'separator' },
        {
          type: 'revealInFinder',
          data: { path },
        },
        { type: 'separator' },
        {
          type: 'copyPath',
          data: { path },
        },
        { type: 'separator' },
        ...(directory
          ? [
              {
                type: 'toggleFavorite',
                data: { path, favorite },
              },
            ]
          : []),
        { type: 'separator' },
        {
          type: 'moveToTrash',
          data: { paths: [path] },
        },
      ])
    }, [entry.path, entry.type, entry.url, favorite, tabId])

    return (
      <TreeItemProvider {...getContextProviderProps()}>
        <StyledTreeItemRoot
          {...getRootProps(other)}
          draggable={draggable}
          onClick={handleClick}
          onContextMenu={handleContextMenu}
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
            <TreeItemIconContainer
              {...iconContainerProps}
              onClick={handleClickIconContainer}
            >
              <TreeItemIcon status={status} />
            </TreeItemIconContainer>
            <TreeItemCheckbox {...getCheckboxProps()} />
            <CustomLabel
              {...getLabelProps({ icon: <EntryIcon entry={entry} /> })}
            />
            <TreeItemDragAndDropOverlay {...getDragAndDropOverlayProps()} />
          </StyledTreeItemContent>
          <Collapse {...getGroupTransitionProps()} sx={{ pl: 1.25 }}>
            {children}
          </Collapse>
        </StyledTreeItemRoot>
      </TreeItemProvider>
    )
  },
)

const LoadingTreeItemRoot = forwardRef(
  (props: ExplorerTreeItemProps, ref: Ref<HTMLLIElement>) => {
    const { id, itemId, label, disabled, children, ...other } = props

    const {
      getRootProps,
      getContentProps,
      getContextProviderProps,
      getIconContainerProps,
      getCheckboxProps,
      getLabelProps,
      getGroupTransitionProps,
      getDragAndDropOverlayProps,
      status,
    } = useTreeItem({ id, itemId, children, label, disabled, rootRef: ref })

    return (
      <TreeItemProvider {...getContextProviderProps()}>
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
            <TreeItemIconContainer {...getIconContainerProps()}>
              <TreeItemIcon status={status} />
            </TreeItemIconContainer>
            <TreeItemCheckbox {...getCheckboxProps()} />
            <CustomLabel
              {...getLabelProps({ icon: <Icon type="progress" /> })}
            />
            <TreeItemDragAndDropOverlay {...getDragAndDropOverlayProps()} />
          </StyledTreeItemContent>
          <Collapse {...getGroupTransitionProps()} sx={{ pl: 1.25 }}>
            {children}
          </Collapse>
        </StyledTreeItemRoot>
      </TreeItemProvider>
    )
  },
)

interface ExplorerTreeItemProps
  extends Omit<UseTreeItemParameters, 'rootRef'>,
    Omit<HTMLAttributes<HTMLLIElement>, 'onFocus'> {}

const ExplorerTreeItem = forwardRef(
  (props: ExplorerTreeItemProps, ref: Ref<HTMLLIElement>) => {
    const { itemId } = props

    const isLoadingItem = itemId.startsWith('__loading__')

    return (
      <>
        {isLoadingItem ? (
          <LoadingTreeItemRoot {...props} ref={ref} />
        ) : (
          <ExplorerTreeItemRoot {...props} ref={ref} />
        )}
      </>
    )
  },
)

export default ExplorerTreeItem
