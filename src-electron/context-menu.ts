import { type ActionCreators, register } from '@fiahfy/electron-context-menu'
import { app, clipboard, type IpcMainInvokeEvent, shell } from 'electron'
import { canReadPaths, readPaths, writePaths } from './utils/clipboard'
import { copyEntries } from './utils/file'

// biome-ignore lint/suspicious/noExplicitAny: false positive
const send = (event: IpcMainInvokeEvent, message: any) =>
  event.sender.send('onMessage', message)

const registerContextMenu = (
  createWindow: (directoryPath?: string) => void,
) => {
  const actionCreators: ActionCreators = {
    closeOtherTabs: (event, _params, { tabId }) => ({
      click: () => send(event, { type: 'closeOtherTabs', data: { tabId } }),
      label: 'Close Other Tabs',
    }),
    closeTab: (event, _params, { tabId }) => ({
      click: () => send(event, { type: 'closeTab', data: { tabId } }),
      label: 'Close',
    }),
    copyPath: (_event, _params, { path }) => ({
      click: () => clipboard.writeText(path),
      label: 'Copy Path',
    }),
    duplicateTab: (event, _params, { tabId }) => ({
      click: () => send(event, { type: 'duplicateTab', data: { tabId } }),
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
    newTab: (event, _params, { tabId }) => ({
      click: () =>
        send(event, {
          type: 'newTab',
          data: { path: app.getPath('home'), tabId },
        }),
      label: 'New Tab',
    }),
    open: (event, _params, { path }) => ({
      click: () => send(event, { type: 'open', data: { path } }),
      label: 'Open',
    }),
    openInNewTab: (event, _params, { path, tabId }) => ({
      click: () => send(event, { type: 'newTab', data: { path, tabId } }),
      label: 'Open in New Tab',
    }),
    openInNewWindow: (_event, _params, { path }) => ({
      click: () => createWindow(path),
      label: 'Open in New Window',
    }),
    rename: (event, _params, { path }) => ({
      click: () => send(event, { type: 'rename', data: { path } }),
      label: 'Rename...',
    }),
    revealInExplorer: (event, _params, { path }) => ({
      click: () => send(event, { type: 'revealInExplorer', data: { path } }),
      label: 'Reveal in Explorer',
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
        { label: 'Date Created', value: 'dateCreated' },
        { label: 'Date Modified', value: 'dateModified' },
        { label: 'Date Last Opened', value: 'dateLastOpened' },
        { label: 'Size', value: 'size' },
        { label: 'Rating', value: 'score' },
      ].map(({ label, value }) => ({
        checked: value === orderBy,
        click: () => send(event, { type: 'sort', data: { orderBy: value } }),
        label,
        type: 'radio',
      })),
    }),
    toggleDateCreatedColumn: (event, _params, { checked }) => ({
      checked,
      click: () => send(event, { type: 'toggleDateCreatedColumn' }),
      label: 'Date Created',
      type: 'checkbox',
    }),
    toggleDateModifiedColumn: (event, _params, { checked }) => ({
      checked,
      click: () => send(event, { type: 'toggleDateModifiedColumn' }),
      label: 'Date Modified',
      type: 'checkbox',
    }),
    toggleDateLastOpenedColumn: (event, _params, { checked }) => ({
      checked,
      click: () => send(event, { type: 'toggleDateLastOpenedColumn' }),
      label: 'Date Last Opened',
      type: 'checkbox',
    }),
    toggleSizeColumn: (event, _params, { checked }) => ({
      checked,
      click: () => send(event, { type: 'toggleSizeColumn' }),
      label: 'Size',
      type: 'checkbox',
    }),
    toggleRatingColumn: (event, _params, { checked }) => ({
      checked,
      click: () => send(event, { type: 'toggleRatingColumn' }),
      label: 'Rating',
      type: 'checkbox',
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
        { label: 'as Gallery', value: 'gallery' },
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
    // TODO: Implement cut entries
    cutEntries: () => ({
      accelerator: 'CmdOrCtrl+X',
      click: () => undefined,
      enabled: false,
      label: 'Cut',
    }),
    copyEntries: (_event, _params, { paths }) => ({
      accelerator: 'CmdOrCtrl+C',
      click: () => writePaths(paths),
      enabled: paths.length > 0,
      label: 'Copy',
    }),
    pasteEntries: (_event, _params, { path }) => ({
      accelerator: 'CmdOrCtrl+V',
      click: () => {
        const paths = readPaths()
        return copyEntries(paths, path)
      },
      enabled: !!path && canReadPaths(),
      label: 'Paste',
    }),
    search: (event, params) => {
      const text = params.selectionText.trim()
      if (text.length === 0) {
        return undefined
      }
      const truncated = text.length <= 50 ? text : `${text.slice(0, 49)}...`
      return {
        accelerator: 'CommandOrControl+F',
        click: () => send(event, { type: 'search' }),
        label: `Search for “${truncated}”`,
      }
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
