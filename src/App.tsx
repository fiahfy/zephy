import { Box, GlobalStyles, Toolbar, darken, lighten } from '@mui/material'
import { useEffect, useMemo } from 'react'
import AddressBar from '~/components/AddressBar'
import Inspector from '~/components/Inspector'
import Navigator from '~/components/Navigator'
import NotificationBar from '~/components/NotificationBar'
import Sidebar from '~/components/Sidebar'
import StatusBar from '~/components/StatusBar'
import TabBar from '~/components/TabBar'
import TabPanels from '~/components/TabPanels'
import useTheme from '~/hooks/useTheme'
import useTitle from '~/hooks/useTitle'
import { useAppDispatch, useAppSelector } from '~/store'
import {
  copyFromCurrentTab,
  moveToTrashFromCurrentTab,
  newFolderInCurrentTab,
  openFromCurrentTab,
  pasteToCurrentTab,
  selectAllInCurrentTab,
  startRenamingInCurrentTab,
} from '~/store/explorer-list'
import { setPath } from '~/store/explorer-tree'
import { addToFavorites, removeFromFavorites } from '~/store/favorite'
import {
  back,
  closeOtherTabs,
  closeTab,
  duplicateTab,
  forward,
  go,
  goToSettings,
  newTab,
  selectCurrentSortOption,
  selectCurrentTabId,
  selectCurrentTitle,
  selectCurrentViewMode,
  selectSidebar,
  setCurrentViewMode,
  setSidebarHidden,
  sort,
  updateApplicationMenu,
} from '~/store/window'
import { createContextMenuHandler } from '~/utils/contextMenu'

const isFocused = () => {
  const elements = document.querySelectorAll('.explorer-list')
  return Array.from(elements).some((el) => el === document.activeElement)
}

const App = () => {
  const currentSortOption = useAppSelector(selectCurrentSortOption)
  const currentTabId = useAppSelector(selectCurrentTabId)
  const currentViewMode = useAppSelector(selectCurrentViewMode)
  const sidebar = useAppSelector(selectSidebar)
  const title = useAppSelector(selectCurrentTitle)
  const dispatch = useAppDispatch()

  const { theme } = useTheme()

  useTitle(title)

  useEffect(() => {
    const removeListener = window.electronAPI.addMessageListener(
      async (message) => {
        const { type, data } = message
        switch (type) {
          case 'addToFavorites':
            return dispatch(addToFavorites(data.path))
          case 'back':
            return dispatch(back())
          case 'changeSidebarHidden':
            return dispatch(setSidebarHidden(data.variant, data.hidden))
          case 'changeViewMode':
            return dispatch(setCurrentViewMode(data.viewMode))
          case 'closeOtherTabs':
            return dispatch(closeOtherTabs(data.tabId))
          case 'closeTab':
            return dispatch(closeTab(data?.tabId))
          case 'copy':
            if (isFocused()) {
              return dispatch(copyFromCurrentTab())
            }
            return window.electronAPI.copy()
          case 'cut':
            if (isFocused()) {
              // TODO: implement
              return
            }
            return window.electronAPI.cut()
          case 'duplicateTab':
            return dispatch(duplicateTab(data.tabId))
          case 'forward':
            return dispatch(forward())
          case 'go':
            return dispatch(go(data.offset))
          case 'goToSettings':
            return dispatch(goToSettings())
          case 'moveToTrash':
            return dispatch(moveToTrashFromCurrentTab(data?.paths))
          case 'newFolder':
            return dispatch(newFolderInCurrentTab(data.path))
          case 'newTab':
            return dispatch(newTab(data.path, data.tabId))
          case 'open':
            return dispatch(openFromCurrentTab(data?.path))
          case 'removeFromFavorites':
            return dispatch(removeFromFavorites(data.path))
          case 'rename':
            return dispatch(startRenamingInCurrentTab(data?.path))
          case 'revealInExplorer':
            return dispatch(setPath({ path: data.path }))
          case 'paste':
            if (isFocused()) {
              return dispatch(pasteToCurrentTab())
            }
            return window.electronAPI.paste()
          case 'selectAll':
            if (isFocused()) {
              return dispatch(selectAllInCurrentTab())
            }
            return window.electronAPI.selectAll()
          case 'sort':
            return dispatch(sort(data.orderBy))
        }
      },
    )
    return () => removeListener()
  }, [dispatch])

  useEffect(() => {
    const removeListener = window.electronAPI.addFocusListener((focused) => {
      if (focused) {
        dispatch(updateApplicationMenu())
      }
    })
    return () => removeListener()
  }, [dispatch])

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    ;(async () => {
      const focused = await window.electronAPI.isFocused()
      if (focused) {
        dispatch(updateApplicationMenu())
      }
    })()
  }, [currentSortOption, currentTabId, currentViewMode, dispatch, sidebar])

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
          a: {
            color: theme.palette.primary.main,
          },
          '::-webkit-scrollbar': {
            width: 10,
            height: 10,
            '&-corner': {
              backgroundColor: 'transparent',
            },
          },
          '.theme-light': {
            '& ::selection': {
              backgroundColor: lighten(theme.palette.primary.main, 0.5),
            },
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
            '& ::selection': {
              backgroundColor: darken(theme.palette.primary.main, 0.5),
            },
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
        <NotificationBar />
      </Sidebar>
      <StatusBar />
    </Box>
  )
}

export default App
