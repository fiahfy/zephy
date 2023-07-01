import { Box, Toolbar } from '@mui/material'
import { ReactNode } from 'react'

import ExplorerBar from 'components/ExplorerBar'
import Inspector from 'components/Inspector'
import Navigator from 'components/Navigator'
import Sidebar from 'components/Sidebar'
import TitleBar from 'components/TitleBar'
import useContextMenu from 'hooks/useContextMenu'
import useDocumentHandler from 'hooks/useDocumentHandler'
import useRedirect from 'hooks/useRedirect'
import useSubscription from 'hooks/useSubscription'
import useWatcher from 'hooks/useWatcher'

type Props = {
  children: ReactNode
}

const Layout = (props: Props) => {
  const { children } = props

  const { createDefaultMenuHandler } = useContextMenu()
  useDocumentHandler()
  useRedirect()
  useSubscription()
  useWatcher()

  return (
    <Box
      onContextMenu={createDefaultMenuHandler()}
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
