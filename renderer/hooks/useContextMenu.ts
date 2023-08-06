import { MouseEvent, useCallback } from 'react'

import { ContextMenuOption, Entry } from 'interfaces'
import { useAppSelector } from 'store'
import { selectIsFavorite } from 'store/favorite'
import {
  selectCurrentDirectory,
  selectCurrentSortOption,
  selectCurrentViewMode,
  selectIsSidebarHidden,
} from 'store/window'

const createMenuHandler = (options?: ContextMenuOption[]) => {
  return async (e: MouseEvent) => {
    e.preventDefault()

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
  const currentDirectory = useAppSelector(selectCurrentDirectory)
  const currentSortOption = useAppSelector(selectCurrentSortOption)
  const currentViewMode = useAppSelector(selectCurrentViewMode)
  const isFavorite = useAppSelector(selectIsFavorite)
  const isSidebarHidden = useAppSelector(selectIsSidebarHidden)

  const createEntryMenuHandler = useCallback(
    (entry: Entry) => {
      const directory = entry.type === 'directory'
      const path = entry.path
      return createMenuHandler([
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
          params: { paths: [path] },
        },
      ])
    },
    [isFavorite],
  )

  const createContentMenuHandler = useCallback(
    (entry: Entry, selectedEntries: Entry[]) => {
      const directory = entry.type === 'directory'
      const path = entry.path
      const selectedPaths = selectedEntries.map((e) => e.path)
      const paths = selectedPaths.includes(path) ? selectedPaths : [path]
      return createMenuHandler([
        ...(paths.length === 1
          ? [
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
                id: 'rename',
                params: { path },
              },
            ]
          : []),
        {
          id: 'moveToTrash',
          params: { paths },
        },
      ])
    },
    [isFavorite],
  )

  const createCurrentDirectoryMenuHandler = useCallback(
    () =>
      createMenuHandler([
        { id: 'newFolder', params: { path: currentDirectory } },
        { id: 'separator' },
        { id: 'view', params: { viewMode: currentViewMode } },
        { id: 'separator' },
        {
          id: 'sortBy',
          params: { orderBy: currentSortOption.orderBy },
        },
      ]),
    [currentDirectory, currentSortOption.orderBy, currentViewMode],
  )

  const createMoreMenuHandler = useCallback(
    () =>
      createMenuHandler([
        { id: 'newFolder', params: { path: currentDirectory } },
        { id: 'separator' },
        { id: 'view', params: { viewMode: currentViewMode } },
        { id: 'separator' },
        {
          id: 'sortBy',
          params: { orderBy: currentSortOption.orderBy },
        },
        { id: 'separator' },
        {
          id: 'toggleNavigator',
          params: { hidden: isSidebarHidden('primary') },
        },
        {
          id: 'toggleInspector',
          params: { hidden: isSidebarHidden('secondary') },
        },
        { id: 'separator' },
        { id: 'settings' },
      ]),
    [
      currentDirectory,
      currentSortOption.orderBy,
      currentViewMode,
      isSidebarHidden,
    ],
  )

  return {
    createContentMenuHandler,
    createCurrentDirectoryMenuHandler,
    createEntryMenuHandler,
    createMenuHandler,
    createMoreMenuHandler,
  }
}

export default useContextMenu
