import { useAppSelector } from 'store'
import { selectIsFavorite } from 'store/favorite'
import {
  selectCurrentDirectory,
  selectCurrentSortOption,
  selectIsSidebarHidden,
  selectSelected,
  selectViewMode,
} from 'store/window'
import { openContextMenu } from 'utils/contextMenu'

export const useContextMenu = () => {
  const currentDirectory = useAppSelector(selectCurrentDirectory)
  const currentSortOption = useAppSelector(selectCurrentSortOption)
  const isFavorite = useAppSelector(selectIsFavorite)
  const isSidebarHidden = useAppSelector(selectIsSidebarHidden)
  const selected = useAppSelector(selectSelected)
  const viewMode = useAppSelector(selectViewMode)

  const open = () => openContextMenu()

  const openEntry = (path: string, directory: boolean) =>
    openContextMenu([
      {
        id: directory ? 'openDirectory' : 'open',
        params: { path },
      },
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
        params: { path },
      },
    ])

  const openEntryOnContents = (path: string, directory: boolean) => {
    const paths = selected.includes(path) ? selected : [path]
    return openContextMenu([
      ...(paths.length === 1
        ? [
            {
              id: directory ? 'openDirectory' : 'open',
              params: { path },
            },
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
          ]
        : []),
      { id: 'separator' },
      {
        id: 'moveToTrash',
        params: { paths },
      },
    ])
  }

  const openMore = () =>
    openContextMenu([
      { id: 'newFolder', params: { path: currentDirectory } },
      { id: 'revealInFinder', params: { path: currentDirectory } },
      { id: 'separator' },
      { id: 'asList', params: { checked: viewMode === 'list' } },
      { id: 'asThumbnail', params: { checked: viewMode === 'thumbnail' } },
      { id: 'separator' },
      { id: 'toggleNavigator', params: { hidden: isSidebarHidden('primary') } },
      {
        id: 'toggleInspector',
        params: { hidden: isSidebarHidden('secondary') },
      },
      { id: 'separator' },
      {
        id: 'sortBy',
        params: { orderBy: currentSortOption.orderBy },
      },
      { id: 'settings' },
    ])

  return { open, openEntry, openEntryOnContents, openMore }
}
