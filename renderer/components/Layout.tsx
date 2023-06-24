import { Box, Toolbar } from '@mui/material'
import { useRouter } from 'next/router'
import { ReactNode, useEffect } from 'react'

import ExplorerBar from 'components/ExplorerBar'
import Inspector from 'components/Inspector'
import Navigator from 'components/Navigator'
import Sidebar from 'components/Sidebar'
import TitleBar from 'components/TitleBar'
import { useContextMenu } from 'hooks/useContextMenu'
import { useAppDispatch, useAppSelector } from 'store'
import { add, remove } from 'store/favorite'
import {
  back,
  changeDirectory,
  forward,
  goToSettings,
  moveToTrash,
  newFolder,
  selectCurrentPathname,
  setSidebarHidden,
  setViewMode,
  sort,
} from 'store/window'

type Props = {
  children: ReactNode
}

const Layout = (props: Props) => {
  const { children } = props

  const currentPathname = useAppSelector(selectCurrentPathname)
  const dispatch = useAppDispatch()

  const { open } = useContextMenu()

  const router = useRouter()

  useEffect(() => {
    if (router.pathname !== currentPathname) {
      router.replace(currentPathname)
    }
  }, [currentPathname, router])

  useEffect(() => {
    const unsubscribe = window.electronAPI.subscribe((eventName, params) => {
      switch (eventName) {
        case 'changeDirectory':
          return dispatch(changeDirectory(params.path))
        case 'moveToTrash':
          return dispatch(moveToTrash(params.paths))
        case 'newFolder':
          return dispatch(newFolder(params.path))
        case 'addToFavorites':
          return dispatch(add(params.path))
        case 'removeFromFavorites':
          return dispatch(remove(params.path))
        case 'goToSettings':
          return dispatch(goToSettings())
        case 'sort':
          return dispatch(sort(params.orderBy))
        case 'changeViewMode':
          return dispatch(setViewMode(params.viewMode))
        case 'changeSidebarHidden':
          return dispatch(setSidebarHidden(params.variant, params.hidden))
      }
    })

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
      unsubscribe()
    }
  }, [dispatch])

  return (
    <Box
      onContextMenu={open()}
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
      <Sidebar variant="primary">
        <Navigator />
      </Sidebar>
      <Box
        component="main"
        sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}
      >
        <Toolbar
          sx={{
            flexShrink: 0,
            minHeight: (theme) => `${theme.mixins.titleBar.height}px!important`,
          }}
        />
        <Toolbar sx={{ flexShrink: 0, minHeight: '35px!important' }} />
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>{children}</Box>
      </Box>
      <Sidebar variant="secondary">
        <Inspector />
      </Sidebar>
    </Box>
  )
}

export default Layout
