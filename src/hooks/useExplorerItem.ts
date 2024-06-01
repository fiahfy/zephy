import {
  KeyboardEvent,
  MouseEvent,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
} from 'react'
import useExplorer from '~/hooks/useExplorer'
import usePreventClickOnDoubleClick from '~/hooks/usePreventClickOnDoubleClick'
import usePrevious from '~/hooks/usePrevious'
import { Content } from '~/interfaces'
import { useAppDispatch, useAppSelector } from '~/store'
import {
  focus,
  multiSelect,
  rangeSelect,
  select,
  selectContentsByTabId,
  selectEditingByPath,
  selectFocusedByPath,
  selectSelectedByPath,
  selectSelectedContentsByTabId,
  startEditing,
} from '~/store/explorer'
import { selectFavorite, selectFavoriteByPath } from '~/store/favorite'
import { openEntry } from '~/store/settings'
import { changeDirectory, selectDirectoryPathByTabId } from '~/store/window'
import { createContextMenuHandler } from '~/utils/contextMenu'
import { isZephySchema } from '~/utils/url'

const useExplorerItem = (
  tabId: number,
  content: Content,
  ref?: RefObject<HTMLElement>,
) => {
  const contents = useAppSelector((state) =>
    selectContentsByTabId(state, tabId),
  )
  const directoryPath = useAppSelector((state) =>
    selectDirectoryPathByTabId(state, tabId),
  )
  const editing = useAppSelector((state) =>
    selectEditingByPath(state, tabId, content.path),
  )
  const favorite = useAppSelector((state) =>
    selectFavoriteByPath(selectFavorite(state), content.path),
  )
  const focused = useAppSelector((state) =>
    selectFocusedByPath(state, tabId, content.path),
  )
  const selected = useAppSelector((state) =>
    selectSelectedByPath(state, tabId, content.path),
  )
  const selectedContents = useAppSelector((state) =>
    selectSelectedContentsByTabId(state, tabId),
  )
  const dispatch = useAppDispatch()

  const { columns } = useExplorer()

  const { onClick, onDoubleClick } = usePreventClickOnDoubleClick(
    (e: MouseEvent) => {
      // prevent container event
      e.stopPropagation()
      if (e.shiftKey) {
        dispatch(rangeSelect(content.path))
      } else if ((e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)) {
        dispatch(multiSelect(content.path))
      } else {
        dispatch(select(content.path))
      }
      dispatch(focus(content.path))
    },
    () => {
      if (
        !editing &&
        selectedContents.length === 1 &&
        selectedContents[0]?.path === content.path
      ) {
        dispatch(startEditing(content.path))
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

  const previousEditing = usePrevious(editing)

  useEffect(() => {
    const el = ref?.current
    if (!el) {
      return
    }
    if (focused) {
      el.focus()
    }
  }, [focused, ref])

  useEffect(() => {
    const el = ref?.current
    if (!el) {
      return
    }
    if (focused && previousEditing && !editing) {
      el.focus()
    }
  }, [editing, focused, previousEditing, ref])

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

  const focusBy = useCallback(
    (rowOffset: number, columnOffset: number) => {
      const index = contents.findIndex((c) => c.path === content.path)
      const rowIndex = Math.floor(index / columns)
      const columnIndex = index % columns
      const newContent =
        index >= 0
          ? contents[
              columns * (rowIndex + rowOffset) + columnIndex + columnOffset
            ]
          : contents[0]
      if (newContent) {
        dispatch(select(newContent.path))
        dispatch(focus(newContent.path))
      }
    },
    [columns, content.path, contents, dispatch],
  )

  const focusTo = useCallback(
    (position: 'first' | 'last') => {
      const content = contents[position === 'first' ? 0 : contents.length - 1]
      if (content) {
        dispatch(select(content.path))
        dispatch(focus(content.path))
      }
    },
    [contents, dispatch],
  )

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Enter':
          if (!e.nativeEvent.isComposing) {
            dispatch(startEditing(content.path))
          }
          return
        case 'ArrowUp':
          e.preventDefault()
          return (e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)
            ? focusTo('first')
            : focusBy(-1, 0)
        case 'ArrowDown':
          e.preventDefault()
          return (e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)
            ? focusTo('last')
            : focusBy(1, 0)
        case 'ArrowLeft':
          e.preventDefault()
          return focusBy(0, -1)
        case 'ArrowRight':
          e.preventDefault()
          return focusBy(0, 1)
        case 'Tab':
          e.preventDefault()
          return focusBy(0, e.shiftKey ? -1 : 1)
      }
    },
    [content.path, dispatch, focusBy, focusTo],
  )

  return {
    contents,
    draggingContents,
    editing,
    focused,
    onClick,
    onContextMenu,
    onDoubleClick,
    onKeyDown,
    selected,
  }
}

export default useExplorerItem
