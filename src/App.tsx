import { Box, GlobalStyles, Toolbar } from '@mui/material'
import { useEffect, useMemo } from 'react'
import AddressBar from '~/components/AddressBar'
import Explorer from '~/components/Explorer'
import Inspector from '~/components/Inspector'
import Navigator from '~/components/Navigator'
import Settings from '~/components/Settings'
import Sidebar from '~/components/Sidebar'
import StatusBar from '~/components/StatusBar'
import TabBar from '~/components/TabBar'
import useTitle from '~/hooks/useTitle'
import { useAppDispatch, useAppSelector } from '~/store'
import {
  copy,
  // load,
  moveToTrash,
  newFolder,
  paste,
  select,
  selectAll,
  startEditing,
} from '~/store/explorer'
import { add, remove } from '~/store/favorite'
import { openEntry } from '~/store/settings'
import {
  back,
  changeDirectory,
  closeCurrentTab,
  forward,
  go,
  goToSettings,
  newTab,
  selectCurrentDirectoryPath,
  selectCurrentTitle,
  setCurrentViewMode,
  setSidebarHidden,
  sort,
  updateApplicationMenu,
} from '~/store/window'
import { createContextMenuHandler } from '~/utils/contextMenu'

const App = () => {
  const currentDirectoryPath = useAppSelector(selectCurrentDirectoryPath)
  const currentTitle = useAppSelector(selectCurrentTitle)
  const dispatch = useAppDispatch()

  useTitle(currentTitle)

  // useEffect(() => {
  //   dispatch(load())
  // }, [currentHistory.directoryPath, dispatch])

  useEffect(() => {
    const removeListener = window.electronAPI.addMessageListener((message) => {
      const { type, data } = message
      switch (type) {
        case 'addToFavorites':
          return dispatch(add(data.path))
        case 'back':
          return dispatch(back())
        case 'changeDirectory':
          return dispatch(changeDirectory(data.path))
        case 'changeSidebarHidden':
          return dispatch(setSidebarHidden(data.variant, data.hidden))
        case 'changeViewMode':
          return dispatch(setCurrentViewMode(data.viewMode))
        case 'closeTab':
          return dispatch(closeCurrentTab())
        case 'copy':
          return dispatch(copy())
        case 'forward':
          return dispatch(forward())
        case 'go':
          return dispatch(go(data.offset))
        case 'goToSettings':
          return dispatch(goToSettings())
        case 'moveToTrash':
          return dispatch(moveToTrash(data?.paths))
        case 'newFolder':
          return dispatch(newFolder(data.path))
        case 'newTab':
          return dispatch(newTab())
        case 'openEntry':
          return dispatch(openEntry(data.path))
        case 'removeFromFavorites':
          return dispatch(remove(data.path))
        case 'rename':
          dispatch(select(data.path))
          dispatch(startEditing(data.path))
          return
        case 'paste':
          return dispatch(paste())
        case 'selectAll':
          return dispatch(selectAll())
        case 'sort':
          return dispatch(sort(data.orderBy))
      }
    })
    return () => removeListener()
  }, [dispatch])

  useEffect(() => {
    const handler = () => dispatch(updateApplicationMenu())
    window.addEventListener('focus', handler)
    return () => window.removeEventListener('focus', handler)
  }, [dispatch])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }
      switch (e.key) {
        case 'ArrowLeft':
          if ((e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)) {
            e.preventDefault()
            return dispatch(back())
          }
          break
        case 'ArrowRight':
          if ((e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)) {
            e.preventDefault()
            return dispatch(forward())
          }
          break
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [dispatch])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      switch (e.button) {
        case 3:
          e.preventDefault()
          return dispatch(back())
        case 4:
          e.preventDefault()
          return dispatch(forward())
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [dispatch])

  const Component = useMemo(() => {
    switch (currentDirectoryPath) {
      case 'zephy://settings':
        return Settings
      default:
        return Explorer
    }
  }, [currentDirectoryPath])

  const handleContextMenu = useMemo(() => createContextMenuHandler(), [])

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
        <TabBar />
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <Component />
        </Box>
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

export default App
