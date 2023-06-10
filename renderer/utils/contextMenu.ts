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
