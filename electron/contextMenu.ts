import { ActionCreators, register } from '@fiahfy/electron-context-menu'
import { IpcMainInvokeEvent, clipboard, shell } from 'electron'
import { canPaste, copy, paste } from './utils/clipboard'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const send = (event: IpcMainInvokeEvent, message: any) =>
  event.sender.send('sendMessage', message)

const registerContextMenu = (
  createWindow: (directoryPath?: string) => Promise<void>,
) => {
  const actionCreators: ActionCreators = {
    copyPath: (_event, _params, { path }) => ({
      click: () => clipboard.writeText(path),
      label: 'Copy Path',
    }),
    go: (event, _params, { label, offset }) => ({
      click: () => send(event, { type: 'go', data: { offset } }),
      label,
    }),
    loop: (event, _params, { checked }) => ({
      checked,
      click: () =>
        send(event, {
          type: 'changeLoop',
          data: {
            enabled: !checked,
          },
        }),
      label: 'Loop',
      type: 'checkbox',
    }),
    moveToTrash: (event, _params, { paths }) => ({
      accelerator: 'CmdOrCtrl+Backspace',
      click: () => send(event, { type: 'moveToTrash', data: { paths } }),
      label: 'Move to Trash',
    }),
    newFolder: (event, _params, { path }) => ({
      click: () => send(event, { type: 'newFolder', data: { path } }),
      enabled: !!path,
      label: 'New Folder',
    }),
    open: (event, _params, { path }) => ({
      click: () => send(event, { type: 'openEntry', data: { path } }),
      label: 'Open',
    }),
    openDirectory: (event, _params, { path }) => ({
      click: () =>
        send(event, { type: 'changeDirectory', data: { path: path } }),
      label: 'Open',
    }),
    openDirectoryInNewWindow: (_event, _params, { path }) => ({
      click: () => createWindow(path),
      label: 'Open in New Window',
    }),
    rename: (event, _params, { path }) => ({
      click: () => send(event, { type: 'rename', data: { path: path } }),
      label: 'Rename...',
    }),
    revealInFinder: (_event, _params, { path }) => ({
      click: () => shell.showItemInFolder(path),
      label: 'Reveal in Finder',
    }),
    settings: (event) => ({
      accelerator: 'CmdOrCtrl+,',
      click: () => send(event, { type: 'goToSettings' }),
      label: 'Settings',
    }),
    sortBy: (event, _params, { orderBy }) => ({
      label: 'Sort By',
      submenu: [
        { label: 'Name', orderBy: 'name' },
        { label: 'Date Last Opened', orderBy: 'dateLastOpened' },
        { label: 'Date Modified', orderBy: 'dateModified' },
        { label: 'Date Created', orderBy: 'dateCreated' },
        { label: 'Size', orderBy: 'size' },
        { label: 'Rating', orderBy: 'rating' },
      ].map((menu) => ({
        ...menu,
        checked: menu.orderBy === orderBy,
        click: () =>
          send(event, { type: 'sort', data: { orderBy: menu.orderBy } }),
        type: 'checkbox',
      })),
    }),
    toggleFavorite: (event, _params, { favorite, path }) => ({
      click: () =>
        send(event, {
          type: favorite ? 'removeFromFavorites' : 'addToFavorites',
          data: { path },
        }),
      label: favorite ? 'Remove from Favorites' : 'Add to Favorites',
    }),
    toggleInspector: (event, _params, { hidden }) => ({
      click: () =>
        send(event, {
          type: 'changeSidebarHidden',
          data: {
            variant: 'secondary',
            hidden: !hidden,
          },
        }),
      label: hidden ? 'Show Inspector' : 'Hide Inspector',
    }),
    toggleNavigator: (event, _params, { hidden }) => ({
      click: () =>
        send(event, {
          type: 'changeSidebarHidden',
          data: {
            variant: 'primary',
            hidden: !hidden,
          },
        }),
      label: hidden ? 'Show Navigator' : 'Hide Navigator',
    }),
    view: (event, _params, { viewMode }) => ({
      label: 'View',
      submenu: [
        { label: 'as List', viewMode: 'list' },
        { label: 'as Thumbnail', viewMode: 'thumbnail' },
      ].map((menu) => ({
        ...menu,
        checked: menu.viewMode === viewMode,
        click: () =>
          send(event, {
            type: 'changeViewMode',
            data: { viewMode: menu.viewMode },
          }),
        type: 'checkbox',
      })),
    }),
    // TODO: implement
    cutEntries: () => ({
      accelerator: 'CmdOrCtrl+X',
      click: () => undefined,
      enabled: false,
      label: 'Cut',
    }),
    copyEntries: (_event, _params, { paths }) => ({
      accelerator: 'CmdOrCtrl+C',
      click: () => copy(paths),
      enabled: paths.length > 0,
      label: 'Copy',
    }),
    pasteEntries: (_event, _params, { path }) => ({
      accelerator: 'CmdOrCtrl+V',
      click: () => paste(path),
      enabled: !!path && canPaste(),
      label: 'Paste',
    }),
    search: (event, params) =>
      params.selectionText.trim().length > 0 && {
        accelerator: 'CommandOrControl+F',
        click: () => send(event, { type: 'search' }),
        label: `Search for “${params.selectionText.trim()}”`,
      },
  }

  const defaultActionTypes = [
    'separator',
    'search',
    'separator',
    'cut',
    'copy',
    'paste',
    'separator',
    'inspectElement',
  ]

  register(actionCreators, defaultActionTypes)
}

export default registerContextMenu
