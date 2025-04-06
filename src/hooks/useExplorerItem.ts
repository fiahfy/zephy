import { type MouseEvent, useMemo } from 'react'
import usePreventClickOnDoubleClick from '~/hooks/usePreventClickOnDoubleClick'
import type { Content } from '~/interfaces'
import { useAppDispatch, useAppSelector } from '~/store'
import {
  addSelection,
  focus,
  select,
  selectContentsByTabId,
  selectEditingByTabIdAndPath,
  selectFocusedByTabIdAndPath,
  selectSelectedByTabId,
  selectSelectedByTabIdAndPath,
  startEditing,
  toggleSelection,
} from '~/store/explorer-list'
import { selectFavorite, selectFavoriteByPath } from '~/store/favorite'
import { openEntry } from '~/store/settings'
import { changeDirectory, selectDirectoryPathByTabId } from '~/store/window'
import { createContextMenuHandler } from '~/utils/context-menu'
import { isZephySchema } from '~/utils/url'

const useExplorerItem = (tabId: number, content: Content) => {
  const contents = useAppSelector((state) =>
    selectContentsByTabId(state, tabId),
  )
  const directoryPath = useAppSelector((state) =>
    selectDirectoryPathByTabId(state, tabId),
  )
  const editing = useAppSelector((state) =>
    selectEditingByTabIdAndPath(state, tabId, content.path),
  )
  const favorite = useAppSelector((state) =>
    selectFavoriteByPath(selectFavorite(state), content.path),
  )
  const focused = useAppSelector((state) =>
    selectFocusedByTabIdAndPath(state, tabId, content.path),
  )
  const selected = useAppSelector((state) =>
    selectSelectedByTabIdAndPath(state, tabId, content.path),
  )
  const selectedPaths = useAppSelector((state) =>
    selectSelectedByTabId(state, tabId),
  )
  const dispatch = useAppDispatch()

  const { onClick, onDoubleClick } = usePreventClickOnDoubleClick(
    (e: MouseEvent) => {
      // prevent container event
      e.stopPropagation()
      if (e.shiftKey) {
        dispatch(
          addSelection(
            tabId,
            content.path,
            selectedPaths[selectedPaths.length - 1],
          ),
        )
      } else if ((e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)) {
        dispatch(toggleSelection(tabId, content.path))
      } else {
        dispatch(select(tabId, content.path))
      }
      dispatch(focus(tabId, content.path))
    },
    () => {
      if (
        !editing &&
        selectedPaths.length === 1 &&
        selectedPaths[0] === content.path
      ) {
        dispatch(startEditing(tabId, content.path))
      }
    },
    async (e: MouseEvent) => {
      // prevent container event
      e.stopPropagation()
      if (editing) {
        return
      }
      content.type === 'directory'
        ? dispatch(changeDirectory(content.path))
        : dispatch(openEntry(content.path))
    },
  )

  const draggingPaths = useMemo(
    () => (editing ? [] : selected ? selectedPaths : [content.path]),
    [content.path, editing, selected, selectedPaths],
  )

  const zephySchema = useMemo(
    () => isZephySchema(directoryPath),
    [directoryPath],
  )

  const onContextMenu = useMemo(() => {
    const directory = content.type === 'directory'
    const path = content.path
    const paths = selectedPaths.includes(path) ? selectedPaths : [path]
    return createContextMenuHandler([
      ...(paths.length === 1
        ? [
            {
              type: 'open',
              data: { path },
            },
            ...(directory
              ? [
                  {
                    type: 'openInNewWindow',
                    data: { path },
                  },
                  {
                    type: 'openInNewTab',
                    data: { path, tabId },
                  },
                ]
              : []),
            {
              type: 'revealInExplorer',
              data: { path },
            },
            {
              type: 'revealInFinder',
              data: { path },
            },
            { type: 'separator' },
            {
              type: 'copyPath',
              data: { path },
            },
            { type: 'separator' },
            ...(directory
              ? [
                  {
                    type: 'toggleFavorite',
                    data: { path, favorite },
                  },
                ]
              : []),
            { type: 'separator' },
            {
              type: 'rename',
              data: { path },
            },
          ]
        : []),
      {
        type: 'moveToTrash',
        data: { paths },
      },
      { type: 'separator' },
      { type: 'cutEntries', data: { paths } },
      { type: 'copyEntries', data: { paths } },
      {
        type: 'pasteEntries',
        data: { path: zephySchema ? undefined : directoryPath },
      },
    ])
  }, [
    content.path,
    content.type,
    directoryPath,
    favorite,
    selectedPaths,
    tabId,
    zephySchema,
  ])

  return {
    contents,
    draggingPaths,
    editing,
    focused: focused && !editing,
    onClick,
    onContextMenu,
    onDoubleClick,
    selected,
  }
}

export default useExplorerItem
