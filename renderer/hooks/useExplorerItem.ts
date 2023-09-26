import { MouseEvent, useMemo } from 'react'
import useContextMenu from '~/hooks/useContextMenu'
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
  selectCurrentDirectory,
  selectZephySchema,
} from '~/store/window'

const useExplorerItem = (content: Content) => {
  const currentDirectory = useAppSelector(selectCurrentDirectory)
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
        : await window.electronAPI.openPath(content.path)
    },
  )

  const { createMenuHandler } = useContextMenu()

  const onContextMenu = useMemo(() => {
    const directory = content.type === 'directory'
    const path = content.path
    const selectedPaths = selectedContents.map((content) => content.path)
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
  }, [
    content.path,
    content.type,
    createMenuHandler,
    currentDirectory,
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
