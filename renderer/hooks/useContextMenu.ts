import { MouseEvent, useCallback } from 'react'
import { ContextMenuOption, Entry } from '~/interfaces'
import { useAppSelector } from '~/store'
import { selectIsFavorite } from '~/store/favorite'

const createMenuHandler = (options?: ContextMenuOption[]) => {
  return async (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const isEditable =
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement
        ? !e.target.readOnly
        : false
    const selectionText = window.getSelection()?.toString() ?? ''
    const { clientX: x, clientY: y } = e

    const params = { isEditable, selectionText, x, y }

    await window.electronAPI.contextMenu.show(params, options ?? [])
  }
}

const useContextMenu = () => {
  const isFavorite = useAppSelector(selectIsFavorite)

  const createEntryMenuHandler = useCallback(
    (entry: Entry) => {
      const directory = entry.type === 'directory'
      const path = entry.path
      return createMenuHandler([
        {
          id: directory ? 'openDirectory' : 'open',
          params: { path },
        },
        ...(directory
          ? [
              {
                id: 'openDirectoryInNewWindow',
                params: { path },
              },
            ]
          : []),
        {
          id: 'revealInFinder',
          params: { path },
        },
        { id: 'separator' },
        {
          id: 'copyPath',
          params: { path },
        },
        { id: 'separator' },
        ...(directory
          ? [
              {
                id: 'toggleFavorite',
                params: { path, favorite: isFavorite(path) },
              },
            ]
          : []),
        { id: 'separator' },
        {
          id: 'moveToTrash',
          params: { paths: [path] },
        },
      ])
    },
    [isFavorite],
  )

  return {
    createMenuHandler,
    createEntryMenuHandler,
  }
}

export default useContextMenu
