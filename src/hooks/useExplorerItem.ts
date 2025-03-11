import { type MouseEvent, useMemo } from 'react'
import usePreventClickOnDoubleClick from '~/hooks/usePreventClickOnDoubleClick'
import type { Content } from '~/interfaces'
import { useAppDispatch, useAppSelector } from '~/store'
import {
  focus,
  multiSelect,
  rangeSelect,
  select,
  selectContentsByTabId,
  selectEditingByTabIdAndPath,
  selectFocusedByTabIdAndPath,
  selectSelectedByTabIdAndPath,
  selectSelectedContentsByTabId,
  startEditing,
} from '~/store/explorer-list'
import { selectFavorite, selectFavoriteByPath } from '~/store/favorite'
import { openEntry } from '~/store/settings'
import { changeDirectory, selectDirectoryPathByTabId } from '~/store/window'
import { createContextMenuHandler } from '~/utils/contextMenu'
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
  const selectedContents = useAppSelector((state) =>
    selectSelectedContentsByTabId(state, tabId),
  )
  const dispatch = useAppDispatch()

  const { onClick, onDoubleClick } = usePreventClickOnDoubleClick(
    (e: MouseEvent) => {
      // prevent container event
      e.stopPropagation()
      if (e.shiftKey) {
        dispatch(rangeSelect(tabId, content.path))
      } else if ((e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)) {
        dispatch(multiSelect(tabId, content.path))
      } else {
        dispatch(select(tabId, content.path))
      }
      dispatch(focus(tabId, content.path))
    },
    () => {
      if (
        !editing &&
        selectedContents.length === 1 &&
        selectedContents[0]?.path === content.path
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

  const draggingContents = useMemo(
    () => (editing ? [] : selected ? selectedContents : [content]),
    [content, editing, selected, selectedContents],
  )

  const zephySchema = useMemo(
    () => isZephySchema(directoryPath),
    [directoryPath],
  )

  const onContextMenu = useMemo(() => {
    const directory = content.type === 'directory'
    const path = content.path
    const selectedPaths = selectedContents.map((content) => content.path)
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
    selectedContents,
    tabId,
    zephySchema,
  ])

  return {
    contents,
    draggingContents,
    editing,
    focused: focused && !editing,
    onClick,
    onContextMenu,
    onDoubleClick,
    selected,
  }
}

export default useExplorerItem
