import {
  BrowserWindow,
  IpcMainInvokeEvent,
  Menu,
  MenuItemConstructorOptions,
  app,
  ipcMain,
  shell,
} from 'electron'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const send = (message: any) => {
  const activeWindow = BrowserWindow.getFocusedWindow()
  activeWindow?.webContents.send('message-send', message)
}

const registerApplicationMenu = (
  createWindow: (params?: { directory?: string }) => void,
) => {
  const isMac = process.platform === 'darwin'

  // @see https://www.electronjs.org/docs/latest/api/menu#examples
  const template: MenuItemConstructorOptions[] = [
    // { role: 'appMenu' }
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' },
              { type: 'separator' },
              {
                accelerator: 'CmdOrCtrl+,',
                click: () => send({ type: 'goToSettings' }),
                label: 'Preferences...',
              },
              { type: 'separator' },
              { role: 'services' },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideOthers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit' },
            ],
          } as MenuItemConstructorOptions,
        ]
      : []),
    // { role: 'fileMenu' }
    {
      label: 'File',
      submenu: [
        {
          accelerator: 'CmdOrCtrl+N',
          // TODO: open with current directory
          click: () => createWindow({}),
          label: 'New Window',
        },
        ...[isMac ? { role: 'close' } : { role: 'quit' }],
        { type: 'separator' },
        {
          accelerator: 'CmdOrCtrl+Backspace',
          enabled: false,
          id: 'moveToTrash',
          label: 'Move to Trash',
        },
        { type: 'separator' },
        {
          accelerator: 'CmdOrCtrl+F',
          click: () => send({ type: 'find' }),
          label: 'Find',
        },
      ],
    } as MenuItemConstructorOptions,
    // { role: 'editMenu' }
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { id: 'cut', role: 'cut' },
        { id: 'copy', role: 'copy' },
        { id: 'paste', role: 'paste' },
        ...(isMac
          ? [
              { role: 'pasteAndMatchStyle' },
              { role: 'delete' },
              { role: 'selectAll' },
              { type: 'separator' },
              {
                label: 'Speech',
                submenu: [{ role: 'startSpeaking' }, { role: 'stopSpeaking' }],
              },
            ]
          : [{ role: 'delete' }, { type: 'separator' }, { role: 'selectAll' }]),
      ],
    } as MenuItemConstructorOptions,
    // { role: 'viewMenu' }
    {
      label: 'View',
      submenu: [
        {
          accelerator: 'CmdOrCtrl+1',
          click: () =>
            send({ type: 'changeViewMode', data: { viewMode: 'list' } }),
          label: 'as List',
        },
        {
          accelerator: 'CmdOrCtrl+2',
          click: () =>
            send({ type: 'changeViewMode', data: { viewMode: 'thumbnail' } }),
          label: 'as Thumbnail',
        },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    // { role: 'windowMenu' }
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac
          ? [
              { type: 'separator' },
              { role: 'front' },
              { type: 'separator' },
              { role: 'window' },
            ]
          : [{ role: 'close' }]),
      ],
    } as MenuItemConstructorOptions,
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click: () => shell.openExternal('https://github.com/fiahfy/zephy'),
        },
      ],
    },
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  ipcMain.handle(
    'application-menu-set-state',
    (_event: IpcMainInvokeEvent, paths: string[]) => {
      const menu = Menu.getApplicationMenu()
      if (!menu) {
        return
      }

      const itemIds = ['cut', 'copy', 'paste', 'moveToTrash']
      itemIds.forEach((id) => {
        const item = menu.getMenuItemById(id)
        if (!item) {
          return
        }
        switch (id) {
          case 'cut':
            break
          // TODO: Implement
          case 'copy':
            // item.role = paths.length > 0 ? undefined : 'copy'
            // item.click =
            //   paths.length > 0
            //     ? () => send({ type: 'copy', data: { paths } })
            //     : undefined
            break
          case 'paste':
            break
          case 'moveToTrash':
            item.enabled = paths.length > 0
            item.click = () => send({ type: 'moveToTrash', data: { paths } })
            break
        }
      })
    },
  )
}

export default registerApplicationMenu
