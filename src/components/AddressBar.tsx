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
import Icon from '~/components/Icon'
import RoundedFilledTextField from '~/components/mui/RoundedFilledTextField'
import useLongPress from '~/hooks/useLongPress'
import useTrafficLight from '~/hooks/useTrafficLight'
import { useAppDispatch, useAppSelector } from '~/store'
import { load, search, selectLoading, selectQuery } from '~/store/explorer'
import { selectIsFavorite, toggleFavorite } from '~/store/favorite'
import { removeQuery, selectQueryHistories } from '~/store/query'
import { openEntry } from '~/store/settings'
import {
  back,
  changeDirectory,
  forward,
  selectBackHistories,
  selectCanBack,
  selectCanForward,
  selectCurrentDirectoryPath,
  selectCurrentSortOption,
  selectCurrentViewMode,
  selectForwardHistories,
  selectIsSidebarHidden,
  selectZephySchema,
  selectZephyUrl,
  upward,
} from '~/store/window'
import { createContextMenuHandler } from '~/utils/contextMenu'

const AddressBar = () => {
  const backHistories = useAppSelector(selectBackHistories)
  const canBack = useAppSelector(selectCanBack)
  const canForward = useAppSelector(selectCanForward)
  const currentDirectoryPath = useAppSelector(selectCurrentDirectoryPath)
  const currentSortOption = useAppSelector(selectCurrentSortOption)
  const currentViewMode = useAppSelector(selectCurrentViewMode)
  const favorite = useAppSelector(selectIsFavorite)(currentDirectoryPath)
  const forwardHistories = useAppSelector(selectForwardHistories)
  const isSidebarHidden = useAppSelector(selectIsSidebarHidden)
  const loading = useAppSelector(selectLoading)
  const query = useAppSelector(selectQuery)
  const queryHistories = useAppSelector(selectQueryHistories)
  const zephyUrl = useAppSelector(selectZephyUrl)
  const zephySchema = useAppSelector(selectZephySchema)
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

  const bindBack = useLongPress(backHistoryMenuHandler)
  const bindForward = useLongPress(forwardHistoryMenuHandler)

  const [directoryPath, setDirectoryPath] = useState('')
  const [queryInput, setQueryInput] = useState('')
  const ref = useRef<HTMLInputElement>(null)

  const searchBy = useCallback(
    (query: string) => {
      setQueryInput(query)
      dispatch(search(query))
    },
    [dispatch],
  )

  useEffect(() => {
    const removeListener = window.electronAPI.addMessageListener((message) => {
      const { type } = message
      switch (type) {
        case 'find':
          ref.current?.focus()
          return
        case 'search':
          searchBy(document.getSelection()?.toString() ?? '')
          ref.current?.focus()
          return
      }
    })
    return () => removeListener()
  }, [dispatch, searchBy])

  useEffect(
    () => setDirectoryPath(currentDirectoryPath),
    [currentDirectoryPath, dispatch],
  )

  useEffect(() => setQueryInput(query), [dispatch, query])

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
    setDirectoryPath(currentDirectoryPath)
    dispatch(load(true))
  }, [currentDirectoryPath, dispatch])

  const handleClickFolder = useCallback(
    async () => dispatch(openEntry(currentDirectoryPath)),
    [currentDirectoryPath, dispatch],
  )

  const handleClickFavorite = useCallback(
    () => dispatch(toggleFavorite(currentDirectoryPath)),
    [currentDirectoryPath, dispatch],
  )

  const handleClickSearch = useCallback(
    () => searchBy(queryInput),
    [queryInput, searchBy],
  )

  const handleClickRemove = useCallback(
    (e: MouseEvent, query: string) => {
      e.stopPropagation()
      dispatch(removeQuery(query))
    },
    [dispatch],
  )

  const handleClickMore = useMemo(
    () =>
      createContextMenuHandler([
        {
          type: 'newFolder',
          data: { path: zephySchema ? undefined : currentDirectoryPath },
        },
        { type: 'separator' },
        { type: 'view', data: { viewMode: currentViewMode } },
        { type: 'separator' },
        {
          type: 'sortBy',
          data: { orderBy: currentSortOption.orderBy },
        },
        { type: 'separator' },
        {
          type: 'toggleNavigator',
          data: { hidden: isSidebarHidden('primary') },
        },
        {
          type: 'toggleInspector',
          data: { hidden: isSidebarHidden('secondary') },
        },
        { type: 'separator' },
        { type: 'settings' },
      ]),
    [
      currentDirectoryPath,
      currentSortOption.orderBy,
      currentViewMode,
      isSidebarHidden,
      zephySchema,
    ],
  )
  const handleChangeDirectory = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setDirectoryPath(value)
    },
    [],
  )

  const handleChangeQuery = useCallback(
    (_e: SyntheticEvent, value: string | null) => searchBy(value ?? ''),
    [searchBy],
  )

  const handleInputChangeQuery = useCallback(
    (_e: SyntheticEvent, value: string) =>
      value ? setQueryInput(value) : searchBy(value),
    [searchBy],
  )

  const handleKeyDownDirectory = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.nativeEvent.isComposing && directoryPath) {
        dispatch(changeDirectory(directoryPath))
      }
    },
    [directoryPath, dispatch],
  )

  const handleKeyDownQuery = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
        searchBy(queryInput)
      }
    },
    [queryInput, searchBy],
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
          sx={(theme) => ({
            WebkitAppRegion: 'no-drag',
            alignItems: 'center',
            display: 'flex',
            flex: '6 1 0',
            [theme.breakpoints.down('sm')]: {
              flex: '12 1 0',
            },
            gap: 0.5,
          })}
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
            value={directoryPath}
          />
        </Box>
        <Box sx={{ flex: '1 1 0' }} />
        <Box
          sx={(theme) => ({
            WebkitAppRegion: 'no-drag',
            alignItems: 'center',
            display: 'flex',
            flex: '3 1 0',
            [theme.breakpoints.down('sm')]: {
              flex: '6 1 0',
            },
            gap: 1,
          })}
        >
          <Autocomplete
            ListboxProps={{ sx: { typography: 'body2' } }}
            freeSolo
            fullWidth
            inputValue={queryInput}
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
      <Divider sx={{ inset: 'auto 0 0', position: 'absolute' }} />
    </AppBar>
  )
}

export default AddressBar
