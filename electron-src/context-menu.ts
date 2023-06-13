import {
  IpcMainInvokeEvent,
  MenuItemConstructorOptions,
  clipboard,
  ipcMain,
  shell,
} from 'electron'
import contextMenu from 'electron-context-menu'

type ContextMenuItem = {
  id: string
  enabled: boolean
  path: string
}

type ContextMenu = ContextMenuItem | { type: string }

// @see https://github.com/sindresorhus/electron-context-menu/issues/102#issuecomment-735434790
const registerContextMenu = () => {
  let contextMenus: ContextMenu[]

  contextMenu({
    prepend: (_defaultActions, parameters, browserWindow) => {
      const send = (channel: string, ...args: unknown[]) => {
        const webContents =
          'webContents' in browserWindow
            ? browserWindow.webContents
            : browserWindow
        webContents.send(channel, ...args)
      }

      const actions: {
        [id in string]: (params: ContextMenuItem) => MenuItemConstructorOptions
      } = {
        open: (params) => ({
          click: () => shell.openPath(params.path),
          label: 'Open',
        }),
        openDirectory: (params) => ({
          click: () => send('subscription-entry', params.path, 'move'),
          label: 'Open',
        }),
        revealInFinder: (params) => ({
          click: () => shell.showItemInFolder(params.path),
          label: 'Reveal in Finder',
        }),
        newFolder: (params) => ({
          click: async () =>
            send('subscription-entry', params.path, 'newFolder'),
          label: 'New Folder',
        }),
        copyPath: (params) => ({
          click: () => clipboard.writeText(params.path),
          label: 'Copy Path',
        }),
        moveToTrash: (params) => ({
          click: async () =>
            send('subscription-entry', params.path, 'moveToTrash'),
          label: 'Move to Trash',
        }),
        addToFavorites: (params) => ({
          click: () =>
            send('subscription-entry', params.path, 'addToFavorites'),
          label: 'Add to Favorites',
        }),
        removeFromFavorites: (params) => ({
          click: () =>
            send('subscription-entry', params.path, 'removeFromFavorites'),
          label: 'Remove from Favorites',
        }),
      }

      return [
        {
          accelerator: 'CommandOrControl+F',
          click: () => send('subscription-search'),
          label: 'Search for “{selection}”',
          visible: parameters.selectionText.trim().length > 0,
        },
        { type: 'separator' },
        ...contextMenus.flatMap((params) => {
          if ('type' in params) {
            return params
          }
          const creator = actions[params.id]
          return creator ? { ...params, ...creator(params) } : []
        }),
      ] as MenuItemConstructorOptions[]
    },
  })

  ipcMain.handle(
    'context-menu-send',
    (_event: IpcMainInvokeEvent, targetContextMenus?: ContextMenu[]) => {
      contextMenus = targetContextMenus ?? []
    }
  )
}

export default registerContextMenu
