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
import { open } from '~/store/settings'
import { changeUrl, selectUrlByTabId } from '~/store/window'
import { createContextMenuHandler } from '~/utils/context-menu'
import { getPath } from '~/utils/url'

const useExplorerItem = (tabId: number, content: Content) => {
  const contents = useAppSelector((state) =>
    selectContentsByTabId(state, tabId),
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
  const url = useAppSelector((state) => selectUrlByTabId(state, tabId))
  const dispatch = useAppDispatch()

  const { onClick, onDoubleClick } = usePreventClickOnDoubleClick(
    (e: MouseEvent) => {
      // NOTE: Prevent container event
      e.stopPropagation()
      if (e.shiftKey) {
        dispatch(addSelection(tabId, content.path, false))
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
      // NOTE: Prevent container event
      e.stopPropagation()
      if (editing) {
        return
      }
      content.type === 'directory'
        ? dispatch(changeUrl(content.url))
        : dispatch(open(content.path))
    },
  )

  const draggingPaths = useMemo(
    () => (editing ? [] : selected ? selectedPaths : [content.path]),
    [content.path, editing, selected, selectedPaths],
  )

  const directoryPath = useMemo(() => getPath(url), [url])

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
        data: { path: directoryPath },
      },
    ])
  }, [
    content.path,
    content.type,
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
