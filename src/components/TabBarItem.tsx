import { Close as CloseIcon } from '@mui/icons-material'
import { Box, IconButton, Tab, Typography } from '@mui/material'
import { MouseEvent, useCallback, useMemo } from 'react'
import Icon from '~/components/Icon'
import useDropEntry from '~/hooks/useDropEntry'
import { useAppDispatch, useAppSelector } from '~/store'
import { closeTab, selectHistoryByTabId } from '~/store/window'
import { createContextMenuHandler } from '~/utils/contextMenu'
import { getIconType } from '~/utils/url'

type Props = {
  tabId: number
}

const TabBarItem = (props: Props) => {
  const { tabId, ...others } = props

  const history = useAppSelector((state) => selectHistoryByTabId(state, tabId))
  const dispatch = useAppDispatch()

  const { droppableStyle, ...dropHandlers } = useDropEntry({
    name: '',
    path: history.directoryPath,
    type: 'directory',
    url: '',
  })

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
          type: 'closeTab',
          data: { tabId },
        },
        {
          type: 'closeOtherTabs',
          data: { tabId },
        },
      ]),
    [tabId],
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
      // @see https://github.com/mui/material-ui/issues/27947#issuecomment-905318861
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
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            flexGrow: 1,
            gap: 0.5,
            minWidth: 0,
          }}
        >
          <Icon iconType={getIconType(history.directoryPath)} />
          <Typography noWrap title={history.title} variant="caption">
            {history.title}
          </Typography>
        </Box>
      }
      onContextMenu={handleContextMenu}
      sx={{
        color: (theme) => theme.palette.text.primary,
        borderRight: (theme) => `1px solid ${theme.palette.divider}`,
        minHeight: 0,
        pl: 1.0,
        pr: 0.5,
        py: 0.375,
        textTransform: 'none',
        '&.Mui-selected': {
          backgroundColor: (theme) => theme.palette.background.default,
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
      }}
      {...dropHandlers}
    />
  )
}

export default TabBarItem
