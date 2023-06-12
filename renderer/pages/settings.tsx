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
import { selectDarkMode, setDarkMode } from 'store/settings'

const SettingsPage = () => {
  const darkMode = useAppSelector(selectDarkMode)
  const dispatch = useAppDispatch()

  const handleChangeDarkMode = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.checked
    dispatch(setDarkMode(value))
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
      </Container>
    </>
  )
}

export default SettingsPage
