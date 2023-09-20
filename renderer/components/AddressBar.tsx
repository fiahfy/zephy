import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowUpward as ArrowUpwardIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
} from '@mui/icons-material'
import {
  AppBar,
  Autocomplete,
  Box,
  Divider,
  IconButton,
  InputAdornment,
  Toolbar,
  Typography,
} from '@mui/material'
import {
  ChangeEvent,
  KeyboardEvent,
  MouseEvent,
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import Icon from 'components/Icon'
import RoundedFilledTextField from 'components/mui/RoundedFilledTextField'
import { useTrafficLights } from 'contexts/TrafficLightsContext'
import useContextMenu from 'hooks/useContextMenu'
import useLongPress from 'hooks/useLongPress'
import { useAppDispatch, useAppSelector } from 'store'
import { load, searchQuery, selectLoading, unselect } from 'store/explorer'
import { selectIsFavorite, toggle } from 'store/favorite'
import { remove, selectQueryHistories } from 'store/query'
import {
  back,
  changeDirectory,
  forward,
  selectBackHistories,
  selectCanBack,
  selectCanForward,
  selectCurrentDirectory,
  selectCurrentSortOption,
  selectCurrentViewMode,
  selectForwardHistories,
  selectIsSidebarHidden,
  selectZephySchema,
  selectZephyUrl,
  upward,
} from 'store/window'

const AddressBar = () => {
  const backHistories = useAppSelector(selectBackHistories)
  const canBack = useAppSelector(selectCanBack)
  const canForward = useAppSelector(selectCanForward)
  const currentDirectory = useAppSelector(selectCurrentDirectory)
  const currentSortOption = useAppSelector(selectCurrentSortOption)
  const currentViewMode = useAppSelector(selectCurrentViewMode)
  const favorite = useAppSelector(selectIsFavorite)(currentDirectory)
  const forwardHistories = useAppSelector(selectForwardHistories)
  const isSidebarHidden = useAppSelector(selectIsSidebarHidden)
  const loading = useAppSelector(selectLoading)
  const queryHistories = useAppSelector(selectQueryHistories)
  const zephyUrl = useAppSelector(selectZephyUrl)
  const zephySchema = useAppSelector(selectZephySchema)
  const dispatch = useAppDispatch()

  const { visible } = useTrafficLights()

  const { createMenuHandler } = useContextMenu()

  const backHistoryMenuHandler = useMemo(
    () =>
      createMenuHandler(
        backHistories.slice(0, 12).map((history, i) => ({
          id: 'go',
          params: {
            offset: -(i + 1),
            title: history.title,
          },
        })),
      ),
    [backHistories, createMenuHandler],
  )
  const forwardHistoryMenuHandler = useMemo(
    () =>
      createMenuHandler(
        forwardHistories.slice(0, 12).map((history, i) => ({
          id: 'go',
          params: {
            offset: i + 1,
            title: history.title,
          },
        })),
      ),
    [createMenuHandler, forwardHistories],
  )

  const bindBack = useLongPress(backHistoryMenuHandler)
  const bindForward = useLongPress(forwardHistoryMenuHandler)

  const [directory, setDirectory] = useState('')
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLInputElement>(null)

  const search = useCallback(
    (query: string) => {
      setQuery(query)
      dispatch(searchQuery(query))
    },
    [dispatch],
  )

  useEffect(() => {
    const removeListener = window.electronAPI.message.addListener((message) => {
      const { type } = message
      switch (type) {
        case 'find':
          ref.current?.focus()
          return
        case 'search':
          search(document.getSelection()?.toString() ?? '')
          ref.current?.focus()
          return
      }
    })
    return () => removeListener()
  }, [dispatch, search])

  useEffect(() => {
    setDirectory(currentDirectory)
    dispatch(load())
    dispatch(unselect())
  }, [currentDirectory, dispatch])

  const directoryIconType = useMemo(() => {
    if (zephyUrl) {
      switch (zephyUrl.pathname) {
        case 'ratings':
          return 'star'
        case 'settings':
          return 'settings'
      }
    }
    return 'folder'
  }, [zephyUrl])

  const handleClickBack = useCallback(() => dispatch(back()), [dispatch])

  const handleClickForward = useCallback(() => dispatch(forward()), [dispatch])

  const handleClickUpward = useCallback(
    async () => dispatch(upward()),
    [dispatch],
  )

  const handleClickRefresh = useCallback(async () => {
    setDirectory(currentDirectory)
    dispatch(load())
  }, [currentDirectory, dispatch])

  const handleClickFolder = useCallback(
    async () => await window.electronAPI.openPath(currentDirectory),
    [currentDirectory],
  )

  const handleClickFavorite = useCallback(
    () => dispatch(toggle(currentDirectory)),
    [currentDirectory, dispatch],
  )

  const handleClickSearch = useCallback(() => search(query), [query, search])

  const handleClickRemove = useCallback(
    (e: MouseEvent, query: string) => {
      e.stopPropagation()
      dispatch(remove(query))
    },
    [dispatch],
  )

  const handleClickMore = useMemo(
    () =>
      createMenuHandler([
        {
          id: 'newFolder',
          params: { path: zephySchema ? undefined : currentDirectory },
        },
        { id: 'separator' },
        { id: 'view', params: { viewMode: currentViewMode } },
        { id: 'separator' },
        {
          id: 'sortBy',
          params: { orderBy: currentSortOption.orderBy },
        },
        { id: 'separator' },
        {
          id: 'toggleNavigator',
          params: { hidden: isSidebarHidden('primary') },
        },
        {
          id: 'toggleInspector',
          params: { hidden: isSidebarHidden('secondary') },
        },
        { id: 'separator' },
        { id: 'settings' },
      ]),
    [
      createMenuHandler,
      currentDirectory,
      currentSortOption.orderBy,
      currentViewMode,
      isSidebarHidden,
      zephySchema,
    ],
  )
  const handleChangeDirectory = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setDirectory(value)
    },
    [],
  )

  const handleChangeQuery = useCallback(
    (_e: SyntheticEvent, value: string | null) => search(value ?? ''),
    [search],
  )

  const handleInputChangeQuery = useCallback(
    (_e: SyntheticEvent, value: string) =>
      value ? setQuery(value) : search(value),
    [search],
  )

  const handleKeyDownDirectory = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.nativeEvent.isComposing && directory) {
        dispatch(changeDirectory(directory))
      }
    },
    [directory, dispatch],
  )

  const handleKeyDownQuery = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
        search(query)
      }
    },
    [query, search],
  )

  return (
    <AppBar
      color="default"
      component="div"
      elevation={0}
      enableColorOnDark
      sx={{
        WebkitAppRegion: 'drag',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          minHeight: (theme) => `${theme.mixins.addressBar.height}!important`,
          pl: visible ? 10 : 1,
          pr: 1,
        }}
      >
        <Box sx={{ flex: '1 1 0' }} />
        <Box
          sx={{
            WebkitAppRegion: 'no-drag',
            alignItems: 'center',
            display: 'flex',
            flex: '6 1 0',
            gap: 0.5,
          }}
        >
          <IconButton
            disabled={loading || !canBack}
            onClick={handleClickBack}
            onContextMenu={backHistoryMenuHandler}
            size="small"
            title="Go back"
            {...bindBack}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <IconButton
            disabled={loading || !canForward}
            onClick={handleClickForward}
            onContextMenu={forwardHistoryMenuHandler}
            size="small"
            title="Go forward"
            {...bindForward}
          >
            <ArrowForwardIcon fontSize="small" />
          </IconButton>
          <IconButton
            disabled={loading || zephySchema}
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
          <RoundedFilledTextField
            InputProps={{
              endAdornment: !zephySchema && (
                <InputAdornment position="end">
                  <IconButton onClick={handleClickFavorite} size="small">
                    <Icon iconType={favorite ? 'star' : 'star-border'} />
                  </IconButton>
                </InputAdornment>
              ),
              startAdornment: (
                <InputAdornment position="start">
                  <IconButton
                    disabled={zephySchema}
                    onClick={zephySchema ? undefined : handleClickFolder}
                    size="small"
                  >
                    <Icon iconType={directoryIconType} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            fullWidth
            onChange={handleChangeDirectory}
            onKeyDown={handleKeyDownDirectory}
            spellCheck={false}
            value={directory}
          />
        </Box>
        <Box sx={{ flex: '1 1 0' }} />
        <Box
          sx={{
            WebkitAppRegion: 'no-drag',
            alignItems: 'center',
            display: 'flex',
            flex: '3 1 0',
            gap: 1,
          }}
        >
          <Autocomplete
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ListboxProps={{ sx: { typography: 'body2' } } as any}
            freeSolo
            fullWidth
            inputValue={query}
            onChange={handleChangeQuery}
            onInputChange={handleInputChangeQuery}
            onKeyDown={handleKeyDownQuery}
            options={queryHistories.concat().reverse()}
            renderInput={(params) => (
              <RoundedFilledTextField
                {...params}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconButton onClick={handleClickSearch} size="small">
                        <SearchIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                fullWidth
                inputRef={ref}
                placeholder="Search..."
              />
            )}
            renderOption={(props, option) => (
              <Box
                component="li"
                sx={(theme) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: `${theme.spacing(1.5)}!important`,
                  py: `${theme.spacing(0)}!important`,
                })}
                {...props}
              >
                <Typography noWrap sx={{ flexGrow: 1 }} variant="caption">
                  {option}
                </Typography>
                <IconButton
                  onClick={(e) => handleClickRemove(e, option)}
                  size="small"
                  title="Remove"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
            size="small"
            sx={{
              '.MuiFormControl-root': {
                '.MuiFilledInput-root.MuiInputBase-hiddenLabel.MuiInputBase-sizeSmall':
                  {
                    px: 1.5,
                    py: 0,
                    '.MuiFilledInput-input': { px: 0, py: 0.5 },
                  },
              },
            }}
          />
          <IconButton onClick={handleClickMore} size="small" title="Settings">
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>
      </Toolbar>
      <Divider sx={{ bottom: 0, position: 'absolute', width: '100%' }} />
    </AppBar>
  )
}

export default AddressBar
