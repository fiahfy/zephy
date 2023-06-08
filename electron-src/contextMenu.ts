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
  params?: any // eslint-disable-line @typescript-eslint/no-explicit-any
}

const registerContextMenu = (
  createWindow: (params?: { directory?: string }) => void
) => {
  ipcMain.handle(
    'context-menu-show',
    (
      event: IpcMainInvokeEvent,
      params: ContextMenuParams,
      options: ContextMenuOption[]
    ) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const send = (message: any) =>
        event.sender.send('context-menu-send', message)

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
          click: () => send({ type: 'search' }),
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
            send({ type: 'changeDirectory', data: { path: params.path } }),
          label: 'Open',
        }),
        openDirectoryInNewWindow: ({ params }) => ({
          click: () => createWindow({ directory: params.path }),
          label: 'Open in New Window',
        }),
        revealInFinder: ({ params }) => ({
          click: () => shell.showItemInFolder(params.path),
          label: 'Reveal in Finder',
        }),
        newFolder: ({ params }) => ({
          click: () => send({ type: 'newFolder', data: { path: params.path } }),
          label: 'New Folder',
        }),
        copyPath: ({ params }) => ({
          click: () => clipboard.writeText(params.path),
          label: 'Copy Path',
        }),
        rename: ({ params }) => ({
          click: () => send({ type: 'rename', data: { path: params.path } }),
          label: 'Rename...',
        }),
        moveToTrash: ({ params }) => ({
          click: () =>
            send({ type: 'moveToTrash', data: { paths: params.paths } }),
          label: 'Move to Trash',
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
        settings: () => ({
          click: () => send({ type: 'goToSettings' }),
          label: 'Settings',
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
