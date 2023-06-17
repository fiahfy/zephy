import { MouseEvent } from 'react'
import { ContextMenuOption } from 'interfaces'

export const openContextMenu = (options?: ContextMenuOption[]) => {
  return async (e: MouseEvent<HTMLElement>) => {
    e.preventDefault()

    const isEditable =
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement
        ? !e.target.readOnly
        : false
    const selectionText = window.getSelection()?.toString() ?? ''
    const { clientX: x, clientY: y } = e

    const params = { isEditable, selectionText, x, y }

    console.log(params)

    await window.electronAPI.contextMenu.show(params, options ?? [])
  }
}

export const openEntryContextMenu = (
  path: string,
  directory: boolean,
  favorite: boolean
) => {
  const options = [
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
  ]

  return openContextMenu(options)
}

export const openDirectoryContextMenu = (path: string) => {
  const options = [
    {
      id: 'newFolder',
      path,
    },
    { type: 'separator' },
  ]

  return openContextMenu(options)
}
