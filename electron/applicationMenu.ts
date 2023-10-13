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
  canBack: boolean
  canForward: boolean
  inspectorHidden: boolean
  isEditable: boolean
  navigatorHidden: boolean
  orderBy:
    | 'name'
    | 'dateLastOpened'
    | 'dateModified'
    | 'dateCreated'
    | 'size'
    | 'rating'
  viewMode: 'list' | 'thumbnail'
}

export type ApplicationMenuParams = Partial<State>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const send = (message: any) => {
  const activeWindow = BrowserWindow.getFocusedWindow()
  activeWindow?.webContents.send('message-send', message)
}

const registerApplicationMenu = (createWindow: () => void) => {
  const isMac = process.platform === 'darwin'

  let state: State = {
    canBack: false,
    canForward: false,
    inspectorHidden: false,
    isEditable: false,
    navigatorHidden: false,
    orderBy: 'name',
    viewMode: 'list',
  }

  const update = () => {
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
            click: () => createWindow(),
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

          ...(state.isEditable
            ? [
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'selectAll' },
              ]
            : [
                // TODO: implement
                {
                  accelerator: 'CmdOrCtrl+X',
                  click: () => undefined,
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
                {
                  accelerator: 'CmdOrCtrl+A',
                  click: () => send({ type: 'selectAll' }),
                  label: 'Select All',
                },
              ]),
        ],
      } as MenuItemConstructorOptions,
      // { role: 'viewMenu' }
      {
        label: 'View',
        submenu: [
          ...[
            {
              accelerator: 'CmdOrCtrl+1',
              label: 'as List',
              viewMode: 'list',
            },
            {
              accelerator: 'CmdOrCtrl+2',
              label: 'as Thumbnail',
              viewMode: 'thumbnail',
            },
          ].map((menu) => ({
            ...menu,
            checked: menu.viewMode === state.viewMode,
            click: () =>
              send({
                type: 'changeViewMode',
                data: { viewMode: menu.viewMode },
              }),
            type: 'checkbox',
          })),
          { type: 'separator' },
          {
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
              checked: menu.orderBy === state.orderBy,
              click: () =>
                send({ type: 'sort', data: { orderBy: menu.orderBy } }),
              type: 'checkbox',
            })),
          },
          { type: 'separator' },
          {
            label: state.navigatorHidden ? 'Show Navigator' : 'Hide Navigator',
            click: () =>
              send({
                type: 'changeSidebarHidden',
                data: {
                  variant: 'primary',
                  hidden: !state.navigatorHidden,
                },
              }),
          },
          {
            label: state.inspectorHidden ? 'Show Inspector' : 'Hide Inspector',
            click: () =>
              send({
                type: 'changeSidebarHidden',
                data: {
                  variant: 'secondary',
                  hidden: !state.inspectorHidden,
                },
              }),
          },
          { type: 'separator' },
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'togglefullscreen' },
        ],
      } as MenuItemConstructorOptions,
      {
        label: 'Go',
        submenu: [
          {
            accelerator: 'CmdOrCtrl+[',
            click: () => send({ type: 'back' }),
            enabled: state.canBack,
            label: 'Back',
          },
          {
            accelerator: 'CmdOrCtrl+]',
            click: () => send({ type: 'forward' }),
            enabled: state.canForward,
            label: 'Forward',
          },
        ],
      } as MenuItemConstructorOptions,
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

  update()

  ipcMain.handle(
    'application-menu-update',
    (_event: IpcMainInvokeEvent, params: ApplicationMenuParams) => {
      state = { ...state, ...params }
      update()
    },
  )
}

export default registerApplicationMenu
