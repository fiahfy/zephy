import { Box, Drawer as MuiDrawer, Toolbar } from '@mui/material'
import { styled } from '@mui/material/styles'
import throttle from 'lodash.throttle'
import {
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useAppDispatch, useAppSelector } from '~/store'
import {
  selectSidebarHiddenByVariant,
  selectSidebarWidthByVariant,
  setSidebarHidden,
  setSidebarWidth,
} from '~/store/window'

const minContentWidth = 100

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ open }) => ({
  ...(!open && {
    width: '0!important',
    '.MuiDrawer-paper': {
      width: '0!important',
    },
  }),
}))

type Props = {
  children: ReactNode
  variant: 'primary' | 'secondary'
}

const Sidebar = (props: Props) => {
  const { children, variant } = props

  const sidebarWidth = useAppSelector((state) =>
    selectSidebarWidthByVariant(state, variant),
  )
  const sidebarHidden = useAppSelector((state) =>
    selectSidebarHiddenByVariant(state, variant),
  )
  const opposite = useMemo(
    () => (variant === 'primary' ? 'secondary' : 'primary'),
    [variant],
  )
  const oppositeSidebarWidth = useAppSelector((state) =>
    selectSidebarWidthByVariant(state, opposite),
  )
  const oppositeSidebarHidden = useAppSelector((state) =>
    selectSidebarHiddenByVariant(state, opposite),
  )
  const dispatch = useAppDispatch()

  const [resizing, setResizing] = useState(false)

  const position = useMemo(
    () => (variant === 'primary' ? 'left' : 'right'),
    [variant],
  )

  const width = sidebarWidth
  const hidden = sidebarHidden

  const oppositeWidth = useMemo(
    () => (oppositeSidebarHidden ? 0 : oppositeSidebarWidth),
    [oppositeSidebarHidden, oppositeSidebarWidth],
  )

  useEffect(() => {
    const handler = throttle(() => {
      if (width + minContentWidth > window.innerWidth) {
        dispatch(setSidebarWidth(variant, window.innerWidth - minContentWidth))
      }
    }, 100)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [dispatch, variant, width])

  const handleMouseMove = useMemo(
    () =>
      throttle((e: globalThis.MouseEvent) => {
        const newWidth =
          position === 'left'
            ? e.clientX + 3
            : document.body.offsetWidth - e.clientX + 3
        if (
          newWidth > minContentWidth &&
          document.body.offsetWidth - oppositeWidth - newWidth > minContentWidth
        ) {
          dispatch(setSidebarWidth(variant, newWidth))
        }
        dispatch(setSidebarHidden(variant, newWidth < minContentWidth / 2))
      }, 100),
    [dispatch, oppositeWidth, position, variant],
  )

  const handleMouseUp = useCallback(() => {
    setResizing(false)
    document.body.classList.remove('col-resizing')
    document.removeEventListener('mouseup', handleMouseUp, true)
    document.removeEventListener('mousemove', handleMouseMove, true)
  }, [handleMouseMove])

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      // NOTE: Prevent dragging on tree view
      e.preventDefault()
      setResizing(true)
      document.body.classList.add('col-resizing')
      document.addEventListener('mouseup', handleMouseUp, true)
      document.addEventListener('mousemove', handleMouseMove, true)
    },
    [handleMouseMove, handleMouseUp],
  )

  return (
    <Drawer
      PaperProps={{ style: { width } }}
      anchor={position}
      open={!hidden}
      style={{ width }}
      variant="permanent"
    >
      <Toolbar
        sx={{
          flexShrink: 0,
          minHeight: (theme) => `${theme.mixins.addressBar.height}!important`,
        }}
      />
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          [position === 'left' ? 'marginRight' : 'marginLeft']: (theme) =>
            theme.spacing(0.5),
        }}
      >
        {children}
      </Box>
      <Toolbar
        sx={{
          flexShrink: 0,
          minHeight: (theme) => `${theme.mixins.statusBar.height}!important`,
        }}
      />
      <Box
        onMouseDown={handleMouseDown}
        sx={(theme) => ({
          backgroundColor: resizing
            ? theme.palette.primary.main
            : theme.palette.mode === 'light'
              ? theme.palette.grey[100]
              : theme.palette.grey[900],
          bottom: 0,
          cursor: 'col-resize',
          position: 'absolute',
          top: 0,
          transition: `background-color ${theme.transitions.duration.shortest}ms ${theme.transitions.easing.easeOut}`,
          width: theme.spacing(0.5),
          [position === 'left' ? 'right' : 'left']: 0,
          '&:hover': {
            backgroundColor: theme.palette.primary.main,
          },
        })}
      />
    </Drawer>
  )
}

export default Sidebar
