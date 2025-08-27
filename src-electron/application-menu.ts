import {
  app,
  BrowserWindow,
  type IpcMainEvent,
  ipcMain,
  Menu,
  type MenuItemConstructorOptions,
  shell,
} from 'electron'

type State = {
  canBack: boolean
  canCloseTab: boolean
  canForward: boolean
  inspectorHidden: boolean
  navigatorHidden: boolean
  orderBy:
    | 'dateCreated'
    | 'dateLastOpened'
    | 'dateModified'
    | 'name'
    | 'score'
    | 'size'
  viewMode: 'gallery' | 'list' | 'thumbnail'
}

export type ApplicationMenuParams = Partial<State>

const isEditType = (
  type: string,
): type is 'copy' | 'cut' | 'paste' | 'selectAll' =>
  ['copy', 'cut', 'paste', 'selectAll'].includes(type)

// biome-ignore lint/suspicious/noExplicitAny: false positive
const send = (message: { type: string; data?: any }) => {
  const activeWindow = BrowserWindow.getFocusedWindow()
  if (!activeWindow) {
    return
  }

  const type = message.type
  if (isEditType(type) && activeWindow.webContents.isDevToolsFocused()) {
    activeWindow.webContents.devToolsWebContents?.[type]()
    return
  }

  activeWindow.webContents.send('onMessage', message)
}

const registerApplicationMenu = (
  createWindow: (directoryPath?: string) => void,
) => {
  const isMac = process.platform === 'darwin'

  let state: State = {
    canBack: false,
    canCloseTab: false,
    canForward: false,
    inspectorHidden: false,
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
          {
            accelerator: 'CmdOrCtrl+t',
            click: () =>
              send({ type: 'newTab', data: { path: app.getPath('home') } }),
            label: 'New Tab',
          },
          ...[
            isMac
              ? {
                  accelerator: 'CmdOrCtrl+Shift+w',
                  role: 'close',
                }
              : { role: 'quit' },
          ],
          {
            accelerator: 'CmdOrCtrl+w',
            click: () => send({ type: 'closeTab' }),
            enabled: state.canCloseTab,
            label: 'Close Tab',
          },
          { type: 'separator' },
          {
            accelerator: 'CmdOrCtrl+O',
            click: () => send({ type: 'open' }),
            label: 'Open',
          },
          {
            click: () => send({ type: 'rename' }),
            label: 'Rename',
          },
          {
            accelerator: 'CmdOrCtrl+Backspace',
            click: () => send({ type: 'moveToTrash' }),
            label: 'Move to Trash',
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
          {
            accelerator: 'CmdOrCtrl+X',
            click: () => send({ type: 'cut' }),
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
          { type: 'separator' },
          {
            accelerator: 'CmdOrCtrl+F',
            click: () => send({ type: 'find' }),
            label: 'Find',
          },
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
            {
              accelerator: 'CmdOrCtrl+3',
              label: 'as Gallery',
              viewMode: 'gallery',
            },
          ].map((menu) => ({
            ...menu,
            checked: menu.viewMode === state.viewMode,
            click: () =>
              send({
                type: 'changeViewMode',
                data: { viewMode: menu.viewMode },
              }),
            type: 'radio',
          })),
          { type: 'separator' },
          {
            label: 'Sort By',
            submenu: [
              { label: 'Name', orderBy: 'name' },
              { label: 'Date Created', orderBy: 'dateCreated' },
              { label: 'Date Modified', orderBy: 'dateModified' },
              { label: 'Date Last Opened', orderBy: 'dateLastOpened' },
              { label: 'Size', orderBy: 'size' },
              { label: 'Rating', orderBy: 'score' },
            ].map((menu) => ({
              ...menu,
              checked: menu.orderBy === state.orderBy,
              click: () =>
                send({ type: 'sort', data: { orderBy: menu.orderBy } }),
              type: 'radio',
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
          {
            accelerator: 'CmdOrCtrl+R',
            label: 'Refresh',
            click: () => send({ type: 'refresh' }),
          },
          { type: 'separator' },
          // { role: 'reload' },
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

  ipcMain.on(
    'update',
    (_event: IpcMainEvent, params: ApplicationMenuParams) => {
      state = { ...state, ...params }
      update()
    },
  )
}

export default registerApplicationMenu
