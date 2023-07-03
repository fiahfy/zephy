import {
  BrowserWindow,
  IpcMainInvokeEvent,
  Menu,
  MenuItemConstructorOptions,
  clipboard,
  ipcMain,
  shell,
} from 'electron'

export type ContextMenuParams = {
  isEditable: boolean
  selectionText: string
  x: number
  y: number
}
export type ContextMenuOption = {
  id: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: any
}

const registerContextMenu = (
  createWindow: (params?: { path: string }) => void
) => {
  ipcMain.handle(
    'show-context-menu',
    (
      event: IpcMainInvokeEvent,
      params: ContextMenuParams,
      options: ContextMenuOption[]
    ) => {
      const send = (channel: string, ...args: unknown[]) =>
        event.sender.send(channel, ...args)

      const defaultActions = {
        separator: { type: 'separator' as const },
        cut: params.isEditable && { role: 'cut' },
        copy: (params.isEditable || params.selectionText.length > 0) && {
          role: 'copy',
        },
        paste: params.isEditable && {
          role: 'paste',
          visible: params.isEditable,
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
        search: {
          accelerator: 'CommandOrControl+F',
          click: () => send('subscribe', 'search'),
          label: `Search for “${params.selectionText.trim()}”`,
          visible: params.selectionText.trim().length > 0,
        },
      }

      const actionCreators: {
        [id in string]: (
          option: ContextMenuOption
        ) => MenuItemConstructorOptions
      } = {
        separator: () => defaultActions.separator,
        open: ({ params }) => ({
          click: () => shell.openPath(params.path),
          label: 'Open',
        }),
        openDirectory: ({ params }) => ({
          click: () =>
            send('subscribe', 'changeDirectory', { path: params.path }),
          label: 'Open',
        }),
        openDirectoryInNewWindow: ({ params }) => ({
          click: () => createWindow({ path: params.path }),
          label: 'Open in New Window',
        }),
        revealInFinder: ({ params }) => ({
          click: () => shell.showItemInFolder(params.path),
          label: 'Reveal in Finder',
        }),
        newFolder: ({ params }) => ({
          click: () => send('subscribe', 'newFolder', { path: params.path }),
          label: 'New Folder',
        }),
        copyPath: ({ params }) => ({
          click: () => clipboard.writeText(params.path),
          label: 'Copy Path',
        }),
        rename: ({ params }) => ({
          click: () => send('subscribe', 'rename', { path: params.path }),
          label: 'Rename...',
        }),
        moveToTrash: ({ params }) => ({
          click: () =>
            send('subscribe', 'moveToTrash', { paths: params.paths }),
          label: 'Move to Trash',
        }),
        toggleFavorite: ({ params }) => ({
          click: () =>
            send(
              'subscribe',
              params.favorite ? 'removeFromFavorites' : 'addToFavorites',
              { path: params.path }
            ),
          label: params.favorite ? 'Remove from Favorites' : 'Add to Favorites',
        }),
        settings: () => ({
          click: () => send('subscribe', 'goToSettings'),
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
            click: () => send('subscribe', 'sort', { orderBy: menu.orderBy }),
            type: 'checkbox',
          })),
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
              send('subscribe', 'changeViewMode', { viewMode: menu.viewMode }),
            type: 'checkbox',
          })),
        }),
        toggleNavigator: ({ params }) => ({
          label: params.hidden ? 'Show Navigator' : 'Hide Navigator',
          click: () =>
            send('subscribe', 'changeSidebarHidden', {
              variant: 'primary',
              hidden: !params.hidden,
            }),
        }),
        toggleInspector: ({ params }) => ({
          label: params.hidden ? 'Show Inspector' : 'Hide Inspector',
          click: () =>
            send('subscribe', 'changeSidebarHidden', {
              variant: 'secondary',
              hidden: !params.hidden,
            }),
        }),
      }

      const actions = options.flatMap((option) => {
        const creator = actionCreators[option.id]
        return creator ? creator(option) : []
      })

      const template = [
        defaultActions.search,
        defaultActions.separator,
        ...actions,
        defaultActions.separator,
        defaultActions.cut,
        defaultActions.copy,
        defaultActions.paste,
        defaultActions.separator,
        defaultActions.inspectElement,
      ].filter((a) => a) as MenuItemConstructorOptions[]

      const menu = Menu.buildFromTemplate(template)
      const window = BrowserWindow.fromWebContents(event.sender)
      window && menu.popup({ window })
    }
  )
}

export default registerContextMenu
