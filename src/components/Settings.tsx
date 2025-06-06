import {
  Box,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  Link,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Stack,
  Typography,
} from '@mui/material'
import { type ChangeEvent, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '~/store'
import {
  selectShouldOpenWithPhoty,
  selectShouldOpenWithVisty,
  selectShouldShowHiddenFiles,
  selectTheme,
  setShouldOpenWithPhoty,
  setShouldOpenWithVisty,
  setShouldShowHiddenFiles,
  setTheme,
} from '~/store/settings'

const options = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System', value: 'system' },
]

const Settings = () => {
  const shouldShowHiddenFiles = useAppSelector(selectShouldShowHiddenFiles)
  const shouldOpenWithPhoty = useAppSelector(selectShouldOpenWithPhoty)
  const shouldOpenWithVisty = useAppSelector(selectShouldOpenWithVisty)
  const theme = useAppSelector(selectTheme)
  const dispatch = useAppDispatch()

  const handleChangeTheme = useCallback(
    (e: SelectChangeEvent) => {
      const theme = e.target.value as 'light' | 'dark' | 'system'
      dispatch(setTheme({ theme }))
    },
    [dispatch],
  )

  const handleShouldShowHiddenFiles = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const shouldShowHiddenFiles = e.target.checked
      dispatch(setShouldShowHiddenFiles({ shouldShowHiddenFiles }))
    },
    [dispatch],
  )

  const handleShouldOpenWithPhoty = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const shouldOpenWithPhoty = e.target.checked
      dispatch(setShouldOpenWithPhoty({ shouldOpenWithPhoty }))
    },
    [dispatch],
  )

  const handleShouldOpenWithVisty = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const shouldOpenWithVisty = e.target.checked
      dispatch(setShouldOpenWithVisty({ shouldOpenWithVisty }))
    },
    [dispatch],
  )

  return (
    <Container>
      <Stack spacing={2} sx={{ my: 2 }}>
        <Box>
          <Typography gutterBottom variant="subtitle2">
            Appearance
          </Typography>
          <FormGroup>
            <FormControl sx={{ mt: 1, width: 128 }}>
              <InputLabel id="theme">Theme</InputLabel>
              <Select
                label="Theme"
                labelId="theme"
                onChange={handleChangeTheme}
                size="small"
                value={theme}
              >
                {options.map(({ label, value }) => (
                  <MenuItem dense key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </FormGroup>
        </Box>
        <Box>
          <Typography gutterBottom variant="subtitle2">
            Behavior
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={shouldOpenWithPhoty}
                  onChange={handleShouldOpenWithPhoty}
                  size="small"
                />
              }
              label={
                <>
                  Open Image Files with{' '}
                  <Link
                    component="button"
                    onClick={(e) => {
                      e.preventDefault()
                      window.electronAPI.openUrl(
                        'https://github.com/fiahfy/photy',
                      )
                    }}
                  >
                    Photy
                  </Link>
                </>
              }
              slotProps={{ typography: { variant: 'body2' } }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={shouldOpenWithVisty}
                  onChange={handleShouldOpenWithVisty}
                  size="small"
                />
              }
              label={
                <>
                  Open Video and Audio Files with{' '}
                  <Link
                    component="button"
                    onClick={(e) => {
                      e.preventDefault()
                      window.electronAPI.openUrl(
                        'https://github.com/fiahfy/visty',
                      )
                    }}
                  >
                    Visty
                  </Link>
                </>
              }
              slotProps={{ typography: { variant: 'body2' } }}
            />
          </FormGroup>
        </Box>
        <Box>
          <Typography gutterBottom variant="subtitle2">
            Advanced
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={shouldShowHiddenFiles}
                  onChange={handleShouldShowHiddenFiles}
                  size="small"
                />
              }
              label="Show Hidden Files"
              slotProps={{ typography: { variant: 'body2' } }}
            />
          </FormGroup>
        </Box>
      </Stack>
    </Container>
  )
}

export default Settings
