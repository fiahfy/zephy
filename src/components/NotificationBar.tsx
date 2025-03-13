import { Alert, Snackbar, type SnackbarCloseReason } from '@mui/material'
import {
  type SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useAppSelector } from '~/store'
import { selectNotification } from '~/store/notification'

const NotificationBar = () => {
  const notification = useAppSelector(selectNotification)

  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (notification) {
      setOpen(true)
    }
  }, [notification])

  const autoHideDuration = useMemo(
    () =>
      notification?.type && ['info', 'success'].includes(notification.type)
        ? 6000
        : null,
    [notification?.type],
  )

  const handleClose = useCallback(
    (_event: SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
      if (reason === 'clickaway') {
        return
      }

      setOpen(false)
    },
    [],
  )

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      sx={(theme) => ({
        bottom: `calc(${theme.mixins.statusBar.height} + ${theme.spacing(1)})!important`,
        left: `${theme.spacing(1)}!important`,
      })}
    >
      <Alert
        onClose={handleClose}
        severity={notification?.type}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {notification?.message}
      </Alert>
    </Snackbar>
  )
}

export default NotificationBar
