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
  value?: any
}

const registerContextMenu = () => {
  ipcMain.handle(
    'context-menu-show',
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
          click: () => send('subscription-search'),
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
        open: (option) => ({
          click: () => shell.openPath(option.value),
          label: 'Open',
        }),
        openDirectory: (option) => ({
          click: () => send('subscription-entry', option.value, 'move'),
          label: 'Open',
        }),
        revealInFinder: (option) => ({
          click: () => shell.showItemInFolder(option.value),
          label: 'Reveal in Finder',
        }),
        newFolder: (option) => ({
          click: async () =>
            send('subscription-entry', option.value, 'newFolder'),
          label: 'New Folder',
        }),
        copyPath: (option) => ({
          click: () => clipboard.writeText(option.value),
          label: 'Copy Path',
        }),
        moveToTrash: (option) => ({
          click: async () =>
            send('subscription-entry', option.value, 'moveToTrash'),
          label: 'Move to Trash',
        }),
        toggleFavorite: (option) => ({
          click: () =>
            send(
              'subscription-entry',
              option.value.path,
              option.value.favorite ? 'removeFromFavorites' : 'addToFavorites'
            ),
          label: option.value.favorite
            ? 'Remove from Favorites'
            : 'Add to Favorites',
        }),
        settings: () => ({
          click: () => send('subscription-settings'),
          label: 'Settings',
        }),
        sortBy: (option) => ({
          label: 'Sort By',
          submenu: [
            { label: 'Name', key: 'name' },
            { label: 'Date Last Opened', key: 'dateLastOpened' },
            { label: 'Date Modified', key: 'dateModified' },
            { label: 'Date Created', key: 'dateCreated' },
            { label: 'Size', key: 'size' },
            { label: 'Rating', key: 'rating' },
          ].map((menu) => ({
            ...menu,
            checked: menu.key === option.value,
            click: () => send('subscription-sort', menu.key),
            type: 'checkbox',
          })),
        }),
        asList: (option) => ({
          label: 'as List',
          checked: option.value,
          click: () => send('subscription-view-mode', 'list'),
          type: 'checkbox',
        }),
        asThumbnail: (option) => ({
          label: 'as Thumbnail',
          checked: option.value,
          click: () => send('subscription-view-mode', 'thumbnail'),
          type: 'checkbox',
        }),
        toggleNavigator: (option) => ({
          label: option.value ? 'Show Navigator' : 'Hide Navigator',
          click: () =>
            send('subscription-sidebar-hidden', 'primary', !option.value),
        }),
        toggleInspector: (option) => ({
          label: option.value ? 'Show Inspector' : 'Hide Inspector',
          click: () =>
            send('subscription-inspector-hidden', 'secondary', !option.value),
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
