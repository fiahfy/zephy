import { MouseEvent } from 'react'

type ContextMenu =
  | {
      id: string
      enabled: boolean
      path: string
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
      enabled: true,
      path,
    },
    {
      id: 'revealInFinder',
      enabled: true,
      path,
    },
    { type: 'separator' },
    {
      id: 'copyPath',
      enabled: true,
      path,
    },
    { type: 'separator' },
    ...(directory
      ? [
          {
            id: favorite ? 'removeFromFavorites' : 'addToFavorites',
            enabled: true,
            path,
          },
        ]
      : []),
    { type: 'separator' },
    {
      id: 'moveToTrash',
      enabled: true,
      path,
    },
  ])
}

export const directoryContextMenuProps = (path: string) => {
  return contextMenuProps([
    {
      id: 'newFolder',
      enabled: true,
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

export const openContextMenu = async (e: MouseEvent<HTMLDivElement>) => {
  const params = getContextMenus(e.target as HTMLElement)
  await window.electronAPI.contextMenu.send(params)
}
