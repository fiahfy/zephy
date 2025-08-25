import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowUpward as ArrowUpwardIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { AppBar, Box, Divider, IconButton, Stack, Toolbar } from '@mui/material'
import { useCallback, useEffect, useMemo, useState } from 'react'
import AddressTextField from '~/components/AddressTextField'
import SearchAutocomplete from '~/components/SearchAutocomplete'
import ViewModeToggleButtonGroup from '~/components/ViewModeToggleButtonGroup'
import useLongPress from '~/hooks/useLongPress'
import useTrafficLight from '~/hooks/useTrafficLight'
import { useAppDispatch, useAppSelector } from '~/store'
import {
  refreshInCurrentTab,
  selectCurrentLoading,
} from '~/store/explorer-list'
import {
  back,
  forward,
  selectCurrentBackHistories,
  selectCurrentCanBack,
  selectCurrentCanForward,
  selectCurrentDirectoryPath,
  selectCurrentForwardHistories,
  selectCurrentSortOption,
  selectCurrentUrl,
  selectCurrentViewMode,
  selectSidebarHiddenByVariant,
  upward,
} from '~/store/window'
import { createContextMenuHandler } from '~/utils/context-menu'
import { isFileUrl } from '~/utils/url'

const AddressBar = () => {
  const backHistories = useAppSelector(selectCurrentBackHistories)
  const canBack = useAppSelector(selectCurrentCanBack)
  const canForward = useAppSelector(selectCurrentCanForward)
  const directoryPath = useAppSelector(selectCurrentDirectoryPath)
  const forwardHistories = useAppSelector(selectCurrentForwardHistories)
  const loading = useAppSelector(selectCurrentLoading)
  const sortOption = useAppSelector(selectCurrentSortOption)
  const url = useAppSelector(selectCurrentUrl)
  const viewMode = useAppSelector(selectCurrentViewMode)
  const primarySidebarHidden = useAppSelector((state) =>
    selectSidebarHiddenByVariant(state, 'primary'),
  )
  const secondarySidebarHidden = useAppSelector((state) =>
    selectSidebarHiddenByVariant(state, 'secondary'),
  )
  const dispatch = useAppDispatch()

  const { visible } = useTrafficLight()

  const backHistoryMenuHandler = useMemo(
    () =>
      createContextMenuHandler(
        backHistories.slice(0, 12).map((history, i) => ({
          type: 'go',
          data: {
            label: history.title,
            offset: -(i + 1),
          },
        })),
      ),
    [backHistories],
  )
  const forwardHistoryMenuHandler = useMemo(
    () =>
      createContextMenuHandler(
        forwardHistories.slice(0, 12).map((history, i) => ({
          type: 'go',
          data: {
            label: history.title,
            offset: i + 1,
          },
        })),
      ),
    [forwardHistories],
  )

  const backLongPressHandlers = useLongPress(backHistoryMenuHandler)
  const forwardLongPressHandlers = useLongPress(forwardHistoryMenuHandler)

  const [urlInput, setUrlInput] = useState('')

  const fileUrl = useMemo(() => isFileUrl(url), [url])

  const handleClickMore = useMemo(
    () =>
      createContextMenuHandler([
        {
          type: 'newFolder',
          data: { path: directoryPath },
        },
        { type: 'separator' },
        { type: 'view', data: { viewMode: viewMode } },
        { type: 'separator' },
        {
          type: 'sortBy',
          data: { orderBy: sortOption.orderBy },
        },
        { type: 'separator' },
        {
          type: 'toggleNavigator',
          data: { hidden: primarySidebarHidden },
        },
        {
          type: 'toggleInspector',
          data: { hidden: secondarySidebarHidden },
        },
        { type: 'separator' },
        { type: 'settings' },
      ]),
    [
      directoryPath,
      primarySidebarHidden,
      secondarySidebarHidden,
      sortOption.orderBy,
      viewMode,
    ],
  )

  const handleClickBack = useCallback(() => dispatch(back()), [dispatch])

  const handleClickForward = useCallback(() => dispatch(forward()), [dispatch])

  const handleClickUpward = useCallback(
    async () => dispatch(upward()),
    [dispatch],
  )

  const handleClickRefresh = useCallback(async () => {
    setUrlInput(url)
    dispatch(refreshInCurrentTab())
  }, [dispatch, url])

  const handleChangeUrl = useCallback((value: string) => {
    setUrlInput(value)
  }, [])

  useEffect(() => setUrlInput(url), [url])

  return (
    <AppBar
      color="default"
      component="div"
      elevation={0}
      enableColorOnDark
      sx={(theme) => ({
        WebkitAppRegion: 'drag',
        zIndex: theme.zIndex.drawer + 1,
      })}
    >
      <Toolbar
        disableGutters
        sx={(theme) => ({
          minHeight: `${theme.mixins.addressBar.height}!important`,
          gap: 1,
          pl: visible ? 10 : 1,
          pr: 1,
        })}
      >
        <Box
          sx={{
            display: { sm: 'none', md: 'block' },
            flex: '1 1 0',
          }}
        />
        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            WebkitAppRegion: 'no-drag',
            alignItems: 'center',
            flex: '6 1 0',
          }}
        >
          <IconButton
            disabled={loading || !canBack}
            onClick={handleClickBack}
            onContextMenu={backHistoryMenuHandler}
            size="small"
            title="Go back"
            {...backLongPressHandlers}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <IconButton
            disabled={loading || !canForward}
            onClick={handleClickForward}
            onContextMenu={forwardHistoryMenuHandler}
            size="small"
            title="Go forward"
            {...forwardLongPressHandlers}
          >
            <ArrowForwardIcon fontSize="small" />
          </IconButton>
          <IconButton
            disabled={loading || !fileUrl}
            onClick={handleClickUpward}
            size="small"
            title="Go up"
          >
            <ArrowUpwardIcon fontSize="small" />
          </IconButton>
          <IconButton
            disabled={loading}
            onClick={handleClickRefresh}
            size="small"
            title="Refresh"
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
          <AddressTextField onChange={handleChangeUrl} value={urlInput} />
        </Stack>
        <Box
          sx={{
            display: { sm: 'none', md: 'block' },
            flex: '0.5 1 0',
          }}
        />
        <Stack
          direction="row"
          spacing={1}
          sx={{
            WebkitAppRegion: 'no-drag',
            alignItems: 'center',
            flex: '0.5 1 0',
          }}
        >
          <ViewModeToggleButtonGroup />
        </Stack>
        <Box
          sx={{
            display: { sm: 'none', md: 'block' },
            flex: '0.5 1 0',
          }}
        />
        <Stack
          direction="row"
          spacing={1}
          sx={{
            WebkitAppRegion: 'no-drag',
            alignItems: 'center',
            flex: '3 1 0',
          }}
        >
          <SearchAutocomplete />
          <IconButton onClick={handleClickMore} size="small" title="Settings">
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Toolbar>
      <Divider sx={{ inset: 'auto 0 0', position: 'absolute' }} />
    </AppBar>
  )
}

export default AddressBar
