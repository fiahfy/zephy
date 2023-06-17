import { useAppSelector } from 'store'
import { selectIsFavorite } from 'store/favorite'
import {
  selectCurrentDirectory,
  selectCurrentSortOption,
  selectIsSidebarHidden,
  selectViewMode,
} from 'store/window'
import { openContextMenu } from 'utils/contextMenu'

export const useContextMenu = () => {
  const currentDirectory = useAppSelector(selectCurrentDirectory)
  const currentSortOption = useAppSelector(selectCurrentSortOption)
  const isFavorite = useAppSelector(selectIsFavorite)
  const isSidebarHidden = useAppSelector(selectIsSidebarHidden)
  const viewMode = useAppSelector(selectViewMode)

  const open = () => openContextMenu()

  const openEntry = (path: string, directory: boolean) =>
    openContextMenu([
      {
        id: directory ? 'openDirectory' : 'open',
        value: path,
      },
      {
        id: 'revealInFinder',
        value: path,
      },
      { id: 'separator' },
      {
        id: 'copyPath',
        value: path,
      },
      { id: 'separator' },
      ...(directory
        ? [
            {
              id: 'toggleFavorite',
              value: { path, favorite: isFavorite(path) },
            },
          ]
        : []),
      { id: 'separator' },
      {
        id: 'moveToTrash',
        value: path,
      },
    ])

  const openMore = () =>
    openContextMenu([
      { id: 'newFolder', value: currentDirectory },
      { id: 'revealInFinder', value: currentDirectory },
      { id: 'separator' },
      { id: 'asList', value: viewMode === 'list' },
      { id: 'asThumbnail', value: viewMode === 'thumbnail' },
      { id: 'separator' },
      { id: 'toggleNavigator', value: isSidebarHidden('primary') },
      { id: 'toggleInspector', value: isSidebarHidden('secondary') },
      { id: 'separator' },
      {
        id: 'sortBy',
        value: currentSortOption.orderBy,
      },
      { id: 'settings' },
    ])

  return { open, openEntry, openMore }
}
