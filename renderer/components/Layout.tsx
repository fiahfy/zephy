import { Box, Toolbar } from '@mui/material'
import { useRouter } from 'next/router'
import { ReactNode, useEffect } from 'react'
import ExplorerBar from 'components/ExplorerBar'
import Sidebar from 'components/Sidebar'
import TitleBar from 'components/TitleBar'
import { useAppDispatch, useAppSelector } from 'store'
import { add, remove } from 'store/favorite'
import { moveToSettings, selectCurrentPage } from 'store/window'
import { openContextMenu } from 'utils/contextMenu'

type Props = {
  children: ReactNode
}

const Layout = (props: Props) => {
  const { children } = props

  const currentPage = useAppSelector(selectCurrentPage)
  const dispatch = useAppDispatch()
  const router = useRouter()

  useEffect(() => {
    const unsubscribeShowSettings = window.electronAPI.subscribeShowSettings(
      () => dispatch(moveToSettings())
    )
    const unsubscribeAddToFavorites =
      window.electronAPI.subscribeAddToFavorites((path) => dispatch(add(path)))
    const unsubscribeRemoveFromFavorites =
      window.electronAPI.subscribeRemoveFromFavorites((path) =>
        dispatch(remove(path))
      )

    return () => {
      unsubscribeShowSettings()
      unsubscribeAddToFavorites()
      unsubscribeRemoveFromFavorites()
    }
  }, [dispatch])

  useEffect(() => {
    router.replace(currentPage)
  }, [currentPage, router])

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
