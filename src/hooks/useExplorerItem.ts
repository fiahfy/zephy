import { MouseEvent, useMemo } from 'react'
import usePreventClickOnDoubleClick from '~/hooks/usePreventClickOnDoubleClick'
import { Content } from '~/interfaces'
import { useAppDispatch, useAppSelector } from '~/store'
import {
  focus,
  multiSelect,
  rangeSelect,
  select,
  selectIsEditing,
  selectIsFocused,
  selectIsSelected,
  selectSelectedContents,
  startEditing,
} from '~/store/explorer'
import { selectIsFavorite } from '~/store/favorite'
import {
  changeDirectory,
  selectCurrentDirectoryPath,
  selectZephySchema,
} from '~/store/window'
import { createMenuHandler } from '~/utils/contextMenu'

const useExplorerItem = (content: Content) => {
  const currentDirectoryPath = useAppSelector(selectCurrentDirectoryPath)
  const isEditing = useAppSelector(selectIsEditing)
  const isFavorite = useAppSelector(selectIsFavorite)
  const isFocused = useAppSelector(selectIsFocused)
  const isSelected = useAppSelector(selectIsSelected)
  const selectedContents = useAppSelector(selectSelectedContents)
  const zephySchema = useAppSelector(selectZephySchema)
  const dispatch = useAppDispatch()

  const focused = useMemo(
    () => isFocused(content.path),
    [content.path, isFocused],
  )
  const selected = useMemo(
    () => isSelected(content.path),
    [content.path, isSelected],
  )

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
        !isEditing(content.path) &&
        selectedContents.length === 1 &&
        selectedContents[0]?.path === content.path
      ) {
        dispatch(startEditing(content.path))
      }
    },
    async (e: MouseEvent) => {
      // prevent container event
      e.stopPropagation()
      if (isEditing(content.path)) {
        return
      }
      content.type === 'directory'
        ? dispatch(changeDirectory(content.path))
        : await window.electronAPI.openEntry(content.path)
    },
  )

  const onContextMenu = useMemo(() => {
    const directory = content.type === 'directory'
    const path = content.path
    const selectedPaths = selectedContents.map((content) => content.path)
    const paths = selectedPaths.includes(path) ? selectedPaths : [path]
    return createMenuHandler([
      ...(paths.length === 1
        ? [
            {
              type: directory ? 'openDirectory' : 'open',
              data: { path },
            },
            ...(directory
              ? [
                  {
                    type: 'openDirectoryInNewWindow',
                    data: { path },
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
                    data: { path, favorite: isFavorite(path) },
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
      { type: 'cut', data: { paths } },
      { type: 'copy', data: { paths } },
      {
        type: 'paste',
        data: { path: zephySchema ? undefined : currentDirectoryPath },
      },
    ])
  }, [
    content.path,
    content.type,
    currentDirectoryPath,
    isFavorite,
    selectedContents,
    zephySchema,
  ])

  return {
    focused,
    onClick,
    onContextMenu,
    onDoubleClick,
    selected,
  }
}

export default useExplorerItem
