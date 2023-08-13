import { Box, GlobalStyles, Toolbar } from '@mui/material'
import Head from 'next/head'
import { ReactNode } from 'react'

import ExplorerBar from 'components/ExplorerBar'
import Inspector from 'components/Inspector'
import Navigator from 'components/Navigator'
import Sidebar from 'components/Sidebar'
import useContextMenu from 'hooks/useContextMenu'
import useDocumentEventHandler from 'hooks/useDocumentEventHandler'
import useMessageListener from 'hooks/useMessageListener'
import useTitle from 'hooks/useTitle'

type Props = {
  children: ReactNode
}

const Layout = (props: Props) => {
  const { children } = props

  const { createMenuHandler } = useContextMenu()
  useDocumentEventHandler()
  useMessageListener()
  const title = useTitle()

  return (
    <Box
      onContextMenu={createMenuHandler()}
      sx={{ display: 'flex', height: '100%', overflow: 'hidden' }}
    >
      <Head>
        <title>{title}</title>
      </Head>
      <GlobalStyles
        styles={{
          'html, body, #__next': {
            height: '100%',
          },
          '::-webkit-scrollbar': {
            width: 10,
            height: 10,
            '&-corner': {
              backgroundColor: 'transparent',
            },
          },
          '.theme-light': {
            '& ::-webkit-scrollbar-thumb': {
              backgroundColor: '#e0e0e0',
              '&:hover': {
                backgroundColor: '#d2d2d2',
              },
              '&:active': {
                backgroundColor: '#bdbdbd',
              },
            },
          },
          '.theme-dark': {
            '& ::-webkit-scrollbar-thumb': {
              backgroundColor: '#424242',
              '&:hover': {
                backgroundColor: '#505050',
              },
              '&:active': {
                backgroundColor: '#616161',
              },
            },
          },
          '.col-resizing *': {
            cursor: 'col-resize',
            userSelect: 'none',
          },
        }}
      />
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
            minHeight: (theme) =>
              `${theme.mixins.explorerBar.height}!important`,
          }}
        />
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>{children}</Box>
      </Box>
      <Sidebar variant="secondary">
        <Inspector />
      </Sidebar>
    </Box>
  )
}

export default Layout
