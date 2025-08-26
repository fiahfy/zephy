import { darken, GlobalStyles, lighten, Stack, Toolbar } from '@mui/material'
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
  copyInCurrentTab,
  moveToTrashInCurrentTab,
  newFolderInCurrentTab,
  openInCurrentTab,
  pasteInCurrentTab,
  refreshInCurrentTab,
  selectAllInCurrentTab,
  startRenamingInCurrentTab,
} from '~/store/explorer-list'
import { load } from '~/store/explorer-tree'
import { addToFavorites, removeFromFavorites } from '~/store/favorite'
import {
  toggleDateCreatedColumnVisible,
  toggleDateLastOpenedColumnVisible,
  toggleDateModifiedColumnVisible,
  toggleRatingColumnVisible,
  toggleSizeColumnVisible,
} from '~/store/preferences'
import {
  copy,
  moveToTrash,
  newFolder,
  paste,
  selectAll,
  startRenaming,
} from '~/store/preview'
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
import { createContextMenuHandler } from '~/utils/context-menu'

const focusedElement = () => {
  const el = document.activeElement
  if (!el) {
    return undefined
  }
  if (el.classList.contains('explorer-list')) {
    return 'explorer-list'
  } else if (el.classList.contains('preview')) {
    return 'preview'
  } else {
    return undefined
  }
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
    const removeListener = window.electronAPI.onMessage((message) => {
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
          switch (focusedElement()) {
            case 'explorer-list':
              return dispatch(copyInCurrentTab())
            case 'preview':
              return dispatch(copy())
            default:
              return window.electronAPI.copy()
          }
        case 'cut':
          switch (focusedElement()) {
            case 'explorer-list':
              // TODO: Implement cut entries
              return
            case 'preview':
              // TODO: Implement cut entries
              return
            default:
              return window.electronAPI.cut()
          }
        case 'duplicateTab':
          return dispatch(duplicateTab(data.tabId))
        case 'forward':
          return dispatch(forward())
        case 'go':
          return dispatch(go(data.offset))
        case 'goToSettings':
          return dispatch(goToSettings())
        case 'moveToTrash':
          switch (focusedElement()) {
            case 'explorer-list':
              return dispatch(moveToTrashInCurrentTab(data?.paths))
            case 'preview':
              return dispatch(moveToTrash(data?.paths))
            default:
              return
          }
        case 'newFolder':
          switch (focusedElement()) {
            case 'explorer-list':
              return dispatch(newFolderInCurrentTab(data.path))
            case 'preview':
              return dispatch(newFolder(data.path))
            default:
              return window.electronAPI.paste()
          }
        case 'newTab':
          return dispatch(newTab(data.path, data.tabId))
        case 'open':
          return dispatch(openInCurrentTab(data?.path))
        case 'removeFromFavorites':
          return dispatch(removeFromFavorites(data.path))
        case 'refresh':
          return dispatch(refreshInCurrentTab())
        case 'rename':
          switch (focusedElement()) {
            case 'explorer-list':
              return dispatch(startRenamingInCurrentTab(data?.path))
            case 'preview':
              return dispatch(startRenaming(data?.path))
            default:
              return
          }
        case 'revealInExplorer':
          return dispatch(load(data.path))
        case 'paste':
          switch (focusedElement()) {
            case 'explorer-list':
              return dispatch(pasteInCurrentTab())
            case 'preview':
              return dispatch(paste())
            default:
              return window.electronAPI.paste()
          }
        case 'selectAll':
          switch (focusedElement()) {
            case 'explorer-list':
              return dispatch(selectAllInCurrentTab())
            case 'preview':
              return dispatch(selectAll())
            default:
              return window.electronAPI.selectAll()
          }
        case 'sort':
          return dispatch(sort(data.orderBy))
        case 'toggleDateCreatedColumn':
          return dispatch(toggleDateCreatedColumnVisible())
        case 'toggleDateModifiedColumn':
          return dispatch(toggleDateModifiedColumnVisible())
        case 'toggleDateLastOpenedColumn':
          return dispatch(toggleDateLastOpenedColumnVisible())
        case 'toggleSizeColumn':
          return dispatch(toggleSizeColumnVisible())
        case 'toggleRatingColumn':
          return dispatch(toggleRatingColumnVisible())
      }
    })
    return () => removeListener()
  }, [dispatch])

  useEffect(() => {
    const removeListener = window.electronAPI.onFocusChange((focused) => {
      if (focused) {
        dispatch(updateApplicationMenu())
      }
    })
    return () => removeListener()
  }, [dispatch])

  // biome-ignore lint/correctness/useExhaustiveDependencies: false positive
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
    <Stack
      direction="row"
      onContextMenu={handleContextMenu}
      sx={{
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
      <Stack
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
        }}
      >
        <Toolbar
          sx={(theme) => ({
            flexShrink: 0,
            minHeight: `${theme.mixins.addressBar.height}!important`,
          })}
        />
        <TabBar />
        <TabPanels />
        <Toolbar
          sx={(theme) => ({
            flexShrink: 0,
            minHeight: `${theme.mixins.statusBar.height}!important`,
          })}
        />
      </Stack>
      <Sidebar variant="secondary">
        <Inspector />
      </Sidebar>
      <StatusBar />
      <NotificationBar />
    </Stack>
  )
}

export default App
