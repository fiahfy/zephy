import {
  BrowserWindow,
  IpcMainInvokeEvent,
  Menu,
  MenuItemConstructorOptions,
  app,
  ipcMain,
  shell,
} from 'electron'

type State = {
  focused: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const send = (message: any) => {
  const activeWindow = BrowserWindow.getFocusedWindow()
  activeWindow?.webContents.send('message-send', message)
}

const registerApplicationMenu = () => {
  const isMac = process.platform === 'darwin'

  let state: State = {
    focused: false,
  }

  const updateMenu = (state: State) => {
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
            click: () => send({ type: 'newWindow' }),
            label: 'New Window',
          },
          ...[isMac ? { role: 'close' } : { role: 'quit' }],
          { type: 'separator' },
          {
            accelerator: 'CmdOrCtrl+Backspace',
            click: () => send({ type: 'moveToTrash' }),
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

          ...(state.focused
            ? [
                {
                  accelerator: 'CmdOrCtrl+X',
                  enabled: false,
                  label: 'Cut',
                },
                {
                  accelerator: 'CmdOrCtrl+C',
                  click: () => send({ type: 'copy' }),
                  label: 'Copy',
                },
                {
                  accelerator: 'CmdOrCtrl+V',
                  click: () => send({ type: 'paste' }),
                  label: 'Paste',
                },
              ]
            : [{ role: 'cut' }, { role: 'copy' }, { role: 'paste' }]),
          ...(isMac
            ? [
                { role: 'pasteAndMatchStyle' },
                { role: 'delete' },
                { role: 'selectAll' },
                { type: 'separator' },
                {
                  label: 'Speech',
                  submenu: [
                    { role: 'startSpeaking' },
                    { role: 'stopSpeaking' },
                  ],
                },
              ]
            : [
                { role: 'delete' },
                { type: 'separator' },
                { role: 'selectAll' },
              ]),
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
  }

  updateMenu(state)

  ipcMain.handle(
    'application-menu-set-state',
    (_event: IpcMainInvokeEvent, newState: State) => {
      state = { ...state, ...newState }
      updateMenu(state)
    },
  )
}

export default registerApplicationMenu
