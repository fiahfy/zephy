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
  type KeyboardEvent,
  type MouseEvent,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import AddressTextField from '~/components/AddressTextField'
import RoundedFilledTextField from '~/components/mui/RoundedFilledTextField'
import useLongPress from '~/hooks/useLongPress'
import useTrafficLight from '~/hooks/useTrafficLight'
import { useAppDispatch, useAppSelector } from '~/store'
import { refresh, selectCurrentLoading } from '~/store/explorer'
import { removeQuery, selectQueryHistories } from '~/store/query'
import {
  back,
  forward,
  search,
  selectBackHistories,
  selectCanBack,
  selectCanForward,
  selectCurrentDirectoryPath,
  selectCurrentQuery,
  selectCurrentSortOption,
  selectCurrentViewMode,
  selectForwardHistories,
  selectSidebarHiddenByVariant,
  upward,
} from '~/store/window'
import { createContextMenuHandler } from '~/utils/contextMenu'
import { isZephySchema } from '~/utils/url'

const AddressBar = () => {
  const backHistories = useAppSelector(selectBackHistories)
  const canBack = useAppSelector(selectCanBack)
  const canForward = useAppSelector(selectCanForward)
  const directoryPath = useAppSelector(selectCurrentDirectoryPath)
  const forwardHistories = useAppSelector(selectForwardHistories)
  const primarySidebarHidden = useAppSelector((state) =>
    selectSidebarHiddenByVariant(state, 'primary'),
  )
  const secondarySidebarHidden = useAppSelector((state) =>
    selectSidebarHiddenByVariant(state, 'secondary'),
  )
  const loading = useAppSelector(selectCurrentLoading)
  const query = useAppSelector(selectCurrentQuery)
  const queryHistories = useAppSelector(selectQueryHistories)
  const sortOption = useAppSelector(selectCurrentSortOption)
  const viewMode = useAppSelector(selectCurrentViewMode)
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

  const [directoryPathInput, setDirectoryPathInput] = useState('')
  const [queryInput, setQueryInput] = useState('')
  const ref = useRef<HTMLInputElement>(null)

  const zephySchema = useMemo(
    () => isZephySchema(directoryPath),
    [directoryPath],
  )

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
  }, [searchBy])

  useEffect(() => setDirectoryPathInput(directoryPath), [directoryPath])

  useEffect(() => setQueryInput(query), [query])

  const handleClickBack = useCallback(() => dispatch(back()), [dispatch])

  const handleClickForward = useCallback(() => dispatch(forward()), [dispatch])

  const handleClickUpward = useCallback(
    async () => dispatch(upward()),
    [dispatch],
  )

  const handleClickRefresh = useCallback(async () => {
    setDirectoryPathInput(directoryPath)
    dispatch(refresh())
  }, [directoryPath, dispatch])

  const handleClickSearch = useCallback(
    () => searchBy(queryInput),
    [queryInput, searchBy],
  )

  const handleClickRemove = useCallback(
    (e: MouseEvent, query: string) => {
      e.stopPropagation()
      dispatch(removeQuery({ query }))
    },
    [dispatch],
  )

  const handleClickMore = useMemo(
    () =>
      createContextMenuHandler([
        {
          type: 'newFolder',
          data: { path: zephySchema ? undefined : directoryPath },
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
      zephySchema,
    ],
  )

  const handleChangeDirectory = useCallback((value: string) => {
    setDirectoryPathInput(value)
  }, [])

  const handleChangeQuery = useCallback(
    (_e: SyntheticEvent, value: string | null) => searchBy(value ?? ''),
    [searchBy],
  )

  const handleInputChangeQuery = useCallback(
    (_e: SyntheticEvent, value: string) =>
      value ? setQueryInput(value) : searchBy(value),
    [searchBy],
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
          gap: 1,
          pl: visible ? 10 : 1,
          pr: 1,
        }}
      >
        <Box
          sx={(theme) => ({
            flex: '1 1 0',
            [theme.breakpoints.down('md')]: { display: 'none' },
          })}
        />
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
          <AddressTextField
            onChange={handleChangeDirectory}
            value={directoryPathInput}
          />
        </Box>
        <Box
          sx={(theme) => ({
            flex: '1 1 0',
            [theme.breakpoints.down('md')]: { display: 'none' },
          })}
        />
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
                fullWidth
                inputRef={ref}
                placeholder="Search..."
                slotProps={{
                  input: {
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconButton onClick={handleClickSearch} size="small">
                          <SearchIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            )}
            renderOption={(props, option) => (
              <Box
                {...props}
                component="li"
                key={option}
                sx={(theme) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: `${theme.spacing(1.5)}!important`,
                  py: `${theme.spacing(0)}!important`,
                })}
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
