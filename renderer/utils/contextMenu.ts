import { MouseEvent } from 'react'

type ContextMenu =
  | {
      id: string
      path?: string
    }
  | { type: string }

export const contextMenuProps = (contextMenus: ContextMenu[]) => {
  return {
    'data-context-menus': JSON.stringify(contextMenus),
  }
}

export const entryContextMenuProps = (
  path: string,
  directory: boolean,
  favorite: boolean
) => {
  return contextMenuProps([
    {
      id: directory ? 'openDirectory' : 'open',
      path,
    },
    {
      id: 'revealInFinder',
      path,
    },
    { type: 'separator' },
    {
      id: 'copyPath',
      path,
    },
    { type: 'separator' },
    ...(directory
      ? [
          {
            id: favorite ? 'removeFromFavorites' : 'addToFavorites',
            path,
          },
        ]
      : []),
    { type: 'separator' },
    {
      id: 'moveToTrash',
      path,
    },
  ])
}

export const directoryContextMenuProps = (path: string) => {
  return contextMenuProps([
    {
      id: 'newFolder',
      path,
    },
    { type: 'separator' },
  ])
}

const getContextMenus = (e: HTMLElement): string | undefined => {
  const params = e.dataset.contextMenus
  if (params) {
    return JSON.parse(params)
  }
  const parent = e.parentElement
  return parent ? getContextMenus(parent) : undefined
}

export const openContextMenu = async (e: MouseEvent<HTMLElement>) => {
  const params = getContextMenus(e.target as HTMLElement)
  await window.electronAPI.contextMenu.send(params)
}

export const openCM = () => {
  // TODO: Fix this
  const contextMenuEvent = new window.MouseEvent('contextmenu', {
    bubbles: true,
    cancelable: true,
    view: window,
  })
  window.dispatchEvent(contextMenuEvent)
  console.log('openCM')
}
