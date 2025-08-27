import { Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material'
import {
  Autocomplete,
  IconButton,
  InputAdornment,
  Stack,
  Typography,
} from '@mui/material'
import {
  type KeyboardEvent,
  type MouseEvent,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import RoundedFilledTextField from '~/components/mui/RoundedFilledTextField'
import { useAppDispatch, useAppSelector } from '~/store'
import { removeQuery, selectQueryHistories } from '~/store/query'
import { search, selectCurrentQuery } from '~/store/window'

const SearchAutocomplete = () => {
  const query = useAppSelector(selectCurrentQuery)
  const queryHistories = useAppSelector(selectQueryHistories)
  const dispatch = useAppDispatch()

  const [queryInput, setQueryInput] = useState('')

  const ref = useRef<HTMLInputElement>(null)

  const searchBy = useCallback(
    (query: string) => {
      setQueryInput(query)
      dispatch(search(query))
    },
    [dispatch],
  )

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

  const handleChange = useCallback(
    (_e: SyntheticEvent, value: string | null) => searchBy(value ?? ''),
    [searchBy],
  )

  const handleInputChange = useCallback(
    (_e: SyntheticEvent, value: string) =>
      value ? setQueryInput(value) : searchBy(value),
    [searchBy],
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
        searchBy(queryInput)
      }
    },
    [queryInput, searchBy],
  )

  useEffect(() => setQueryInput(query), [query])

  useEffect(() => {
    const removeListener = window.messageAPI.onMessage((message) => {
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

  return (
    <Autocomplete
      freeSolo
      fullWidth
      inputValue={queryInput}
      onChange={handleChange}
      onInputChange={handleInputChange}
      onKeyDown={handleKeyDown}
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
        <Stack
          {...props}
          component="li"
          direction="row"
          key={option}
          spacing={1}
          sx={(theme) => ({
            alignItems: 'center',
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
        </Stack>
      )}
      size="small"
      sx={{
        '.MuiFilledInput-root.MuiInputBase-hiddenLabel.MuiInputBase-sizeSmall':
          {
            px: 1.5,
            py: 0,
            '.MuiFilledInput-input': { px: 0, py: 0.5 },
          },
      }}
    />
  )
}

export default SearchAutocomplete
