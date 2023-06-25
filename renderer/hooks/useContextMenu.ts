import { MouseEvent } from 'react'

import { ContextMenuOption } from 'interfaces'
import { useAppSelector } from 'store'
import { selectIsFavorite } from 'store/favorite'
import {
  selectCurrentDirectory,
  selectCurrentSortOption,
  selectIsSidebarHidden,
  selectSelected,
  selectViewMode,
} from 'store/window'

const createMenuHandler = (options?: ContextMenuOption[]) => {
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

    await window.electronAPI.showContextMenu(params, options ?? [])
  }
}

export const useContextMenu = () => {
  const currentDirectory = useAppSelector(selectCurrentDirectory)
  const currentSortOption = useAppSelector(selectCurrentSortOption)
  const isFavorite = useAppSelector(selectIsFavorite)
  const isSidebarHidden = useAppSelector(selectIsSidebarHidden)
  const selected = useAppSelector(selectSelected)
  const viewMode = useAppSelector(selectViewMode)

  const createDefaultMenuHandler = () => createMenuHandler()

  const createEntryMenuHandler = (path: string, directory: boolean) =>
    createMenuHandler([
      {
        id: directory ? 'openDirectory' : 'open',
        params: { path },
      },
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
        params: { path },
      },
    ])

  const createContentMenuHandler = (path: string, directory: boolean) => {
    const paths = selected.includes(path) ? selected : [path]
    return createMenuHandler([
      ...(paths.length === 1
        ? [
            {
              id: directory ? 'openDirectory' : 'open',
              params: { path },
            },
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
          ]
        : []),
      { id: 'separator' },
      {
        id: 'moveToTrash',
        params: { paths },
      },
    ])
  }

  const createMoreMenuHandler = () =>
    createMenuHandler([
      { id: 'newFolder', params: { path: currentDirectory } },
      { id: 'revealInFinder', params: { path: currentDirectory } },
      { id: 'separator' },
      { id: 'asList', params: { checked: viewMode === 'list' } },
      { id: 'asThumbnail', params: { checked: viewMode === 'thumbnail' } },
      { id: 'separator' },
      { id: 'toggleNavigator', params: { hidden: isSidebarHidden('primary') } },
      {
        id: 'toggleInspector',
        params: { hidden: isSidebarHidden('secondary') },
      },
      { id: 'separator' },
      {
        id: 'sortBy',
        params: { orderBy: currentSortOption.orderBy },
      },
      { id: 'settings' },
    ])

  return {
    createContentMenuHandler,
    createDefaultMenuHandler,
    createEntryMenuHandler,
    createMoreMenuHandler,
  }
}
