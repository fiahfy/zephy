import {
  AppBar,
  Autocomplete,
  Box,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  ToggleButton,
  Toolbar,
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowUpward as ArrowUpwardIcon,
  Close as CloseIcon,
  Folder as FolderIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  Sort as SortIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  ViewSidebar as ViewSidebarIcon,
} from '@mui/icons-material'
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
import FilledToggleButtonGroup from 'components/enhanced/FilledToggleButtonGroup'
import RoundedFilledTextField from 'components/enhanced/RoundedFilledTextField'
import { useAppDispatch, useAppSelector } from 'store'
import { selectIsFavorite, toggle } from 'store/favorite'
import { selectQueryHistories } from 'store/queryHistory'
import {
  back,
  forward,
  load,
  move,
  moveToHome,
  moveToSettings,
  searchQuery,
  selectCanBack,
  selectCanForward,
  selectCurrentDirectory,
  selectCurrentSortOption,
  selectIndexPage,
  selectLayout,
  selectSidebarHidden,
  setLayout,
  setSidebarHidden,
  sort,
  unselectAll,
} from 'store/window'

const sortOptions = [
  { text: 'Name Ascending', value: 'name-asc' },
  { text: 'Name Descending', value: 'name-desc' },
  { text: 'Rating Ascending', value: 'rating-asc' },
  { text: 'Rating Descending', value: 'rating-desc' },
  { text: 'Date Modified Ascending', value: 'dateModified-asc' },
  { text: 'Date Modified Descending', value: 'dateModified-desc' },
]

