import { AppBar, Divider, Toolbar, Typography } from '@mui/material'
import pluralize from 'pluralize'
import { useMemo } from 'react'
import { useAppSelector } from '~/store'
import { selectCurrentContents, selectCurrentSelected } from '~/store/explorer'

const StatusBar = () => {
  const contents = useAppSelector(selectCurrentContents)
  const selected = useAppSelector(selectCurrentSelected)

  const message = useMemo(
    () =>
      selected.length === 0
        ? pluralize('item', contents.length, true)
        : `${selected.length} of ${contents.length} selected`,
    [contents, selected],
  )

  return (
    <AppBar
      color="default"
      component="div"
      elevation={0}
      enableColorOnDark
      sx={{
        WebkitAppRegion: 'drag',
        bottom: 0,
        top: 'auto',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          justifyContent: 'center',
          minHeight: (theme) => `${theme.mixins.statusBar.height}!important`,
          px: 1,
        }}
      >
        <Typography sx={{ mt: 0.25 }} variant="caption">
          {message}
        </Typography>
      </Toolbar>
      <Divider sx={{ inset: '0 0 auto', position: 'absolute' }} />
    </AppBar>
  )
}

export default StatusBar
