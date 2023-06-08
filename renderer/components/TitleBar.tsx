import { AppBar, Toolbar, Typography } from '@mui/material'

import { useTitleBar } from 'contexts/TitleBarContext'

const TitleBar = () => {
  const { visible } = useTitleBar()

  return (
    <>
      {visible && (
        <AppBar
          color="default"
          component="div"
          elevation={0}
          sx={{
            top: 0,
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
        >
          <Toolbar
            disableGutters
            sx={{
              WebkitAppRegion: 'drag',
              justifyContent: 'center',
              minHeight: (theme) => `${theme.spacing(3.5)}!important`,
              padding: (theme) => `${theme.spacing(0.5)} ${theme.spacing(9)} 0`,
              userSelect: 'none',
            }}
          >
            <Typography align="center" noWrap variant="caption">
              Zephy
            </Typography>
          </Toolbar>
        </AppBar>
      )}
    </>
  )
}

export default TitleBar
