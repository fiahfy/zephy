import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowUpward as ArrowUpwardIcon,
  Close as CloseIcon,
  Folder as FolderIcon,
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
  SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import Icon from 'components/Icon'
import RoundedFilledTextField from 'components/mui/RoundedFilledTextField'
import useContextMenu from 'hooks/useContextMenu'
import { useAppDispatch, useAppSelector } from 'store'
import { load, searchQuery, unselect } from 'store/explorer'
import { selectIsFavorite, toggle } from 'store/favorite'
import { selectQueryHistories } from 'store/queryHistory'
import {
  back,
  changeDirectory,
  forward,
  selectCanBack,
  selectCanForward,
  selectCurrentDirectory,
  selectExplorable,
  upward,
} from 'store/window'

const ExplorerBar = () => {
  const canBack = useAppSelector(selectCanBack)
  const canForward = useAppSelector(selectCanForward)
  const currentDirectory = useAppSelector(selectCurrentDirectory)
  const explorable = useAppSelector(selectExplorable)
  const favorite = useAppSelector(selectIsFavorite)(currentDirectory)
  const queryHistories = useAppSelector(selectQueryHistories)
  const dispatch = useAppDispatch()

  const { createMoreMenuHandler } = useContextMenu()

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
    const removeListener = window.electronAPI.contextMenu.addListener(
      (eventName) => {
        if (eventName === 'search') {
          search(document.getSelection()?.toString() ?? '')
          ref.current?.focus()
        }
      },
    )
    return () => removeListener()
  }, [dispatch, search])

  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (
        e.key === 'f' &&
        ((e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey))
      ) {
        search(document.getSelection()?.toString() ?? '')
        ref.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [search])

  useEffect(() => {
    setDirectory(currentDirectory)
    dispatch(load())
    dispatch(unselect())
  }, [currentDirectory, dispatch])

  const handleClickBack = () => dispatch(back())

  const handleClickForward = () => dispatch(forward())

  const handleClickUpward = async () => dispatch(upward())

  const handleClickRefresh = async () => {
    setDirectory(currentDirectory)
    dispatch(load())
  }

  const handleClickFolder = async () =>
    await window.electronAPI.openPath(currentDirectory)

  const handleClickFavorite = () => dispatch(toggle(currentDirectory))

  const handleClickSearch = () => search(query)

  const handleChangeDirectory = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value
    setDirectory(value)
  }

  const handleChangeQuery = (_e: SyntheticEvent, value: string | null) =>
    search(value ?? '')

  const handleInputChangeQuery = (_e: SyntheticEvent, value: string) =>
    value ? setQuery(value) : search(value)

  const handleKeyDownDirectory = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing && directory) {
      dispatch(changeDirectory(directory))
    }
  }

  const handleKeyDownQuery = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      search(query)
    }
  }

  return (
    <AppBar
      color="default"
      component="div"
      elevation={0}
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar
        disableGutters
        sx={{ gap: 1, minHeight: '34px!important', px: 1 }}
      >
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton
            color="inherit"
            disabled={!canBack}
            onClick={handleClickBack}
            size="small"
            title="Go back"
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <IconButton
            color="inherit"
            disabled={!canForward}
            onClick={handleClickForward}
            size="small"
            title="Go forward"
          >
            <ArrowForwardIcon fontSize="small" />
          </IconButton>
          <IconButton
            color="inherit"
            disabled={!explorable}
            onClick={handleClickUpward}
            size="small"
            title="Go up"
          >
            <ArrowUpwardIcon fontSize="small" />
          </IconButton>
          <IconButton
            color="inherit"
            disabled={!explorable}
            onClick={handleClickRefresh}
            size="small"
            title="Refresh"
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', flexGrow: 1, gap: 1 }}>
          <Box sx={{ display: 'flex', flex: '2 1 0' }}>
            <RoundedFilledTextField
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      color="inherit"
                      disabled={!explorable}
                      onClick={handleClickFavorite}
                      size="small"
                    >
                      <Icon iconType={favorite ? 'star' : 'star-border'} />
                    </IconButton>
                  </InputAdornment>
                ),
                startAdornment: (
                  <InputAdornment position="start">
                    <IconButton
                      color="inherit"
                      disabled={!explorable}
                      onClick={handleClickFolder}
                      size="small"
                    >
                      <FolderIcon fontSize="small" />
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
          <Box sx={{ display: 'flex', flex: '1 1 0' }}>
            <Autocomplete
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ListboxProps={{ sx: { typography: 'body2' } } as any}
              clearIcon={<CloseIcon fontSize="small" />}
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
                        <IconButton
                          color="inherit"
                          onClick={handleClickSearch}
                          size="small"
                        >
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
                  {...props}
                  component="li"
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <Typography noWrap sx={{ flexGrow: 1 }}>
                    {option}
                  </Typography>
                  {/* <IconButton
                    color="inherit"
                    disabled={!explorable}
                    onClick={handleClickRefresh}
                    size="small"
                    title="Refresh"
                  >
                    <RefreshIcon fontSize="small" />
                  </IconButton> */}
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
          </Box>
        </Box>
        <IconButton
          color="inherit"
          onClick={createMoreMenuHandler()}
          size="small"
          title="Settings"
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Toolbar>
      <Divider />
    </AppBar>
  )
}

export default ExplorerBar
