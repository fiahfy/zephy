import { AppBar, Toolbar, Typography } from '@mui/material'

import { useTitleBar } from 'contexts/TitleBarContext'

const TitleBar = () => {
  const { shown } = useTitleBar()

  return (
    <>
      {shown && (
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
              minHeight: '28px!important',
              padding: '4px 72px 0',
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
