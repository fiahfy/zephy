import { MouseEvent, useMemo } from 'react'
import usePreventClickOnDoubleClick from '~/hooks/usePreventClickOnDoubleClick'
import { Content } from '~/interfaces'
import { useAppDispatch, useAppSelector } from '~/store'
import {
  focus,
  multiSelect,
  rangeSelect,
  select,
  selectGetSelectedContents,
  selectIsEditing,
  selectIsFocused,
  selectIsSelected,
  startEditing,
} from '~/store/explorer'
import { selectIsFavorite } from '~/store/favorite'
import { openEntry } from '~/store/settings'
import { changeDirectory, selectGetDirectoryPath } from '~/store/window'
import { createContextMenuHandler } from '~/utils/contextMenu'
import { isZephySchema } from '~/utils/url'

const useExplorerItem = (tabIndex: number, content: Content) => {
  const directoryPath = useAppSelector(selectGetDirectoryPath)(tabIndex)
  const editing = useAppSelector(selectIsEditing)(tabIndex, content.path)
  const favorite = useAppSelector(selectIsFavorite)(content.path)
  const focused = useAppSelector(selectIsFocused)(tabIndex, content.path)
  const selected = useAppSelector(selectIsSelected)(tabIndex, content.path)
  const selectedContents = useAppSelector(selectGetSelectedContents)(tabIndex)
  const dispatch = useAppDispatch()

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
              type: directory ? 'openDirectory' : 'open',
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
                    data: { path, tabIndex },
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
    tabIndex,
    zephySchema,
  ])

  return {
    editing,
    focused,
    onClick,
    onContextMenu,
    onDoubleClick,
    selected,
  }
}

export default useExplorerItem
