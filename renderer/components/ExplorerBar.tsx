import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowUpward as ArrowUpwardIcon,
  Delete as DeleteIcon,
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
  MouseEvent,
  SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import Icon from 'components/Icon'
import RoundedFilledTextField from 'components/mui/RoundedFilledTextField'
import useContextMenu from 'hooks/useContextMenu'
import useLongPress from 'hooks/useLongPress'
import { useAppDispatch, useAppSelector } from 'store'
import { load, searchQuery, unselect } from 'store/explorer'
import { selectIsFavorite, toggle } from 'store/favorite'
import { remove, selectQueryHistories } from 'store/queryHistory'
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

  const {
    createBackHistoryMenuHandler,
    createForwardHistoryMenuHandler,
    createMoreMenuHandler,
  } = useContextMenu()

  const bindBack = useLongPress(createBackHistoryMenuHandler())
  const bindForward = useLongPress(createForwardHistoryMenuHandler())

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
          break
        case 'search':
          search(document.getSelection()?.toString() ?? '')
          ref.current?.focus()
          break
      }
    })
    return () => removeListener()
  }, [dispatch, search])

  useEffect(() => {
    setDirectory(currentDirectory)
    dispatch(load())
    dispatch(unselect())
  }, [currentDirectory, dispatch])

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

  const handleChangeDirectory = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.currentTarget.value
      setDirectory(value)
    },
    [],
  )

  const handleClickRemove = useCallback(
    (e: MouseEvent, query: string) => {
      e.stopPropagation()
      dispatch(remove(query))
    },
    [dispatch],
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
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar
        disableGutters
        sx={{ gap: 1, minHeight: '34px!important', px: 1 }}
      >
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton
            disabled={!canBack}
            onClick={handleClickBack}
            onContextMenu={createBackHistoryMenuHandler()}
            size="small"
            title="Go back"
            {...bindBack}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <IconButton
            disabled={!canForward}
            onClick={handleClickForward}
            onContextMenu={createForwardHistoryMenuHandler()}
            size="small"
            title="Go forward"
            {...bindForward}
          >
            <ArrowForwardIcon fontSize="small" />
          </IconButton>
          <IconButton
            disabled={!explorable}
            onClick={handleClickUpward}
            size="small"
            title="Go up"
          >
            <ArrowUpwardIcon fontSize="small" />
          </IconButton>
          <IconButton onClick={handleClickRefresh} size="small" title="Refresh">
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
          </Box>
        </Box>
        <IconButton
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
