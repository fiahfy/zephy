import { AppBar, Divider, Toolbar, Typography } from '@mui/material'

const StatusBar = () => {
  return (
    <AppBar
      color="default"
      component="div"
      elevation={0}
      position="fixed"
      sx={{
        bottom: 0,
        top: 'auto',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          minHeight: (theme) => `${theme.mixins.statusBar.height}!important`,
          pl: 1,
          pr: 1,
        }}
      >
        <Typography variant="caption">dummy</Typography>
      </Toolbar>
      <Divider sx={{ top: 0, position: 'absolute', width: '100%' }} />
    </AppBar>
  )
}

export default StatusBar
