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
export type ContextMenuOption =
  | {
      id: string
      path?: string
    }
  | { type: string }

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

      const actionCreators: {
        [id in string]: (option: {
          id: string
          path?: string
        }) => MenuItemConstructorOptions
      } = {
        open: (option) => ({
          click: () => shell.openPath(option.path ?? ''),
          label: 'Open',
        }),
        openDirectory: (option) => ({
          click: () => send('subscription-entry', option.path, 'move'),
          label: 'Open',
        }),
        revealInFinder: (option) => ({
          click: () => shell.showItemInFolder(option.path ?? ''),
          label: 'Reveal in Finder',
        }),
        newFolder: (option) => ({
          click: async () =>
            send('subscription-entry', option.path, 'newFolder'),
          label: 'New Folder',
        }),
        copyPath: (option) => ({
          click: () => clipboard.writeText(option.path ?? ''),
          label: 'Copy Path',
        }),
        moveToTrash: (option) => ({
          click: async () =>
            send('subscription-entry', option.path, 'moveToTrash'),
          label: 'Move to Trash',
        }),
        addToFavorites: (option) => ({
          click: () =>
            send('subscription-entry', option.path, 'addToFavorites'),
          label: 'Add to Favorites',
        }),
        removeFromFavorites: (option) => ({
          click: () =>
            send('subscription-entry', option.path, 'removeFromFavorites'),
          label: 'Remove from Favorites',
        }),
        settings: () => ({
          click: () => send('subscription-settings'),
          label: 'Settings',
        }),
      }

      const actions = options.flatMap((option) => {
        if ('type' in option) {
          return option
        }
        const creator = actionCreators[option.id]
        return creator ? creator(option) : []
      })

      const defaultActions = {
        separator: { type: 'separator' },
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