const ExplorerBar = () => {
  const canBack = useAppSelector(selectCanBack)
  const canForward = useAppSelector(selectCanForward)
  const currentDirectory = useAppSelector(selectCurrentDirectory)
  const currentSortOption = useAppSelector(selectCurrentSortOption)
  const indexPage = useAppSelector(selectIndexPage)
  const favorite = useAppSelector(selectIsFavorite)(currentDirectory)
  const layout = useAppSelector(selectLayout)
  const queryHistories = useAppSelector(selectQueryHistories)
  const sidebarHidden = useAppSelector(selectSidebarHidden)
  const dispatch = useAppDispatch()

  const [directory, setDirectory] = useState('')
  const [queryInput, setQueryInput] = useState('')
  const ref = useRef<HTMLInputElement>(null)

  const search = useCallback(
    (query: string) => {
      setQueryInput(query)
      dispatch(searchQuery(query))
    },
    [dispatch]
  )

  useEffect(() => {
    const unsubscribe = window.electronAPI.subscription.search(() => {
      search(document.getSelection()?.toString() ?? '')
      ref.current && ref.current?.focus()
    })
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (
        e.key === 'f' &&
        ((e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey))
      ) {
        search(document.getSelection()?.toString() ?? '')
        ref.current && ref.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      unsubscribe()
    }
  }, [dispatch, search])

  useEffect(() => {
    ;(async () => {
      if (!currentDirectory) {
        return
      }
      setDirectory(currentDirectory)
      dispatch(unselectAll())
      if (indexPage) {
        dispatch(load())
      }
    })()
  }, [currentDirectory, dispatch, indexPage])

  useEffect(() => {
    if (!currentDirectory) {
      dispatch(moveToHome())
    }
  }, [currentDirectory, dispatch])

  // click handlers
  const handleClickBack = () => dispatch(back())

  const handleClickForward = () => dispatch(forward())

  const handleClickUpward = async () => {
    const dirPath = await window.electronAPI.dirname(directory)
    dispatch(move(dirPath))
  }

  const handleClickRefresh = async () => {
    setDirectory(currentDirectory)
    dispatch(load())
  }

  const handleClickSettings = () => dispatch(moveToSettings())

  const handleClickFolder = async () =>
    await window.electronAPI.openPath(currentDirectory)

  const handleClickFavorite = () => dispatch(toggle(currentDirectory))

  const handleClickSearch = () => search(queryInput)

  // change handlers
  const handleChangeDirectory = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value
    setDirectory(value)
  }

  const handleChangeViewSidebar = (
    _e: MouseEvent<HTMLElement>,
    value: 'sidebar'[]
  ) => dispatch(setSidebarHidden(!value.includes('sidebar')))

  const handleChangeLayout = (
    _e: MouseEvent<HTMLElement>,
    value: 'list' | 'thumbnail'
  ) => dispatch(setLayout(value))

  const handleChangeSortOption = (e: ChangeEvent<HTMLInputElement>) => {
    const [orderBy, order] = e.target.value.split('-') as [
      'name' | 'rating' | 'dateModified',
      'asc' | 'desc'
    ]
    dispatch(sort(currentDirectory, { orderBy, order }))
  }

  const handleChangeQuery = (_e: SyntheticEvent, value: string | null) =>
    search(value ?? '')

  const handleInputChangeQuery = (_e: SyntheticEvent, value: string) =>
    value ? setQueryInput(value) : search(value)

  const handleKeyDownDirectory = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing && directory) {
      dispatch(move(directory))
    }
  }

  const handleKeyDownQuery = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      search(queryInput)
    }
  }

  return (
    <AppBar
      color="default"
      component="div"
      elevation={0}
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar disableGutters sx={{ minHeight: '32px!important', px: 1 }}>
        <IconButton
          color="inherit"
          disabled={!canBack}
          onClick={handleClickBack}
          size="small"
          sx={{ mr: 0.5 }}
          title="Go back"
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <IconButton
          color="inherit"
          disabled={!canForward}
          onClick={handleClickForward}
          size="small"
          sx={{ mr: 0.5 }}
          title="Go forward"
        >
          <ArrowForwardIcon fontSize="small" />
        </IconButton>
        <IconButton
          color="inherit"
          disabled={!indexPage}
          onClick={handleClickUpward}
          size="small"
          sx={{ mr: 0.5 }}
          title="Go up"
        >
          <ArrowUpwardIcon fontSize="small" />
        </IconButton>
        <IconButton
          color="inherit"
          disabled={!indexPage}
          onClick={handleClickRefresh}
          size="small"
          title="Refresh"
        >
          <RefreshIcon fontSize="small" />
        </IconButton>
        <Box sx={{ display: 'flex', flexGrow: 1, mx: 1 }}>
          <Box sx={{ display: 'flex', flex: '2 1 0' }}>
            <RoundedFilledTextField
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      color="inherit"
                      disabled={!indexPage}
                      onClick={handleClickFavorite}
                      size="small"
                    >
                      <Icon
                        iconType={favorite ? 'star' : 'star-border'}
                        size="small"
                      />
                    </IconButton>
                  </InputAdornment>
                ),
                startAdornment: (
                  <InputAdornment position="start">
                    <IconButton
                      color="inherit"
                      disabled={!indexPage}
                      onClick={handleClickFolder}
                      size="small"
                    >
                      <FolderIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              fullWidth
              hiddenLabel
              onChange={handleChangeDirectory}
              onKeyDown={handleKeyDownDirectory}
              size="small"
              spellCheck={false}
              sx={{ mr: 0.5 }}
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
                  hiddenLabel
                  inputRef={ref}
                  placeholder="Search..."
                />
              )}
              size="small"
              sx={{
                ml: 0.5,
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
          onClick={handleClickSettings}
          size="small"
          title="Settings"
        >
          <SettingsIcon fontSize="small" />
        </IconButton>
      </Toolbar>
      <Toolbar disableGutters sx={{ minHeight: '32px!important', px: 1 }}>
        <FilledToggleButtonGroup
          onChange={handleChangeViewSidebar}
          size="small"
          value={sidebarHidden ? [] : ['sidebar']}
        >
          <ToggleButton
            sx={{ height: (theme) => theme.spacing(3.5), py: 0 }}
            title="Toggle Sidebar"
            value="sidebar"
          >
            <ViewSidebarIcon fontSize="small" />
          </ToggleButton>
        </FilledToggleButtonGroup>
        <Box style={{ flexGrow: 1 }} />
        <FilledToggleButtonGroup
          exclusive
          onChange={handleChangeLayout}
          size="small"
          sx={{ mr: 1 }}
          value={layout}
        >
          <ToggleButton
            sx={{ height: (theme) => theme.spacing(3.5), py: 0 }}
            title="List View"
            value="list"
          >
            <ViewListIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton
            sx={{ height: (theme) => theme.spacing(3.5), py: 0 }}
            title="Thumbnail View"
            value="thumbnail"
          >
            <ViewModuleIcon fontSize="small" />
          </ToggleButton>
        </FilledToggleButtonGroup>
        <RoundedFilledTextField
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SortIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          hiddenLabel
          onChange={handleChangeSortOption}
          select
          size="small"
          value={`${currentSortOption.orderBy}-${currentSortOption.order}`}
        >
          {sortOptions.map((option, index) => (
            <MenuItem dense key={index} value={option.value}>
              {option.text}
            </MenuItem>
          ))}
        </RoundedFilledTextField>
      </Toolbar>
      <Divider />
    </AppBar>
  )
}

export default ExplorerBar
