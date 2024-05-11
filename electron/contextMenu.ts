import { ActionCreators, register } from '@fiahfy/electron-context-menu'
import { IpcMainInvokeEvent, app, clipboard, shell } from 'electron'
import { canPaste, copy, paste } from './utils/clipboard'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const send = (event: IpcMainInvokeEvent, message: any) =>
  event.sender.send('sendMessage', message)

const registerContextMenu = (
  createWindow: (directoryPath?: string) => Promise<void>,
) => {
  const actionCreators: ActionCreators = {
    closeOtherTabs: (event, _params, { tabIndex }) => ({
      click: () => send(event, { type: 'closeOtherTabs', data: { tabIndex } }),
      label: 'Close Other Tabs',
    }),
    closeTab: (event, _params, { tabIndex }) => ({
      click: () => send(event, { type: 'closeTab', data: { tabIndex } }),
      label: 'Close',
    }),
    copyPath: (_event, _params, { path }) => ({
      click: () => clipboard.writeText(path),
      label: 'Copy Path',
    }),
    duplicateTab: (event, _params, { tabIndex }) => ({
      click: () => send(event, { type: 'duplicateTab', data: { tabIndex } }),
      label: 'Duplicate',
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
    newTab: (event, _params, { tabIndex }) => ({
      click: () =>
        send(event, {
          type: 'newTab',
          data: { path: app.getPath('home'), tabIndex },
        }),
      label: 'New Tab',
    }),
    open: (event, _params, { path }) => ({
      click: () => send(event, { type: 'open', data: { path } }),
      label: 'Open',
    }),
    openInNewWindow: (_event, _params, { path }) => ({
      click: () => createWindow(path),
      label: 'Open in New Window',
    }),
    openInNewTab: (event, _params, { path, tabIndex }) => ({
      click: () => send(event, { type: 'newTab', data: { path, tabIndex } }),
      label: 'Open in New Tab',
    }),
    rename: (event, _params, { path }) => ({
      click: () => send(event, { type: 'rename', data: { path } }),
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
        { label: 'Name', value: 'name' },
        { label: 'Date Last Opened', value: 'dateLastOpened' },
        { label: 'Date Modified', value: 'dateModified' },
        { label: 'Date Created', value: 'dateCreated' },
        { label: 'Size', value: 'size' },
        { label: 'Rating', value: 'rating' },
      ].map(({ label, value }) => ({
        checked: value === orderBy,
        click: () => send(event, { type: 'sort', data: { orderBy: value } }),
        label,
        type: 'radio',
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
        { label: 'as List', value: 'list' },
        { label: 'as Thumbnail', value: 'thumbnail' },
      ].map(({ label, value }) => ({
        checked: value === viewMode,
        click: () =>
          send(event, {
            type: 'changeViewMode',
            data: { viewMode: value },
          }),
        label,
        type: 'radio',
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
