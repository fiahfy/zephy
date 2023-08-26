import { MouseEvent, useCallback } from 'react'

import { ContextMenuOption, Entry } from 'interfaces'
import { useAppSelector } from 'store'
import { selectIsFavorite } from 'store/favorite'
import {
  selectBackHistories,
  selectCurrentDirectory,
  selectCurrentSortOption,
  selectCurrentViewMode,
  selectForwardHistories,
  selectIsSidebarHidden,
  selectZephySchema,
} from 'store/window'

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
  const backHistories = useAppSelector(selectBackHistories)
  const currentDirectory = useAppSelector(selectCurrentDirectory)
  const currentSortOption = useAppSelector(selectCurrentSortOption)
  const currentViewMode = useAppSelector(selectCurrentViewMode)
  const forwardHistories = useAppSelector(selectForwardHistories)
  const isFavorite = useAppSelector(selectIsFavorite)
  const isSidebarHidden = useAppSelector(selectIsSidebarHidden)
  const zephySchema = useAppSelector(selectZephySchema)

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
        { id: 'separator' },
        { id: 'cut', params: { paths } },
        { id: 'copy', params: { paths } },
        {
          id: 'paste',
          params: { path: zephySchema ? undefined : currentDirectory },
        },
      ])
    },
    [currentDirectory, isFavorite, zephySchema],
  )

  const createCurrentDirectoryMenuHandler = useCallback(
    () =>
      createMenuHandler([
        {
          id: 'newFolder',
          params: { path: zephySchema ? undefined : currentDirectory },
        },
        { id: 'separator' },
        { id: 'cut', params: { paths: [] } },
        { id: 'copy', params: { paths: [] } },
        {
          id: 'paste',
          params: { path: zephySchema ? undefined : currentDirectory },
        },
        { id: 'separator' },
        { id: 'view', params: { viewMode: currentViewMode } },
        { id: 'separator' },
        {
          id: 'sortBy',
          params: { orderBy: currentSortOption.orderBy },
        },
      ]),
    [currentDirectory, currentSortOption.orderBy, currentViewMode, zephySchema],
  )

  const createMoreMenuHandler = useCallback(
    () =>
      createMenuHandler([
        {
          id: 'newFolder',
          params: { path: zephySchema ? undefined : currentDirectory },
        },
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
      zephySchema,
    ],
  )

  const createBackHistoryMenuHandler = useCallback(
    () =>
      createMenuHandler(
        backHistories.slice(0, 12).map((history, i) => ({
          id: 'go',
          params: {
            offset: -(i + 1),
            title: history.title,
          },
        })),
      ),
    [backHistories],
  )

  const createForwardHistoryMenuHandler = useCallback(
    () =>
      createMenuHandler(
        forwardHistories.slice(0, 12).map((history, i) => ({
          id: 'go',
          params: {
            offset: i + 1,
            title: history.title,
          },
        })),
      ),
    [forwardHistories],
  )

  return {
    createBackHistoryMenuHandler,
    createContentMenuHandler,
    createCurrentDirectoryMenuHandler,
    createEntryMenuHandler,
    createForwardHistoryMenuHandler,
    createMenuHandler,
    createMoreMenuHandler,
  }
}

export default useContextMenu
