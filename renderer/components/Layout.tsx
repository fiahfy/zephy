import { Box, Toolbar } from '@mui/material'
import { useRouter } from 'next/router'
import { ReactNode, useEffect } from 'react'
import ExplorerBar from 'components/ExplorerBar'
import Sidebar from 'components/Sidebar'
import TitleBar from 'components/TitleBar'
import { useAppDispatch, useAppSelector } from 'store'
import { add, remove } from 'store/favorite'
import {
  back,
  forward,
  move,
  moveToSettings,
  moveToTrash,
  selectCurrentPathname,
} from 'store/window'
import { openContextMenu } from 'utils/contextMenu'

type Props = {
  children: ReactNode
}

const Layout = (props: Props) => {
  const { children } = props

  const currentPathname = useAppSelector(selectCurrentPathname)
  const dispatch = useAppDispatch()
  const router = useRouter()

  useEffect(() => {
    if (router.pathname !== currentPathname) {
      router.replace(currentPathname)
    }
  }, [currentPathname, router])

  useEffect(() => {
    const unsubscribeEntry = window.electronAPI.subscription.entry(
      (path, operation) => {
        switch (operation) {
          case 'move':
            return dispatch(move(path))
          case 'moveToTrash':
            return dispatch(moveToTrash(path))
          case 'newFolder':
            // TODO: Implement
            return
          case 'addToFavorites':
            return dispatch(add(path))
          case 'removeFromFavorites':
            return dispatch(remove(path))
        }
      }
    )
    const unsubscribeSettings = window.electronAPI.subscription.settings(() =>
      dispatch(moveToSettings())
    )

    const handleMouseDown = (e: globalThis.MouseEvent) => {
      switch (e.button) {
        case 3:
          return dispatch(back())
        case 4:
          return dispatch(forward())
      }
    }
    document.addEventListener('mousedown', handleMouseDown)

    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      unsubscribeEntry()
      unsubscribeSettings()
    }
  }, [dispatch])

  return (
    <Box
      onMouseDown={openContextMenu}
      sx={{ display: 'flex', height: '100%', overflow: 'hidden' }}
    >
      {/* eslint-disable-next-line react/no-unknown-property */}
      <style global jsx>{`
        html,
        body,
        body > div:first-child,
        div#__next,
        div#__next > div {
          height: 100%;
        }
      `}</style>
      <TitleBar />
      <ExplorerBar />
      <Sidebar />
      <Box
        component="main"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
        }}
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
        <Box sx={{ flexGrow: 1, position: 'relative', overflow: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}

export default Layout
