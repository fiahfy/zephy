import {
  BrowserWindow,
  IpcMainInvokeEvent,
  Menu,
  MenuItemConstructorOptions,
  clipboard,
  ipcMain,
  shell,
} from 'electron'
import { canPaste, copy, paste } from './utils/clipboard'

export type ContextMenuOption = {
  data?: any // eslint-disable-line @typescript-eslint/no-explicit-any
  type: string
}

export type ContextMenuParams = {
  isEditable: boolean
  options: ContextMenuOption[]
  selectionText: string
  x: number
  y: number
}

const registerContextMenu = (
  createWindow: (directoryPath?: string) => Promise<void>,
) => {
  ipcMain.handle(
    'showContextMenu',
    (event: IpcMainInvokeEvent, params: ContextMenuParams) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const send = (message: any) => event.sender.send('sendMessage', message)

      const defaultActions = {
        separator: { type: 'separator' as const },
        cut: params.isEditable && {
          accelerator: 'CmdOrCtrl+X',
          role: 'cut' as const,
        },
        copy: (params.isEditable || params.selectionText.length > 0) && {
          accelerator: 'CmdOrCtrl+C',
          role: 'copy' as const,
        },
        paste: params.isEditable && {
          accelerator: 'CmdOrCtrl+V',
          role: 'paste' as const,
        },
        inspectElement: {
          label: 'Inspect Element',
          click: () => {
            event.sender.inspectElement(params.x, params.y)
            if (event.sender.isDevToolsOpened()) {
              event.sender.devToolsWebContents?.focus()
            }
          },
        },
        search: params.selectionText.trim().length > 0 && {
          accelerator: 'CommandOrControl+F',
          click: () => send({ type: 'search' }),
          label: `Search for “${params.selectionText.trim()}”`,
        },
      }

      const actionCreators: {
        [type in string]: (
          data: ContextMenuOption['data'],
        ) => MenuItemConstructorOptions
      } = {
        copyPath: ({ path }) => ({
          click: () => clipboard.writeText(path),
          label: 'Copy Path',
        }),
        go: ({ offset, title }) => ({
          click: () => send({ type: 'go', data: { offset } }),
          label: title,
        }),
        loop: ({ enabled }) => ({
          label: 'Loop',
          checked: enabled,
          click: () =>
            send({
              type: 'changeLoop',
              data: {
                enabled: !enabled,
              },
            }),
          type: 'checkbox',
        }),
        moveToTrash: ({ paths }) => ({
          accelerator: 'CmdOrCtrl+Backspace',
          click: () => send({ type: 'moveToTrash', data: { paths } }),
          label: 'Move to Trash',
        }),
        newFolder: ({ path }) => ({
          click: () => send({ type: 'newFolder', data: { path } }),
          enabled: !!path,
          label: 'New Folder',
        }),
        open: ({ path }) => ({
          click: () => shell.openPath(path),
          label: 'Open',
        }),
        openDirectory: ({ path }) => ({
          click: () => send({ type: 'changeDirectory', data: { path: path } }),
          label: 'Open',
        }),
        openDirectoryInNewWindow: ({ path }) => ({
          click: () => createWindow(path),
          label: 'Open in New Window',
        }),
        rename: ({ path }) => ({
          click: () => send({ type: 'rename', data: { path: path } }),
          label: 'Rename...',
        }),
        revealInFinder: ({ path }) => ({
          click: () => shell.showItemInFolder(path),
          label: 'Reveal in Finder',
        }),
        settings: () => ({
          accelerator: 'CmdOrCtrl+,',
          click: () => send({ type: 'goToSettings' }),
          label: 'Settings',
        }),
        sortBy: ({ orderBy }) => ({
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
              send({ type: 'sort', data: { orderBy: menu.orderBy } }),
            type: 'checkbox',
          })),
        }),
        toggleFavorite: ({ favorite, path }) => ({
          click: () =>
            send({
              type: favorite ? 'removeFromFavorites' : 'addToFavorites',
              data: {
                path: path,
              },
            }),
          label: favorite ? 'Remove from Favorites' : 'Add to Favorites',
        }),
        toggleInspector: ({ hidden }) => ({
          label: hidden ? 'Show Inspector' : 'Hide Inspector',
          click: () =>
            send({
              type: 'changeSidebarHidden',
              data: {
                variant: 'secondary',
                hidden: !hidden,
              },
            }),
        }),
        toggleNavigator: ({ hidden }) => ({
          label: hidden ? 'Show Navigator' : 'Hide Navigator',
          click: () =>
            send({
              type: 'changeSidebarHidden',
              data: {
                variant: 'primary',
                hidden: !hidden,
              },
            }),
        }),
        view: ({ viewMode }) => ({
          label: 'View',
          submenu: [
            { label: 'as List', viewMode: 'list' },
            { label: 'as Thumbnail', viewMode: 'thumbnail' },
          ].map((menu) => ({
            ...menu,
            checked: menu.viewMode === viewMode,
            click: () =>
              send({
                type: 'changeViewMode',
                data: { viewMode: menu.viewMode },
              }),
            type: 'checkbox',
          })),
        }),
        // TODO: implement
        cut: () => ({
          accelerator: 'CmdOrCtrl+X',
          click: () => undefined,
          enabled: false,
          label: 'Cut',
        }),
        copy: ({ paths }) => ({
          accelerator: 'CmdOrCtrl+C',
          click: () => copy(paths),
          enabled: paths.length > 0,
          label: 'Copy',
        }),
        paste: ({ path }) => ({
          accelerator: 'CmdOrCtrl+V',
          click: () => paste(path),
          enabled: !!path && canPaste(),
          label: 'Paste',
        }),
        separator: () => defaultActions.separator,
      }

      const actions = params.options.flatMap((option) => {
        const creator = actionCreators[option.type]
        return creator ? creator(option.data) : []
      })

      const template = [
        ...actions,
        defaultActions.separator,
        defaultActions.search,
        defaultActions.cut,
        defaultActions.copy,
        defaultActions.paste,
        defaultActions.separator,
        defaultActions.inspectElement,
      ].filter((a) => a) as MenuItemConstructorOptions[]

      const menu = Menu.buildFromTemplate(template)
      const window = BrowserWindow.fromWebContents(event.sender)
      window && menu.popup({ window, x: params.x, y: params.y })
    },
  )
}

export default registerContextMenu
