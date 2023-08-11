import {
  BrowserWindow,
  IpcMainInvokeEvent,
  Menu,
  MenuItemConstructorOptions,
  clipboard,
  ipcMain,
  shell,
} from 'electron'
import { basename } from 'path'
import { canPaste, copy, paste } from './utils/clipboard'

export type ContextMenuParams = {
  isEditable: boolean
  selectionText: string
  x: number
  y: number
}
export type ContextMenuOption = {
  id: string
  params?: any // eslint-disable-line @typescript-eslint/no-explicit-any
}

const registerContextMenu = (
  createWindow: (params?: { directory?: string }) => void,
) => {
  ipcMain.handle(
    'context-menu-show',
    (
      event: IpcMainInvokeEvent,
      params: ContextMenuParams,
      options: ContextMenuOption[],
    ) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const send = (message: any) => event.sender.send('message-send', message)

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
        [id in string]: (
          option: ContextMenuOption,
        ) => MenuItemConstructorOptions
      } = {
        copyPath: ({ params }) => ({
          click: () => clipboard.writeText(params.path),
          label: 'Copy Path',
        }),
        go: ({ params }) => ({
          click: () => send({ type: 'go', data: { offset: params.offset } }),
          label: basename(params.path),
        }),
        moveToTrash: ({ params }) => ({
          accelerator: 'CmdOrCtrl+Backspace',
          click: () =>
            send({ type: 'moveToTrash', data: { paths: params.paths } }),
          label: 'Move to Trash',
        }),
        newFolder: ({ params }) => ({
          click: () => send({ type: 'newFolder', data: { path: params.path } }),
          label: 'New Folder',
        }),
        open: ({ params }) => ({
          click: () => shell.openPath(params.path),
          label: 'Open',
        }),
        openDirectory: ({ params }) => ({
          click: () =>
            send({ type: 'changeDirectory', data: { path: params.path } }),
          label: 'Open',
        }),
        openDirectoryInNewWindow: ({ params }) => ({
          click: () => createWindow({ directory: params.path }),
          label: 'Open in New Window',
        }),
        rename: ({ params }) => ({
          click: () => send({ type: 'rename', data: { path: params.path } }),
          label: 'Rename...',
        }),
        revealInFinder: ({ params }) => ({
          click: () => shell.showItemInFolder(params.path),
          label: 'Reveal in Finder',
        }),
        settings: () => ({
          accelerator: 'CmdOrCtrl+,',
          click: () => send({ type: 'goToSettings' }),
          label: 'Settings',
        }),
        sortBy: ({ params }) => ({
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
            checked: menu.orderBy === params.orderBy,
            click: () =>
              send({ type: 'sort', data: { orderBy: menu.orderBy } }),
            type: 'checkbox',
          })),
        }),
        toggleFavorite: ({ params }) => ({
          click: () =>
            send({
              type: params.favorite ? 'removeFromFavorites' : 'addToFavorites',
              data: {
                path: params.path,
              },
            }),
          label: params.favorite ? 'Remove from Favorites' : 'Add to Favorites',
        }),
        toggleInspector: ({ params }) => ({
          label: params.hidden ? 'Show Inspector' : 'Hide Inspector',
          click: () =>
            send({
              type: 'changeSidebarHidden',
              data: {
                variant: 'secondary',
                hidden: !params.hidden,
              },
            }),
        }),
        toggleNavigator: ({ params }) => ({
          label: params.hidden ? 'Show Navigator' : 'Hide Navigator',
          click: () =>
            send({
              type: 'changeSidebarHidden',
              data: {
                variant: 'primary',
                hidden: !params.hidden,
              },
            }),
        }),
        view: ({ params }) => ({
          label: 'View',
          submenu: [
            { label: 'as List', viewMode: 'list' },
            { label: 'as Thumbnail', viewMode: 'thumbnail' },
          ].map((menu) => ({
            ...menu,
            checked: menu.viewMode === params.viewMode,
            click: () =>
              send({
                type: 'changeViewMode',
                data: { viewMode: menu.viewMode },
              }),
            type: 'checkbox',
          })),
        }),
        // TODO: Implement
        cut: () => ({
          accelerator: 'CmdOrCtrl+X',
          click: () => undefined,
          enabled: false,
          label: 'Cut',
        }),
        copy: ({ params }) => ({
          accelerator: 'CmdOrCtrl+C',
          click: () => copy(params.paths),
          label: 'Copy',
        }),
        paste: ({ params }) => ({
          accelerator: 'CmdOrCtrl+V',
          click: () => paste(params.path),
          enabled: canPaste(),
          label: 'Paste',
        }),
        separator: () => defaultActions.separator,
      }

      const actions = options.flatMap((option) => {
        const creator = actionCreators[option.id]
        return creator ? creator(option) : []
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
      window && menu.popup({ window })
    },
  )
}

export default registerContextMenu
