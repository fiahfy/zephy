import {
  IpcMainInvokeEvent,
  MenuItemConstructorOptions,
  ipcMain,
  shell,
} from 'electron'
import contextMenu from 'electron-context-menu'

type CustomContextMenu = {
  id: string
  enabled: boolean
  path: string
}

type ContextMenu = CustomContextMenu | { type: string }

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
        [id in string]: (
          params: CustomContextMenu
        ) => MenuItemConstructorOptions
      } = {
        startPresentation: (params) => ({
          accelerator: 'Enter',
          click: () => send('start-presentation', params.path),
          enabled: params.enabled,
          label: 'Start Presentation',
        }),
        addFavorite: (params) => ({
          click: () => send('add-favorite', params.path),
          enabled: params.enabled,
          label: 'Add to Favorites',
        }),
        removeFavorite: (params) => ({
          click: () => send('remove-favorite', params.path),
          enabled: params.enabled,
          label: 'Remove from Favorites',
        }),
        open: (params) => ({
          click: () => shell.openPath(params.path),
          enabled: params.enabled,
          label: 'Open',
        }),
      }

      return [
        {
          accelerator: 'CommandOrControl+F',
          click: () => send('search'),
          label: 'Search for “{selection}”',
          visible: parameters.selectionText.trim().length > 0,
        },
        ...contextMenus.flatMap((params) => {
          if ('type' in params) {
            return params
          }
          const creator = actions[params.id]
          return creator ? creator(params) : []
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
