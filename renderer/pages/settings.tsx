import {
  AppBar,
  Box,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Toolbar,
  Typography,
} from '@mui/material'
import { ChangeEvent } from 'react'
import { Settings } from 'interfaces'
import { useAppDispatch, useAppSelector } from 'store'
import {
  selectContentLayout,
  selectDarkMode,
  selectFullscreen,
  setContentLayout,
  setDarkMode,
  setFullscreen,
} from 'store/settings'

const contentLayoutOptions = [
  { text: 'Default', value: 'default' },
  { text: 'Contain', value: 'contain' },
  { text: 'Cover', value: 'cover' },
]
const SettingsPage = () => {
  const contentLayout = useAppSelector(selectContentLayout)
  const darkMode = useAppSelector(selectDarkMode)
  const fullscreen = useAppSelector(selectFullscreen)
  const dispatch = useAppDispatch()

  const handleChangeDarkMode = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.checked
    dispatch(setDarkMode(value))
  }

  const handleChangeFullscreen = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.checked
    dispatch(setFullscreen(value))
  }

  const handleChangeContentLayout = (
    e: SelectChangeEvent<Settings['contentLayout']>
  ) => {
    const value = e.target.value as Settings['contentLayout']
    dispatch(setContentLayout(value))
  }

  return (
    <>
      <AppBar color="default" elevation={0} position="sticky" sx={{ top: 0 }}>
        <Toolbar variant="dense">
          <Typography component="div" variant="h6">
            Settings
          </Typography>
        </Toolbar>
      </AppBar>
      <Container>
        <Box sx={{ my: 2 }}>
          <Typography variant="subtitle2">General</Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox checked={darkMode} onChange={handleChangeDarkMode} />
              }
              label="Use Dark Mode"
            />
          </FormGroup>
        </Box>
        <Box sx={{ my: 2 }}>
          <Typography variant="subtitle2">Presentation</Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={fullscreen}
                  onChange={handleChangeFullscreen}
                />
              }
              label="Enter Fullscreen"
            />
          </FormGroup>
          <FormControl sx={{ mt: 2 }}>
            <InputLabel>Content Layout</InputLabel>
            <Select
              label="Content Layout"
              onChange={handleChangeContentLayout}
              sx={{ minWidth: (theme) => theme.spacing(20) }}
              value={contentLayout}
            >
              {contentLayoutOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.text}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Container>
    </>
  )
}

export default SettingsPage
