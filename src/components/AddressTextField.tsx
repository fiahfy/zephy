import { IconButton, InputAdornment } from '@mui/material'
import {
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  useCallback,
  useMemo,
} from 'react'
import Icon from '~/components/Icon'
import RoundedFilledTextField from '~/components/mui/RoundedFilledTextField'
import { useAppDispatch, useAppSelector } from '~/store'
import {
  selectFavorite,
  selectFavoriteByPath,
  toggleFavorite,
} from '~/store/favorite'
import { openEntry } from '~/store/settings'
import { changeDirectory, selectCurrentDirectoryPath } from '~/store/window'
import { getIconType, isZephySchema } from '~/utils/url'

type Props = {
  onChange: (value: string) => void
  value: string
}

const AddressTextField = (props: Props) => {
  const { onChange, value } = props

  const directoryPath = useAppSelector(selectCurrentDirectoryPath)
  const favorite = useAppSelector((state) =>
    selectFavoriteByPath(selectFavorite(state), directoryPath),
  )
  const dispatch = useAppDispatch()

  const zephySchema = useMemo(
    () => isZephySchema(directoryPath),
    [directoryPath],
  )

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      onChange(value)
    },
    [onChange],
  )

  const handleFocus = useCallback((e: FocusEvent<HTMLInputElement>) => {
    e.target.setSelectionRange(0, 0)
    e.target.select()
  }, [])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.nativeEvent.isComposing && value) {
        dispatch(changeDirectory(value))
      }
    },
    [dispatch, value],
  )

  const handleClickFavorite = useCallback(
    () => dispatch(toggleFavorite(directoryPath)),
    [directoryPath, dispatch],
  )

  const handleClickFolder = useCallback(
    async () => dispatch(openEntry(directoryPath)),
    [directoryPath, dispatch],
  )

  return (
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
              <Icon iconType={getIconType(directoryPath)} />
            </IconButton>
          </InputAdornment>
        ),
      }}
      fullWidth
      onChange={handleChange}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      spellCheck={false}
      value={value}
    />
  )
}

export default AddressTextField
