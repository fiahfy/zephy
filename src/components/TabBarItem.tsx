import { Close as CloseIcon } from '@mui/icons-material'
import { IconButton, Stack, Tab, Typography } from '@mui/material'
import { type MouseEvent, useCallback, useMemo } from 'react'
import Icon from '~/components/Icon'
import useDroppable from '~/hooks/useDroppable'
import { useAppDispatch, useAppSelector } from '~/store'
import { selectLoadingByTabId } from '~/store/explorer-list'
import { closeTab, selectHistoryByTabId } from '~/store/window'
import { createContextMenuHandler } from '~/utils/contextMenu'
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

  const handleClick = useCallback(
    (e: MouseEvent) => {
      // prevent tab change event
      e.stopPropagation()
      dispatch(closeTab(tabId))
    },
    [dispatch, tabId],
  )

  return (
    <Tab
      // see https://github.com/mui/material-ui/issues/27947#issuecomment-905318861
      {...others}
      disableRipple
      icon={
        <IconButton
          component="span"
          onClick={handleClick}
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
          <Icon
            type={loading ? 'progress' : getIconType(history.directoryPath)}
          />
          <Typography noWrap title={history.title} variant="caption">
            {history.title}
          </Typography>
        </Stack>
      }
      onContextMenu={handleContextMenu}
      sx={(theme) => ({
        color: theme.palette.text.primary,
        borderRight: `1px solid ${theme.palette.divider}`,
        minHeight: 0,
        pl: 1.0,
        pr: 0.5,
        py: 0.375,
        textTransform: 'none',
        '&.Mui-selected': {
          backgroundColor: theme.palette.background.default,
        },
        '&.Mui-selected, &:hover': {
          '.MuiIconButton-root': {
            opacity: 1,
          },
        },
        '.MuiIconButton-root:focus-visible': {
          opacity: 1,
        },
        ...droppableStyle,
      })}
      {...dropHandlers}
    />
  )
}

export default TabBarItem
