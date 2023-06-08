import {
  BrowserWindow,
  Menu,
  MenuItemConstructorOptions,
  app,
  shell,
} from 'electron'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const send = (message: any) => {
  const activeWindow = BrowserWindow.getFocusedWindow()
  activeWindow?.webContents.send('application-menu-send', message)
}

const registerApplicationMenu = (
  createWindow: (params?: { directory?: string }) => void
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
                label: 'Preferences...',
                accelerator: 'CmdOrCtrl+,',
                click: () => send({ type: 'goToSettings' }),
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
          label: 'New Window',
          accelerator: 'CmdOrCtrl+N',
          click: () => createWindow({}),
        },
        ...[isMac ? { role: 'close' } : { role: 'quit' }],
        { type: 'separator' },
        // TODO: apply window state
        {
          label: 'Move to Trash',
          accelerator: 'CmdOrCtrl+Backspace',
          click: () => send({ type: 'moveToTrash' }),
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
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
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
          label: 'as List',
          accelerator: 'CmdOrCtrl+1',
          click: () =>
            send({ type: 'changeViewMode', data: { viewMode: 'list' } }),
        },
        {
          label: 'as Thumbnail',
          accelerator: 'CmdOrCtrl+2',
          click: () =>
            send({ type: 'changeViewMode', data: { viewMode: 'thumbnail' } }),
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
}

export default registerApplicationMenu
