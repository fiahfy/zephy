import { Box, GlobalStyles, Toolbar } from '@mui/material'
import { useEffect, useMemo } from 'react'
import AddressBar from '~/components/AddressBar'
import Inspector from '~/components/Inspector'
import Navigator from '~/components/Navigator'
import Sidebar from '~/components/Sidebar'
import StatusBar from '~/components/StatusBar'
import TabBar from '~/components/TabBar'
import TabPanels from '~/components/TabPanels'
import useTitle from '~/hooks/useTitle'
import { useAppDispatch, useAppSelector } from '~/store'
import {
  copy,
  moveToTrash,
  newFolder,
  paste,
  select,
  selectAll,
  startEditing,
} from '~/store/explorer'
import { addToFavorites, removeFromFavorites } from '~/store/favorite'
import { openEntry } from '~/store/settings'
import {
  back,
  changeDirectory,
  closeOtherTabs,
  closeTab,
  duplicateTab,
  forward,
  go,
  goToSettings,
  newTab,
  selectCurrentTitle,
  setCurrentViewMode,
  setSidebarHidden,
  sort,
  updateApplicationMenu,
} from '~/store/window'
import { createContextMenuHandler } from '~/utils/contextMenu'

const App = () => {
  const title = useAppSelector(selectCurrentTitle)
  const dispatch = useAppDispatch()

  useTitle(title)

  useEffect(() => {
    const removeListener = window.electronAPI.addMessageListener((message) => {
      const { type, data } = message
      switch (type) {
        case 'addToFavorites':
          return dispatch(addToFavorites(data.path))
        case 'back':
          return dispatch(back())
        case 'changeDirectory':
          return dispatch(changeDirectory(data.path))
        case 'changeSidebarHidden':
          return dispatch(setSidebarHidden(data.variant, data.hidden))
        case 'changeViewMode':
          return dispatch(setCurrentViewMode(data.viewMode))
        case 'closeOtherTabs':
          return dispatch(closeOtherTabs(data.tabIndex))
        case 'closeTab':
          return dispatch(closeTab(data?.tabIndex))
        case 'copy':
          return dispatch(copy())
        case 'duplicateTab':
          return dispatch(duplicateTab(data.tabIndex))
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
          return dispatch(newTab(data.path, data?.tabIndex))
        case 'openEntry':
          return dispatch(openEntry(data.path))
        case 'removeFromFavorites':
          return dispatch(removeFromFavorites(data.path))
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
    document.addEventListener('mouseup', handler)
    return () => document.removeEventListener('mouseup', handler)
  }, [dispatch])

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
        <TabPanels />
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
