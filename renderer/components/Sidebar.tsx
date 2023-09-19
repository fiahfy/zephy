import { Box, Drawer as MuiDrawer, Toolbar } from '@mui/material'
import { grey } from '@mui/material/colors'
import { styled } from '@mui/material/styles'
import { useCallback, useMemo } from 'react'

import { useAppDispatch, useAppSelector } from 'store'
import {
  selectGetSidebarWidth,
  selectIsSidebarHidden,
  setSidebarHidden,
  setSidebarWidth,
} from 'store/window'

const minContentWidth = 64

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
  children: React.ReactNode
  variant: 'primary' | 'secondary'
}

const Sidebar = (props: Props) => {
  const { children, variant } = props

  const getSidebarWidth = useAppSelector(selectGetSidebarWidth)
  const isSidebarHidden = useAppSelector(selectIsSidebarHidden)
  const dispatch = useAppDispatch()

  const position = useMemo(
    () => (variant === 'primary' ? 'left' : 'right'),
    [variant],
  )

  const width = useMemo(
    () => getSidebarWidth(variant),
    [getSidebarWidth, variant],
  )
  const hidden = useMemo(
    () => isSidebarHidden(variant),
    [isSidebarHidden, variant],
  )

  const oppositeWidth = useMemo(
    () => getSidebarWidth(variant === 'primary' ? 'secondary' : 'primary'),
    [getSidebarWidth, variant],
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
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
    },
    [dispatch, oppositeWidth, position, variant],
  )

  const handleMouseUp = useCallback(() => {
    document.body.classList.remove('col-resizing')
    document.removeEventListener('mouseup', handleMouseUp, true)
    document.removeEventListener('mousemove', handleMouseMove, true)
  }, [handleMouseMove])

  const handleMouseDown = useCallback(() => {
    document.body.classList.add('col-resizing')
    document.addEventListener('mouseup', handleMouseUp, true)
    document.addEventListener('mousemove', handleMouseMove, true)
  }, [handleMouseMove, handleMouseUp])

  return (
    <Drawer
      PaperProps={{ style: { width } }}
      anchor={position}
      open={!hidden}
      style={{ width }}
      variant="permanent"
    >
      {!hidden && (
        <>
          <Toolbar
            sx={{
              flexShrink: 0,
              minHeight: (theme) =>
                `${theme.mixins.addressBar.height}!important`,
            }}
          />
          <Box
            sx={{
              flexGrow: 1,
              overflow: 'auto',
              [position === 'left' ? 'marginRight' : 'marginLeft']: (theme) =>
                theme.spacing(0.625),
            }}
          >
            {children}
          </Box>
          <Toolbar
            sx={{
              flexShrink: 0,
              minHeight: (theme) =>
                `${theme.mixins.statusBar.height}!important`,
            }}
          />
          {/* TODO: use Divider */}
          <Box
            onMouseDown={handleMouseDown}
            sx={{
              backgroundColor: (theme) =>
                theme.palette.mode === 'light' ? grey[100] : grey[900],
              bottom: 0,
              cursor: 'col-resize',
              position: 'absolute',
              top: 0,
              width: (theme) => theme.spacing(0.625),
              [position === 'left' ? 'right' : 'left']: 0,
            }}
          />
        </>
      )}
    </Drawer>
  )
}

export default Sidebar
