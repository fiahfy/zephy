import { Box, Drawer as MuiDrawer, Toolbar } from '@mui/material'
import { grey } from '@mui/material/colors'
import { styled } from '@mui/material/styles'
import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from 'store'
import {
  selectInspectorHidden,
  selectInspectorWidth,
  setInspectorHidden,
  setInspectorWidth,
} from 'store/window'

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

const minContentWidth = 64

const Inspector = () => {
  const inspectorHidden = useAppSelector(selectInspectorHidden)
  const inspectorWidth = useAppSelector(selectInspectorWidth)
  const dispatch = useAppDispatch()

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const newWidth = document.body.offsetWidth - e.clientX + 3
      if (
        newWidth > minContentWidth &&
        newWidth < document.body.offsetWidth - minContentWidth
      ) {
        dispatch(setInspectorWidth(newWidth))
      }
      dispatch(setInspectorHidden(newWidth < minContentWidth / 2))
    },
    [dispatch]
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
      PaperProps={{ style: { width: inspectorWidth } }}
      anchor="right"
      className="scrollbar"
      open={!inspectorHidden}
      style={{ width: inspectorWidth }}
      variant="permanent"
    >
      <Toolbar
        sx={{
          flexShrink: 0,
          minHeight: (theme) => `${theme.mixins.titleBar.height}px!important`,
        }}
      />
      <Toolbar
        sx={{
          flexShrink: 0,
          minHeight: '65px!important',
        }}
      />
      <Box
        sx={{
          flexGrow: 1,
          marginLeft: '5px',
          overflowX: 'hidden',
          overflowY: 'scroll',
        }}
      >
        {/* TODO: Implement Inspector */}
      </Box>
      <Box
        onMouseDown={handleMouseDown}
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === 'light' ? grey[100] : grey[900],
          bottom: 0,
          cursor: 'col-resize',
          left: 0,
          position: 'absolute',
          top: 0,
          width: '5px',
        }}
      />
    </Drawer>
  )
}

export default Inspector
