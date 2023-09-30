import { Box, GlobalStyles, Toolbar } from '@mui/material'
import { ReactNode, useMemo } from 'react'
import AddressBar from '~/components/AddressBar'
import Inspector from '~/components/Inspector'
import Navigator from '~/components/Navigator'
import Sidebar from '~/components/Sidebar'
import StatusBar from '~/components/StatusBar'
import useEventListener from '~/hooks/useEventListener'
import useMessageListener from '~/hooks/useMessageListener'
import useTitle from '~/hooks/useTitle'
import { createMenuHandler } from '~/utils/contextMenu'

type Props = {
  children: ReactNode
}

const Layout = (props: Props) => {
  const { children } = props

  useEventListener()
  useMessageListener()
  const title = useTitle()

  const handleContextMenu = useMemo(() => createMenuHandler(), [])

  return (
    <Box
      onContextMenu={handleContextMenu}
      sx={{
        display: 'flex',
        height: '100%',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* TODO: fix this */}
      {/* <Head>
        <title>{title}</title>
      </Head> */}
      <GlobalStyles
        styles={{
          'html, body, #root': {
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
      <AddressBar />
      <Sidebar variant="primary">
        <Navigator />
      </Sidebar>
      <Box
        component="main"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          minWidth: 0,
        }}
      >
        <Toolbar
          sx={{
            flexShrink: 0,
            minHeight: (theme) => `${theme.mixins.addressBar.height}!important`,
          }}
        />
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>{children}</Box>
        <Toolbar
          sx={{
            flexShrink: 0,
            minHeight: (theme) => `${theme.mixins.statusBar.height}!important`,
          }}
        />
      </Box>
      <Sidebar variant="secondary">
        <Inspector />
      </Sidebar>
      <StatusBar />
    </Box>
  )
}

export default Layout
