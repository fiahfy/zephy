import {
  Box,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material'
import { ChangeEvent, useCallback } from 'react'
import { Settings as SettingsType } from '~/interfaces'
import { useAppDispatch, useAppSelector } from '~/store'
import {
  selectShouldOpenWithVisty,
  selectShouldShowHiddenFiles,
  selectTheme,
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
  const shouldOpenWithVisty = useAppSelector(selectShouldOpenWithVisty)
  const theme = useAppSelector(selectTheme)
  const dispatch = useAppDispatch()

  const handleChangeTheme = useCallback(
    (e: SelectChangeEvent) => {
      const value = e.target.value as SettingsType['theme']
      dispatch(setTheme(value))
    },
    [dispatch],
  )

  const handleShouldShowHiddenFiles = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.checked
      dispatch(setShouldShowHiddenFiles(value))
    },
    [dispatch],
  )

  const handleShouldOpenWithVisty = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.checked
      dispatch(setShouldOpenWithVisty(value))
    },
    [dispatch],
  )

  return (
    <Container>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 2 }}>
        <Box>
          <Typography gutterBottom variant="subtitle2">
            Appearance
          </Typography>
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
        </Box>
        <Box>
          <Typography gutterBottom variant="subtitle2">
            Behavior
          </Typography>
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
                Open with{' '}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    window.electronAPI.openUrl(
                      'https://github.com/fiahfy/visty',
                    )
                  }}
                >
                  Visty
                </a>{' '}
                for Video and Audio Files
              </>
            }
            slotProps={{ typography: { variant: 'body2' } }}
          />
        </Box>
        <Box>
          <Typography gutterBottom variant="subtitle2">
            Advanced
          </Typography>
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
        </Box>
      </Box>
    </Container>
  )
}

export default Settings
