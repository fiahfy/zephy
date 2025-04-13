import { useSortable } from '@dnd-kit/sortable'
import { Close as CloseIcon } from '@mui/icons-material'
import { Divider, IconButton, Stack, Tab, Typography } from '@mui/material'
import { type MouseEvent, useCallback, useMemo } from 'react'
import Icon from '~/components/Icon'
import useDroppable from '~/hooks/useDroppable'
import { useAppDispatch, useAppSelector } from '~/store'
import { selectLoadingByTabId } from '~/store/explorer-list'
import { changeTab, closeTab, selectHistoryByTabId } from '~/store/window'
import { createContextMenuHandler } from '~/utils/context-menu'
import { getIconType, isZephySchema } from '~/utils/url'

type Props = {
  tabId: number
}

const TabBarItem = (props: Props) => {
  const { tabId, ...others } = props

  const history = useAppSelector((state) => selectHistoryByTabId(state, tabId))
  const loading = useAppSelector((state) => selectLoadingByTabId(state, tabId))
  const dispatch = useAppDispatch()

  const directoryPath = history.directoryPath

  const zephySchema = useMemo(
    () => isZephySchema(directoryPath),
    [directoryPath],
  )

  const { droppableStyle, ...dropHandlers } = useDroppable(
    zephySchema ? undefined : directoryPath,
  )

  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: tabId,
    transition: null,
  })

  const sortableStyle = useMemo(
    () => ({
      transform: transform
        ? `translate(${transform.x}px, ${transform.y}px)`
        : undefined,
      transition,
    }),
    [transform, transition],
  )

  const handleContextMenu = useMemo(
    () =>
      createContextMenuHandler([
        {
          type: 'newTab',
          data: { tabId },
        },
        { type: 'separator' },
        {
          type: 'duplicateTab',
          data: { tabId },
        },
        { type: 'separator' },
        {
          type: 'revealInExplorer',
          data: { path: directoryPath },
        },
        {
          type: 'revealInFinder',
          data: { path: directoryPath },
        },
        { type: 'separator' },
        {
          type: 'closeTab',
          data: { tabId },
        },
        {
          type: 'closeOtherTabs',
          data: { tabId },
        },
      ]),
    [directoryPath, tabId],
  )

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      dispatch(changeTab(tabId))
      listeners?.onMouseDown(e)
    },
    [dispatch, listeners, tabId],
  )

  const handleClick = useCallback(
    () => dispatch(closeTab(tabId)),
    [dispatch, tabId],
  )

  return (
    <Tab
      // @see https://github.com/mui/material-ui/issues/27947#issuecomment-905318861
      {...others}
      {...dropHandlers}
      {...attributes}
      {...listeners}
      disableRipple
      icon={
        <IconButton
          component="span"
          onClick={handleClick}
          // NOTE: prevent tab change event & drag event for sortable
          onMouseDown={(e) => e.stopPropagation()}
          size="small"
          sx={{ opacity: 0 }}
          title="Close"
        >
          <CloseIcon sx={{ fontSize: '1rem' }} />
        </IconButton>
      }
      iconPosition="end"
      label={
        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            alignItems: 'center',
            flexGrow: 1,
            minWidth: 0,
          }}
        >
          <Divider
            sx={{
              borderBottomColor: (theme) => theme.palette.primary.main,
              borderBottomWidth: '2px',
              height: '1px',
              inset: '0 0 auto',
              position: 'absolute',
            }}
          />
          <Icon
            type={loading ? 'progress' : getIconType(history.directoryPath)}
          />
          <Typography noWrap title={history.title} variant="caption">
            {history.title}
          </Typography>
        </Stack>
      }
      onContextMenu={handleContextMenu}
      onMouseDown={handleMouseDown}
      ref={setNodeRef}
      sx={(theme) => ({
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.background.default,
        borderBottom: `thin solid ${theme.palette.divider}`,
        borderLeft: `1px solid ${theme.palette.divider}`,
        borderRight: `thin solid ${theme.palette.divider}`,
        marginLeft: '-1px',
        minHeight: 0,
        pl: 1.0,
        pr: 0.5,
        py: 0.375,
        textTransform: 'none',
        zIndex: isDragging ? 1 : undefined,
        '&.Mui-selected': {
          borderBottom: 'thin solid transparent',
          '.MuiDivider-root': {
            display: 'block',
          },
        },
        '&.Mui-selected, &:hover': {
          '.MuiIconButton-root': {
            opacity: 1,
          },
        },
        '.MuiIconButton-root:focus-visible': {
          opacity: 1,
        },
        '.MuiDivider-root': {
          display: 'none',
        },
        ...droppableStyle,
        ...sortableStyle,
      })}
    />
  )
}

export default TabBarItem
