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
import { open } from '~/store/settings'
import { changeUrl, selectCurrentUrl } from '~/store/window'
import { getIconType, getPath, isFileUrl } from '~/utils/url'

type Props = {
  onChange: (value: string) => void
  value: string
}

const AddressTextField = (props: Props) => {
  const { onChange, value } = props

  const url = useAppSelector(selectCurrentUrl)

  const directoryPath = useMemo(() => getPath(url), [url])

  const favorite = useAppSelector((state) =>
    selectFavoriteByPath(selectFavorite(state), directoryPath),
  )
  const dispatch = useAppDispatch()

  const fileUrl = useMemo(() => isFileUrl(url), [url])

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
        dispatch(changeUrl(value))
      }
    },
    [dispatch, value],
  )

  const handleClickFavorite = useCallback(
    () => dispatch(toggleFavorite(directoryPath)),
    [directoryPath, dispatch],
  )

  const handleClickFolder = useCallback(
    async () => dispatch(open(directoryPath)),
    [directoryPath, dispatch],
  )

  return (
    <RoundedFilledTextField
      fullWidth
      onChange={handleChange}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      slotProps={{
        input: {
          endAdornment: fileUrl && (
            <InputAdornment position="end">
              <IconButton onClick={handleClickFavorite} size="small">
                <Icon type={favorite ? 'star' : 'star-border'} />
              </IconButton>
            </InputAdornment>
          ),
          startAdornment: (
            <InputAdornment position="start">
              <IconButton
                disabled={!fileUrl}
                onClick={handleClickFolder}
                size="small"
              >
                <Icon type={getIconType(url)} />
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
      spellCheck={false}
      value={value}
    />
  )
}

export default AddressTextField
