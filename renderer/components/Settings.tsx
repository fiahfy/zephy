import {
  AppBar,
  Box,
  Checkbox,
  Container,
  FormControlLabel,
  FormGroup,
  Toolbar,
  Typography,
} from '@mui/material'
import { ChangeEvent } from 'react'

import { useAppDispatch, useAppSelector } from 'store'
import {
  selectDarkMode,
  selectShouldShowHiddenFiles,
  setDarkMode,
  setShouldShowHiddenFiles,
} from 'store/settings'

const Settings = () => {
  const darkMode = useAppSelector(selectDarkMode)
  const shouldShowHiddenFiles = useAppSelector(selectShouldShowHiddenFiles)
  const dispatch = useAppDispatch()

  const handleChangeDarkMode = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.checked
    dispatch(setDarkMode(value))
  }

  const handleShouldShowHiddenFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.checked
    dispatch(setShouldShowHiddenFiles(value))
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
                <Checkbox
                  checked={darkMode}
                  onChange={handleChangeDarkMode}
                  size="small"
                />
              }
              label="Use Dark Mode"
            />
          </FormGroup>
        </Box>
        <Box sx={{ my: 2 }}>
          <Typography variant="subtitle2">Explorer</Typography>
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
            />
          </FormGroup>
        </Box>
      </Container>
    </>
  )
}

export default Settings
