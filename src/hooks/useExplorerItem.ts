import { type MouseEvent, useCallback, useMemo } from 'react'
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
import {
  changeUrl,
  newTab,
  openUrl,
  selectDirectoryPathByTabId,
} from '~/store/window'
import { createContextMenuHandler } from '~/utils/context-menu'

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
      // NOTE: Prevent container event
      e.stopPropagation()
      if (e.shiftKey) {
        dispatch(addSelection(tabId, content.path, false))
      } else if ((e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)) {
        dispatch(toggleSelection({ tabId, path: content.path }))
      } else {
        dispatch(select({ tabId, path: content.path }))
      }
      dispatch(focus({ tabId, path: content.path }))
    },
    (e) => {
      if (!selected) {
        return
      }
      if ((e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)) {
        // noop
      } else {
        dispatch(startEditing({ tabId, path: content.path }))
      }
    },
    async (e: MouseEvent) => {
      // NOTE: Prevent container event
      e.stopPropagation()
      if (editing) {
        return
      }
      if (content.type === 'directory') {
        if ((e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)) {
          dispatch(newTab(content.url, tabId))
        } else {
          dispatch(changeUrl(content.url))
        }
      } else {
        dispatch(openUrl(content.url))
      }
    },
  )

  const draggingPaths = useMemo(
    () => (editing ? [] : selected ? selectedPaths : [content.path]),
    [content.path, editing, selected, selectedPaths],
  )

  const onContextMenu = useMemo(() => {
    const directory = content.type === 'directory'
    const url = content.url
    const path = content.path
    const paths = selectedPaths.includes(path) ? selectedPaths : [path]
    return createContextMenuHandler([
      ...(paths.length === 1
        ? [
            {
              type: 'open',
              data: { url },
            },
            ...(directory
              ? [
                  {
                    type: 'openInNewWindow',
                    data: { url },
                  },
                  {
                    type: 'openInNewTab',
                    data: { url, tabId },
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
        data: { path: directoryPath },
      },
    ])
  }, [
    content.path,
    content.type,
    content.url,
    directoryPath,
    favorite,
    selectedPaths,
    tabId,
  ])

  const onMouseDown = useCallback(
    (e: MouseEvent) => {
      if (editing) {
        e.preventDefault()
      }
    },
    [editing],
  )

  return {
    contents,
    draggingPaths,
    editing,
    focused: focused && !editing,
    onClick,
    onContextMenu,
    onDoubleClick,
    onMouseDown,
    selected,
  }
}

export default useExplorerItem
