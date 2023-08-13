import {
  AppBar,
  Box,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Toolbar,
  Typography,
} from '@mui/material'
import { ChangeEvent, useCallback } from 'react'

import { Settings as SettingsType } from 'interfaces'
import { useAppDispatch, useAppSelector } from 'store'
import {
  selectShouldShowHiddenFiles,
  selectTheme,
  setShouldShowHiddenFiles,
  setTheme,
} from 'store/settings'

const options = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System', value: 'system' },
]

const Settings = () => {
  const shouldShowHiddenFiles = useAppSelector(selectShouldShowHiddenFiles)
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

  return (
    <>
      <AppBar color="default" elevation={0} position="sticky" sx={{ top: 0 }}>
        <Toolbar variant="dense">
          <Typography component="div" variant="subtitle1">
            Settings
          </Typography>
        </Toolbar>
      </AppBar>
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
    </>
  )
}

export default Settings
